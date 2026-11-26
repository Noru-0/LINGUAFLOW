"""Stage 4: Top-K hierarchical inference, temperature calibration, and abstention."""

from __future__ import annotations

import argparse
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

import numpy as np
import torch
import torch.nn.functional as F
from torch.utils.data import DataLoader

from src.data.common import DEFAULT_TAXONOMY_PATH, PACKAGE_ROOT, load_json, load_records, load_taxonomy, save_json
from src.data.preprocess import build_model_text
from src.evaluation.metrics import compute_classification_metrics
from src.models.hierarchical_classifier import (
    HierarchicalVocabClassifier,
    apply_hierarchy_mask,
    load_encoder_and_tokenizer,
)
from src.training.train_minilm import DEFAULT_TRAIN_CONFIG_PATH, VocabSenseDataset, _make_collate_fn

DEFAULT_FINETUNED_CKPT_DIR = PACKAGE_ROOT / "artifacts" / "minilm_finetuned" / "best_model"
DEFAULT_EXPERIMENTS_DIR = PACKAGE_ROOT / "artifacts" / "experiments"


@dataclass
class CalibrationParams:
    """Scalar temperature scaling parameters for Main Topic and Subtopic logits."""

    main_temperature: float = 1.0
    subtopic_temperature: float = 1.0

    @classmethod
    def from_json(cls, path: Path | str) -> CalibrationParams:
        raw = load_json(path)
        return cls(
            main_temperature=float(raw.get("main_temperature", 1.0)),
            subtopic_temperature=float(raw.get("subtopic_temperature", 1.0)),
        )

    def to_json(self, path: Path | str) -> Path:
        return save_json(asdict(self), path)


def _optimize_temperature(logits: torch.Tensor, labels: torch.Tensor) -> float:
    """Find scalar temperature T > 0 minimizing negative log-likelihood on validation logits."""
    if logits.numel() == 0 or labels.numel() == 0:
        return 1.0
    log_temp = torch.zeros(1, dtype=torch.float32, requires_grad=True)
    optimizer = torch.optim.LBFGS([log_temp], lr=0.1, max_iter=50)

    def _closure() -> torch.Tensor:
        optimizer.zero_grad()
        temp = torch.exp(log_temp).clamp(min=0.05, max=10.0)
        loss = F.cross_entropy(logits / temp, labels)
        loss.backward()
        return loss

    optimizer.step(_closure)
    with torch.no_grad():
        return round(float(torch.exp(log_temp).clamp(min=0.05, max=10.0).item()), 4)


def _expected_calibration_error(probs: np.ndarray, labels: np.ndarray, n_bins: int = 10) -> float:
    """Compute Expected Calibration Error (ECE) over predicted confidence bins."""
    if len(labels) == 0:
        return 0.0
    confs = probs.max(axis=1)
    preds = probs.argmax(axis=1)
    accs = (preds == labels).astype(float)
    ece = 0.0
    bins = np.linspace(0.0, 1.0, n_bins + 1)
    for idx in range(n_bins):
        lo, hi = bins[idx], bins[idx + 1]
        mask = (confs >= lo) & (confs <= hi if idx == n_bins - 1 else confs < hi)
        if np.any(mask):
            ece += float(np.mean(mask)) * abs(float(np.mean(accs[mask])) - float(np.mean(confs[mask])))
    return round(float(ece), 4)


@torch.no_grad()
def _collect_val_logits(
    model: HierarchicalVocabClassifier,
    dataloader: DataLoader,
    device: str | torch.device = "cpu",
) -> tuple[torch.Tensor, torch.Tensor, torch.Tensor, torch.Tensor]:
    model.eval()
    main_logits_all, sub_logits_all, main_y_all, sub_y_all = [], [], [], []
    for batch in dataloader:
        input_ids = batch["input_ids"].to(device)
        attention_mask = batch["attention_mask"].to(device)
        main_y = batch["main_labels"].to(device)
        out = model(input_ids, attention_mask, given_main_labels=main_y)
        main_logits_all.append(out["main_logits"].cpu())
        sub_logits_all.append(out["masked_subtopic_logits"].cpu())
        main_y_all.append(batch["main_labels"].cpu())
        sub_y_all.append(batch["eval_subtopic_labels"].cpu())
    return (
        torch.cat(main_logits_all, dim=0),
        torch.cat(sub_logits_all, dim=0),
        torch.cat(main_y_all, dim=0),
        torch.cat(sub_y_all, dim=0),
    )


