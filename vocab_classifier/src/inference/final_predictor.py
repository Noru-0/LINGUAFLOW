"""Production predictor loading the finalized Frozen MiniLM + LogReg package."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import joblib
import numpy as np
import torch

from src.data.common import PACKAGE_ROOT, load_json, load_taxonomy
from src.data.preprocess import build_model_text
from src.models.baselines import encode_frozen_minilm
from src.models.hierarchical_classifier import load_encoder_and_tokenizer

DEFAULT_FINAL_MODEL_DIR = PACKAGE_ROOT / "final_model"


def softmax_2d(logits: np.ndarray, temperature: float = 1.0) -> np.ndarray:
    """Compute numerically stable row-wise softmax over 2D logits."""
    scaled = logits / max(float(temperature), 1e-6)
    shifted = scaled - np.max(scaled, axis=1, keepdims=True)
    exps = np.exp(shifted)
    return exps / np.sum(exps, axis=1, keepdims=True)


def extract_logreg_log_probs(
    clf: Any,
    X: np.ndarray,
    num_classes: int,
    *,
    class_indices: list[int] | None = None,
) -> np.ndarray:
    """Extract full-width log-probabilities [N, num_classes] from a fitted sklearn classifier."""
    logits = np.full((X.shape[0], num_classes), -1e9, dtype=np.float64)
    if hasattr(clf, "predict_proba"):
        probs = np.clip(clf.predict_proba(X), 1e-12, 1.0)
        log_p = np.log(probs)
        for col_idx, cls_id in enumerate(clf.classes_):
            logits[:, int(cls_id)] = log_p[:, col_idx]
    else:
        # Constant fallback model
        targets = class_indices or [int(clf.classes_[0])]
        for cls_id in targets:
            logits[:, int(cls_id)] = 0.0
    return logits


class ProductionVocabPredictor:
    """Self-contained predictor for the finalized Frozen MiniLM + LogReg package.

    Default prediction uses Top-1 Main Topic and its constrained child Subtopic,
    while also returning Top-3 Main Topic candidates and expanded Top-3 Subtopic
    candidates for human review or optional reranking, plus threshold-based abstention.
    """

    def __init__(
        self,
        *,
        encoder: Any,
        tokenizer: Any,
        main_clf: Any,
        sub_clfs: dict[int, Any],
        taxonomy: dict[str, Any],
        preprocessing_cfg: dict[str, Any],
        inference_cfg: dict[str, Any],
        temperatures: dict[str, Any],
        device: str | None = None,
    ) -> None:
        self.encoder = encoder
        self.tokenizer = tokenizer
        self.main_clf = main_clf
        self.sub_clfs = sub_clfs
        self.taxonomy = taxonomy
        self.preprocessing_cfg = preprocessing_cfg
        self.inference_cfg = inference_cfg
        self.temperatures = temperatures
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")

        self.main_temp = float(temperatures.get("main_temperature", 1.0))
        self.sub_temp = float(temperatures.get("subtopic_temperature", 1.0))
        self.top_k_main = int(inference_cfg.get("top_k_main", 3))
        self.top_k_sub = int(inference_cfg.get("top_k_subtopic", 3))
        self.main_threshold = float(inference_cfg.get("main_confidence_threshold", 0.60))
        self.joint_threshold = float(inference_cfg.get("joint_confidence_threshold", 0.30))

    @classmethod
    def from_dir(
        cls,
        model_dir: Path | str = DEFAULT_FINAL_MODEL_DIR,
        *,
        device: str | None = None,
    ) -> ProductionVocabPredictor:
        """Load complete finalized model bundle from `final_model/`."""
        root = Path(model_dir)
        preprocessing_cfg = load_json(root / "config" / "preprocessing.json")
        inference_cfg = load_json(root / "config" / "inference.json")
        temperatures = load_json(root / "calibration" / "temperatures.json")
        taxonomy = load_taxonomy(root / "config" / "taxonomy.json")

        enc_dir = root / "encoder" / "all-MiniLM-L6-v2"
        enc_source = str(enc_dir) if enc_dir.exists() else preprocessing_cfg["encoder"]["model_name"]
        encoder, tokenizer = load_encoder_and_tokenizer(enc_source)

        main_clf = joblib.load(root / "main_classifier" / "model.joblib")
        sub_index = load_json(root / "subtopic_classifiers" / "index.json")
        sub_clfs = {
            int(main_label_id): joblib.load(root / "subtopic_classifiers" / rel_file)
            for main_label_id, rel_file in sub_index["by_main_label_id"].items()
        }
        return cls(
            encoder=encoder,
            tokenizer=tokenizer,
            main_clf=main_clf,
            sub_clfs=sub_clfs,
            taxonomy=taxonomy,
            preprocessing_cfg=preprocessing_cfg,
            inference_cfg=inference_cfg,
            temperatures=temperatures,
            device=device,
        )

    def encode_records(self, records: list[dict[str, Any]]) -> np.ndarray:
        """Format records according to preprocessing.json and extract 384-d MiniLM embeddings."""
        inc_ex = bool(self.preprocessing_cfg.get("include_examples", True))
        inc_col = bool(self.preprocessing_cfg.get("include_collocations", True))
        texts = [
            r["text"]
            if (inc_ex and inc_col and r.get("text"))
            else build_model_text(r, include_examples=inc_ex, include_collocations=inc_col)
            for r in records
        ]
        enc_cfg = self.preprocessing_cfg.get("encoder", {})
        return encode_frozen_minilm(
            texts,
            model_name=enc_cfg.get("model_name", "sentence-transformers/all-MiniLM-L6-v2"),
            max_length=int(enc_cfg.get("max_length", 192)),
            batch_size=int(enc_cfg.get("batch_size", 64)),
            pooling=enc_cfg.get("pooling", "mean"),
            normalize=bool(enc_cfg.get("normalize", True)),
            device=self.device,
            encoder=self.encoder,
            tokenizer=self.tokenizer,
        )

    def predict_from_embeddings(
        self,
        X: np.ndarray,
        *,
        main_threshold: float | None = None,
        joint_threshold: float | None = None,
    ) -> list[dict[str, Any]]:
        """Run calibrated hierarchical Top-1 prediction + Top-3 candidate sets + abstention."""
        if X.shape[0] == 0:
            return []

        m_thresh = self.main_threshold if main_threshold is None else float(main_threshold)
        j_thresh = self.joint_threshold if joint_threshold is None else float(joint_threshold)

        num_main = len(self.taxonomy["label2id"])
        num_sub = len(self.taxonomy["subtopic2id"])
        id2label: dict[int, str] = self.taxonomy["id2label"]
        name_to_id: dict[str, str] = self.taxonomy["name_to_id"]
        topic_type_map: dict[str, str] = self.taxonomy["topic_type_map"]
        id2subtopic: dict[int, str] = self.taxonomy["id2subtopic"]
        subtopic_id_to_name: dict[str, str] = self.taxonomy["subtopic_id_to_name"]

        main_logits = extract_logreg_log_probs(self.main_clf, X, num_main)
        main_probs = softmax_2d(main_logits, temperature=self.main_temp)

        # Precompute calibrated child subtopic probabilities per main_topic_id across all samples
        sub_probs_by_main: dict[int, np.ndarray] = {}
        for main_idx, sub_clf in self.sub_clfs.items():
            sub_logits = extract_logreg_log_probs(sub_clf, X, num_sub)
            sub_probs_by_main[main_idx] = softmax_2d(sub_logits, temperature=self.sub_temp)

        results: list[dict[str, Any]] = []
        valid_main_set = set(sub_probs_by_main.keys())

        for i in range(X.shape[0]):
            m_order = [int(m) for m in np.argsort(-main_probs[i]) if int(m) in valid_main_set]
            top1_m = m_order[0]
            top1_m_prob = float(main_probs[i, top1_m])

            # Default prediction strictly uses Top-1 Main Topic + constrained Top-1 Subtopic
            s_probs_top1 = sub_probs_by_main[top1_m][i]
            s_order_top1 = np.argsort(-s_probs_top1)
            top1_s = int(s_order_top1[0])
            top1_s_prob = float(s_probs_top1[top1_s])
            joint_conf = top1_m_prob * top1_s_prob

            # Top-3 Main Topic candidates + Top-3 expanded joint candidates for review/reranking
            top_k_main_cands = []
            expanded_cands = []
            k_main = min(self.top_k_main, len(m_order))
            for rank, m_idx in enumerate(m_order[:k_main], start=1):
                m_prob = float(main_probs[i, m_idx])
                m_name = id2label[m_idx]
                top_k_main_cands.append(
                    {
                        "rank": rank,
                        "main_topic": m_name,
                        "main_topic_id": name_to_id[m_name],
                        "main_label_id": m_idx,
                        "probability": round(m_prob, 4),
                    }
                )
                s_probs_m = sub_probs_by_main[m_idx][i]
                for s_idx_np in np.argsort(-s_probs_m):
                    s_idx = int(s_idx_np)
                    s_prob = float(s_probs_m[s_idx])
                    if s_prob <= 1e-8:
                        continue
                    sub_id = id2subtopic[s_idx]
                    expanded_cands.append(
                        {
                            "main_topic": m_name,
                            "main_topic_id": name_to_id[m_name],
                            "main_label_id": m_idx,
                            "subtopic": subtopic_id_to_name[sub_id],
                            "subtopic_id": sub_id,
                            "subtopic_label_id": s_idx,
                            "main_prob": round(m_prob, 4),
                            "sub_prob_given_main": round(s_prob, 4),
                            "joint_prob": round(m_prob * s_prob, 4),
                        }
                    )

            expanded_cands.sort(key=lambda c: -c["joint_prob"])
            for rk, item in enumerate(expanded_cands[: self.top_k_sub], start=1):
                item["rank"] = rk

            top_k_sub_within_top1 = []
            for rk, s_idx_np in enumerate(s_order_top1[: self.top_k_sub], start=1):
                s_idx = int(s_idx_np)
                s_prob = float(s_probs_top1[s_idx])
                if s_prob <= 1e-8:
                    continue
                sub_id = id2subtopic[s_idx]
                top_k_sub_within_top1.append(
                    {
                        "rank": rk,
                        "subtopic": subtopic_id_to_name[sub_id],
                        "subtopic_id": sub_id,
                        "subtopic_label_id": s_idx,
                        "probability": round(s_prob, 4),
                    }
                )

            reasons: list[str] = []
            if top1_m_prob < m_thresh:
                reasons.append("low_main_confidence")
            if joint_conf < j_thresh:
                reasons.append("low_joint_confidence")
            abstained = len(reasons) > 0

            main_name = id2label[top1_m]
            sub_id = id2subtopic[top1_s]
            results.append(
                {
                    "main_topic": main_name,
                    "main_topic_id": name_to_id[main_name],
                    "main_label_id": top1_m,
                    "topic_type": topic_type_map[main_name],
                    "main_topic_confidence": round(top1_m_prob, 4),
                    "subtopic": subtopic_id_to_name[sub_id],
                    "subtopic_id": sub_id,
                    "subtopic_label_id": top1_s,
                    "subtopic_confidence": round(top1_s_prob, 4),
                    "joint_confidence": round(joint_conf, 4),
                    "abstained": abstained,
                    "review_status": "needs_review" if abstained else "accepted",
                    "abstention_reasons": reasons,
                    "top_k_main_candidates": top_k_main_cands,
                    "top_k_subtopic_candidates": top_k_sub_within_top1,
                    "top_k_expanded_candidates": expanded_cands[: self.top_k_sub],
                }
            )
        return results

    def predict(
        self,
        records: list[dict[str, Any]],
        *,
        main_threshold: float | None = None,
        joint_threshold: float | None = None,
    ) -> list[dict[str, Any]]:
        """Encode vocabulary records and run production hierarchical prediction."""
        if not records:
            return []
        X = self.encode_records(records)
        return self.predict_from_embeddings(
            X,
            main_threshold=main_threshold,
            joint_threshold=joint_threshold,
        )