def fit_temperature_scaling(
    model: HierarchicalVocabClassifier,
    val_loader: DataLoader,
    *,
    device: str | torch.device = "cpu",
) -> tuple[CalibrationParams, dict[str, float]]:
    """Fit temperature scaling on validation logits and report ECE before/after."""
    main_logits, sub_logits, main_y, sub_y = _collect_val_logits(model, val_loader, device=device)

    t_main = _optimize_temperature(main_logits, main_y)
    t_sub = _optimize_temperature(sub_logits, sub_y)
    params = CalibrationParams(main_temperature=t_main, subtopic_temperature=t_sub)

    main_probs_before = F.softmax(main_logits, dim=-1).numpy()
    main_probs_after = F.softmax(main_logits / t_main, dim=-1).numpy()
    sub_probs_before = F.softmax(sub_logits, dim=-1).numpy()
    sub_probs_after = F.softmax(sub_logits / t_sub, dim=-1).numpy()

    stats = {
        "main_temperature": t_main,
        "subtopic_temperature": t_sub,
        "val_main_nll_before": round(float(F.cross_entropy(main_logits, main_y).item()), 4),
        "val_main_nll_after": round(float(F.cross_entropy(main_logits / t_main, main_y).item()), 4),
        "val_main_ece_before": _expected_calibration_error(main_probs_before, main_y.numpy()),
        "val_main_ece_after": _expected_calibration_error(main_probs_after, main_y.numpy()),
        "val_sub_ece_before": _expected_calibration_error(sub_probs_before, sub_y.numpy()),
        "val_sub_ece_after": _expected_calibration_error(sub_probs_after, sub_y.numpy()),
    }
    return params, stats


class HierarchicalPredictor:
    """Inference wrapper supporting Top-K Main Topic expansion, calibration, and abstention."""

    def __init__(
        self,
        model: HierarchicalVocabClassifier,
        tokenizer: Any,
        taxonomy: dict[str, Any],
        *,
        calibration: CalibrationParams | None = None,
        device: str | torch.device = "cpu",
    ) -> None:
        self.model = model.to(device)
        self.model.eval()
        self.tokenizer = tokenizer
        self.taxonomy = taxonomy
        self.calibration = calibration or CalibrationParams()
        self.device = device

    @classmethod
    def from_checkpoint(
        cls,
        checkpoint_dir: Path | str = DEFAULT_FINETUNED_CKPT_DIR,
        taxonomy_path: Path | str = DEFAULT_TAXONOMY_PATH,
        device: str | torch.device | None = None,
    ) -> HierarchicalPredictor:
        ckpt = Path(checkpoint_dir)
        resolved_device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        model = HierarchicalVocabClassifier.load_checkpoint(
            ckpt, taxonomy_path=taxonomy_path, map_location=resolved_device
        )
        _, tokenizer = load_encoder_and_tokenizer(model.config.model_name)
        taxonomy = load_taxonomy(taxonomy_path)
        cal_path = ckpt / "calibration.json"
        calibration = CalibrationParams.from_json(cal_path) if cal_path.exists() else CalibrationParams()
        return cls(model, tokenizer, taxonomy, calibration=calibration, device=resolved_device)

    @torch.no_grad()
    def predict_batch(
        self,
        records: list[dict[str, Any]],
        *,
        top_k_main: int = 2,
        top_k_joint: int = 3,
        min_main_confidence: float = 0.45,
        min_joint_confidence: float = 0.25,
        min_main_margin: float = 0.05,
    ) -> list[dict[str, Any]]:
        """Run calibrated hierarchical inference with Top-K Main expansion and abstention."""
        if not records:
            return []

        texts = [r["text"] if r.get("text") else build_model_text(r) for r in records]
        enc = self.tokenizer(
            texts,
            padding=True,
            truncation=True,
            max_length=self.model.config.max_length,
            return_tensors="pt",
        )
        input_ids = enc["input_ids"].to(self.device)
        attention_mask = enc["attention_mask"].to(self.device)

        embeddings = self.model.encode(input_ids, attention_mask)
        main_logits = self.model.main_head(embeddings)
        main_probs = F.softmax(main_logits / self.calibration.main_temperature, dim=-1)

        k_main = min(max(1, top_k_main), self.model.config.num_main_topics)
        top_main_probs, top_main_indices = torch.topk(main_probs, k=k_main, dim=-1)

        # Evaluate Subtopic head conditioned on each of the Top-K Main Topic candidates.
        expanded_candidates: list[list[dict[str, Any]]] = [[] for _ in range(len(records))]
        for k_idx in range(k_main):
            cand_main_idx = top_main_indices[:, k_idx]
            cand_main_prob = top_main_probs[:, k_idx]

            if self.model.main_cond_proj is not None:
                one_hot = F.one_hot(
                    cand_main_idx, num_classes=self.model.config.num_main_topics
                ).float()
                cond = self.model.main_cond_proj(one_hot)
                sub_feats = torch.cat([embeddings, cond], dim=-1)
            else:
                sub_feats = embeddings

            raw_sub_logits = self.model.subtopic_head(sub_feats)
            masked_sub_logits = apply_hierarchy_mask(
                raw_sub_logits, cand_main_idx, self.model.hierarchy_mask
            )
            sub_probs = F.softmax(masked_sub_logits / self.calibration.subtopic_temperature, dim=-1)

            for i in range(len(records)):
                m_idx = int(cand_main_idx[i].item())
                m_prob = float(cand_main_prob[i].item())
                valid_subs = torch.nonzero(self.model.hierarchy_mask[m_idx], as_tuple=False).squeeze(-1)
                for s_tensor in valid_subs:
                    s_idx = int(s_tensor.item())
                    s_prob = float(sub_probs[i, s_idx].item())
                    expanded_candidates[i].append(
                        {
                            "main_label_id": m_idx,
                            "subtopic_label_id": s_idx,
                            "main_prob": m_prob,
                            "sub_prob_given_main": s_prob,
                            "joint_prob": m_prob * s_prob,
                        }
                    )

        id2label: dict[int, str] = self.taxonomy["id2label"]
        name_to_id: dict[str, str] = self.taxonomy["name_to_id"]
        topic_type_map: dict[str, str] = self.taxonomy["topic_type_map"]
        id2subtopic: dict[int, str] = self.taxonomy["id2subtopic"]
        subtopic_id_to_name: dict[str, str] = self.taxonomy["subtopic_id_to_name"]

        results: list[dict[str, Any]] = []
        for i in range(len(records)):
            ranked_joint = sorted(
                expanded_candidates[i], key=lambda c: -c["joint_prob"]
            )[:top_k_joint]
            best = ranked_joint[0]

            m_idx = best["main_label_id"]
            s_idx = best["subtopic_label_id"]
            main_name = id2label[m_idx]
            sub_id = id2subtopic[s_idx]

            top1_main_conf = float(top_main_probs[i, 0].item())
            top2_main_conf = float(top_main_probs[i, 1].item()) if k_main > 1 else 0.0
            main_margin = round(top1_main_conf - top2_main_conf, 4)
            joint_conf = round(best["joint_prob"], 4)

            reasons: list[str] = []
            if top1_main_conf < min_main_confidence:
                reasons.append("low_main_confidence")
            if joint_conf < min_joint_confidence:
                reasons.append("low_joint_confidence")
            if k_main > 1 and main_margin < min_main_margin:
                reasons.append("small_main_margin")

            abstained = len(reasons) > 0
            results.append(
                {
                    "main_topic": main_name,
                    "main_topic_id": name_to_id[main_name],
                    "main_label_id": m_idx,
                    "topic_type": topic_type_map[main_name],
                    "main_topic_confidence": round(best["main_prob"], 4),
                    "main_margin": main_margin,
                    "subtopic": subtopic_id_to_name[sub_id],
                    "subtopic_id": sub_id,
                    "subtopic_label_id": s_idx,
                    "subtopic_confidence": round(best["sub_prob_given_main"], 4),
                    "joint_confidence": joint_conf,
                    "abstained": abstained,
                    "review_status": "needs_review" if abstained else "accepted",
                    "abstention_reasons": reasons,
                    "top_k_main_candidates": [
                        {
                            "main_topic": id2label[int(top_main_indices[i, r].item())],
                            "main_topic_id": name_to_id[id2label[int(top_main_indices[i, r].item())]],
                            "probability": round(float(top_main_probs[i, r].item()), 4),
                        }
                        for r in range(k_main)
                    ],
                    "top_k_joint_candidates": [
                        {
                            "rank": rank,
                            "main_topic_id": name_to_id[id2label[c["main_label_id"]]],
                            "subtopic_id": id2subtopic[c["subtopic_label_id"]],
                            "subtopic": subtopic_id_to_name[id2subtopic[c["subtopic_label_id"]]],
                            "subtopic_label_id": c["subtopic_label_id"],
                            "joint_prob": round(c["joint_prob"], 4),
                        }
                        for rank, c in enumerate(ranked_joint, start=1)
                    ],
                }
            )
        return results


def evaluate_topk_and_abstention(
    *,
    train_config_path: Path | str = DEFAULT_TRAIN_CONFIG_PATH,
    checkpoint_dir: Path | str = DEFAULT_FINETUNED_CKPT_DIR,
    output_dir: Path | str = DEFAULT_EXPERIMENTS_DIR,
    encoder: torch.nn.Module | None = None,
    tokenizer: Any | None = None,
) -> dict[str, Any]:
    """Run Stage 4 calibration + Experiment E6 (Single Main vs Top-K & abstention)."""
    tcfg = load_json(train_config_path)
    taxonomy_path = PACKAGE_ROOT / tcfg["taxonomy_path"] if not Path(tcfg["taxonomy_path"]).is_absolute() else Path(tcfg["taxonomy_path"])
    val_path = PACKAGE_ROOT / tcfg["val_path"] if not Path(tcfg["val_path"]).is_absolute() else Path(tcfg["val_path"])
    test_path = PACKAGE_ROOT / tcfg["test_path"] if not Path(tcfg["test_path"]).is_absolute() else Path(tcfg["test_path"])

    taxonomy = load_taxonomy(taxonomy_path)
    ckpt = Path(checkpoint_dir)
    device = "cuda" if torch.cuda.is_available() else "cpu"

    if encoder is not None and tokenizer is not None:
        from src.models.hierarchical_classifier import ModelConfig

        mcfg = ModelConfig.from_json(ckpt / "model_config.json")
        model = HierarchicalVocabClassifier.from_config(mcfg, taxonomy_path=taxonomy_path, encoder=encoder)
        state = torch.load(ckpt / "model_state.pt", map_location=device, weights_only=True)
        model.load_state_dict(state)
    else:
        model = HierarchicalVocabClassifier.load_checkpoint(ckpt, taxonomy_path=taxonomy_path, map_location=device)
        _, tokenizer = load_encoder_and_tokenizer(model.config.model_name)

    val_records = load_records(val_path)
    test_records = load_records(test_path)

    val_ds = VocabSenseDataset(val_records, taxonomy, mask_untrusted_subtopics=False)
    collate_fn = _make_collate_fn(tokenizer, model.config.max_length)
    val_loader = DataLoader(val_ds, batch_size=64, shuffle=False, collate_fn=collate_fn)

    cal_params, cal_stats = fit_temperature_scaling(model, val_loader, device=device)
    cal_params.to_json(ckpt / "calibration.json")

    predictor = HierarchicalPredictor(model, tokenizer, taxonomy, calibration=cal_params, device=device)
    test_ds = VocabSenseDataset(test_records, taxonomy, mask_untrusted_subtopics=False)
    y_main_true = test_ds.main_labels
    y_sub_true = test_ds.eval_subtopic_labels

    k_results: dict[str, Any] = {}
    preds_by_k: dict[int, list[dict[str, Any]]] = {}

    for k_main in (1, 2, 3):
        batch_preds: list[dict[str, Any]] = []
        for start in range(0, len(test_records), 64):
            batch_preds.extend(
                predictor.predict_batch(
                    test_records[start : start + 64],
                    top_k_main=k_main,
                    top_k_joint=3,
                )
            )
        preds_by_k[k_main] = batch_preds

        y_main_pred = [p["main_label_id"] for p in batch_preds]
        y_sub_pred = [p["subtopic_label_id"] for p in batch_preds]

        main_m = compute_classification_metrics(y_main_true, y_main_pred)
        sub_m = compute_classification_metrics(y_sub_true, y_sub_pred)
        joint_acc = sum(
            1 for mt, mp, st, sp in zip(y_main_true, y_main_pred, y_sub_true, y_sub_pred) if mt == mp and st == sp
        ) / len(y_main_true)
        top3_sub_recall = sum(
            1
            for st, p in zip(y_sub_true, batch_preds)
            if st in {c["subtopic_label_id"] for c in p["top_k_joint_candidates"]}
        ) / len(y_sub_true)
        sub_errors = sum(1 for st, sp in zip(y_sub_true, y_sub_pred) if st != sp)
        cascading_errors = sum(
            1 for mt, mp, st, sp in zip(y_main_true, y_main_pred, y_sub_true, y_sub_pred) if mt != mp and st != sp
        )

        k_results[f"top_{k_main}_main"] = {
            "main_acc": main_m["accuracy"],
            "main_macro_f1": main_m["macro_f1"],
            "sub_e2e_acc": sub_m["accuracy"],
            "sub_e2e_macro_f1": sub_m["macro_f1"],
            "joint_acc": round(joint_acc, 4),
            "top3_subtopic_recall": round(top3_sub_recall, 4),
            "cascading_errors": cascading_errors,
            "total_subtopic_errors": sub_errors,
        }

    # Abstention trade-off curve using top_k_main=2 calibrated probabilities
    abstention_curve: list[dict[str, Any]] = []
    for min_main, min_joint in ((0.0, 0.0), (0.45, 0.25), (0.60, 0.35), (0.75, 0.50)):
        accepted_idx = [
            i
            for i, p in enumerate(preds_by_k[2])
            if p["main_topic_confidence"] >= min_main and p["joint_confidence"] >= min_joint
        ]
        coverage = round(len(accepted_idx) / len(test_records), 4) if test_records else 0.0
        if accepted_idx:
            acc_main = compute_classification_metrics(
                [y_main_true[i] for i in accepted_idx],
                [preds_by_k[2][i]["main_label_id"] for i in accepted_idx],
            )
            acc_sub = compute_classification_metrics(
                [y_sub_true[i] for i in accepted_idx],
                [preds_by_k[2][i]["subtopic_label_id"] for i in accepted_idx],
            )
            abstention_curve.append(
                {
                    "min_main_conf": min_main,
                    "min_joint_conf": min_joint,
                    "accepted_samples": len(accepted_idx),
                    "needs_review_samples": len(test_records) - len(accepted_idx),
                    "coverage": coverage,
                    "accepted_main_acc": acc_main["accuracy"],
                    "accepted_main_macro_f1": acc_main["macro_f1"],
                    "accepted_sub_macro_f1": acc_sub["macro_f1"],
                }
            )

    report = {
        "calibration": cal_stats,
        "E6_single_vs_topk": k_results,
        "abstention_tradeoff": abstention_curve,
    }
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)
    save_json(report, out / "stage4_e6_results.json")
    (out / "stage4_e6_report.md").write_text(format_stage4_markdown(report), encoding="utf-8")
    return report


def format_stage4_markdown(report: dict[str, Any]) -> str:
    cal = report["calibration"]
    lines = [
        "# Stage 4 & E6: Hierarchical Top-K Inference, Calibration & Abstention",
        "",
        "## Temperature Calibration (Validation Set)",
        f"- Main Temperature: `{cal['main_temperature']}` | Val NLL: `{cal['val_main_nll_before']}` -> `{cal['val_main_nll_after']}` | ECE: `{cal['val_main_ece_before']}` -> `{cal['val_main_ece_after']}`",
        f"- Subtopic Temperature: `{cal['subtopic_temperature']}` | Val ECE: `{cal['val_sub_ece_before']}` -> `{cal['val_sub_ece_after']}`",
        "",
        "## E6: Single Main Topic (`K=1`) vs Top-K Expansion (`K=2, 3`) on Test Set",
        "",
        "| Strategy | Main Acc | Main Macro F1 | Sub E2E Acc | Sub E2E Macro F1 | Joint Acc | Top-3 Sub Recall | Cascading Errors |",
        "| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ]
    for key, m in report["E6_single_vs_topk"].items():
        lines.append(
            f"| `{key}` | {m['main_acc']:.4f} | {m['main_macro_f1']:.4f} "
            f"| {m['sub_e2e_acc']:.4f} | {m['sub_e2e_macro_f1']:.4f} "
            f"| {m['joint_acc']:.4f} | {m['top3_subtopic_recall']:.4f} | {m['cascading_errors']} |"
        )

    lines.extend(
        [
            "",
            "## Abstention & `needs_review` Trade-off (`top_2_main`)",
            "",
            "| Min Main Conf | Min Joint Conf | Coverage | Needs Review | Accepted Main Acc | Accepted Main Macro F1 | Accepted Sub Macro F1 |",
            "| ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
        ]
    )
    for row in report["abstention_tradeoff"]:
        lines.append(
            f"| {row['min_main_conf']:.2f} | {row['min_joint_conf']:.2f} "
            f"| {row['coverage']:.2%} | {row['needs_review_samples']} "
            f"| {row['accepted_main_acc']:.4f} | {row['accepted_main_macro_f1']:.4f} | {row['accepted_sub_macro_f1']:.4f} |"
        )
    lines.append("")
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="Run Stage 4 calibration & E6 evaluation.")
    parser.add_argument("--train-config", type=Path, default=DEFAULT_TRAIN_CONFIG_PATH)
    parser.add_argument("--checkpoint-dir", type=Path, default=DEFAULT_FINETUNED_CKPT_DIR)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_EXPERIMENTS_DIR)
    args = parser.parse_args(argv)
    report = evaluate_topk_and_abstention(
        train_config_path=args.train_config,
        checkpoint_dir=args.checkpoint_dir,
        output_dir=args.output_dir,
    )
    print(format_stage4_markdown(report))


if __name__ == "__main__":
    main()
