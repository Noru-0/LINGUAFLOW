"""Finalize and package the production Frozen MiniLM + LogReg (power_0.25) model."""

from __future__ import annotations

import argparse
import hashlib
import platform
import shutil
import sys
from collections import defaultdict
from pathlib import Path
from typing import Any, Callable

import joblib
import numpy as np
import sklearn
import torch
import transformers
from sklearn.linear_model import LogisticRegression

from src.data.common import PACKAGE_ROOT, load_json, load_records, load_taxonomy, save_json
from src.data.preprocess import build_model_text
from src.evaluation.error_analysis import build_main_confusion_summary
from src.evaluation.metrics import compute_classification_metrics, evaluate_hierarchical_predictions
from src.inference.final_predictor import (
    DEFAULT_FINAL_MODEL_DIR,
    ProductionVocabPredictor,
    extract_logreg_log_probs,
    softmax_2d,
)
from src.inference.hierarchical_inference import _expected_calibration_error, _optimize_temperature
from src.models.baselines import _ConstantLabelModel, compute_power_class_weights, encode_frozen_minilm
from src.models.hierarchical_classifier import load_encoder_and_tokenizer
from src.training.train_baselines import DEFAULT_BASELINE_CONFIG_PATH, extract_texts_and_labels

DATASET_VERSION = "1.2.0"


def _resolve_path(path_value: str | Path) -> Path:
    path = Path(path_value)
    return path if path.is_absolute() else PACKAGE_ROOT / path


def sha256_file(path: Path) -> str:
    """Compute SHA-256 hex digest of a file."""
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def _fit_power_logreg_bundle(
    X_train: np.ndarray,
    y_train_main: list[int],
    y_train_sub: list[int],
    *,
    alpha: float = 0.25,
    C: float = 2.0,
    max_iter: int = 1000,
    seed: int = 42,
) -> tuple[LogisticRegression, dict[int, Any]]:
    """Train the exact E1/E2 Frozen MiniLM + LogReg (power_0.25) classifiers."""
    main_cw = compute_power_class_weights(y_train_main, alpha=alpha)
    main_clf = LogisticRegression(
        C=C,
        max_iter=max_iter,
        class_weight=main_cw,
        random_state=seed,
    )
    main_clf.fit(X_train, y_train_main)

    y_sub_arr = np.asarray(y_train_sub, dtype=int)
    indices_by_main: dict[int, list[int]] = defaultdict(list)
    for idx, main_id in enumerate(y_train_main):
        indices_by_main[int(main_id)].append(idx)

    sub_clfs: dict[int, Any] = {}
    for main_id, row_indices in sorted(indices_by_main.items()):
        sub_targets = y_sub_arr[row_indices]
        unique_subs = np.unique(sub_targets)
        if len(unique_subs) == 1:
            sub_clfs[main_id] = _ConstantLabelModel(int(unique_subs[0]))
        else:
            sub_cw = compute_power_class_weights(sub_targets.tolist(), alpha=alpha)
            clf = LogisticRegression(
                C=C,
                max_iter=max_iter,
                class_weight=sub_cw,
                random_state=seed,
            )
            clf.fit(X_train[row_indices], sub_targets)
            sub_clfs[main_id] = clf

    return main_clf, sub_clfs


def _fit_validation_temperatures(
    main_clf: Any,
    sub_clfs: dict[int, Any],
    X_val: np.ndarray,
    y_val_main: list[int],
    y_val_sub: list[int],
    taxonomy: dict[str, Any],
) -> dict[str, Any]:
    """Fit scalar temperatures on validation log-probabilities."""
    num_main = len(taxonomy["label2id"])
    num_sub = len(taxonomy["subtopic2id"])

    main_logits_np = extract_logreg_log_probs(main_clf, X_val, num_main)
    sub_logits_np = np.full((X_val.shape[0], num_sub), -1e9, dtype=np.float64)
    for main_id, sub_clf in sub_clfs.items():
        rows = [i for i, m in enumerate(y_val_main) if int(m) == int(main_id)]
        if rows:
            sub_logits_np[rows] = extract_logreg_log_probs(sub_clf, X_val[rows], num_sub)

    main_t = torch.tensor(main_logits_np, dtype=torch.float32)
    sub_t = torch.tensor(sub_logits_np, dtype=torch.float32)
    ym_t = torch.tensor(y_val_main, dtype=torch.long)
    ys_t = torch.tensor(y_val_sub, dtype=torch.long)

    t_main = _optimize_temperature(main_t, ym_t)
    t_sub = _optimize_temperature(sub_t, ys_t)

    m_before = softmax_2d(main_logits_np, 1.0)
    m_after = softmax_2d(main_logits_np, t_main)
    s_before = softmax_2d(sub_logits_np, 1.0)
    s_after = softmax_2d(sub_logits_np, t_sub)

    return {
        "main_temperature": t_main,
        "subtopic_temperature": t_sub,
        "val_main_nll_before": round(float(torch.nn.functional.cross_entropy(main_t, ym_t).item()), 4),
        "val_main_nll_after": round(float(torch.nn.functional.cross_entropy(main_t / t_main, ym_t).item()), 4),
        "val_main_ece_before": _expected_calibration_error(m_before, np.asarray(y_val_main)),
        "val_main_ece_after": _expected_calibration_error(m_after, np.asarray(y_val_main)),
        "val_sub_ece_before": _expected_calibration_error(s_before, np.asarray(y_val_sub)),
        "val_sub_ece_after": _expected_calibration_error(s_after, np.asarray(y_val_sub)),
    }


def _evaluate_accepted_subset(
    preds: list[dict[str, Any]],
    y_main_true: list[int],
    y_sub_true: list[int],
    *,
    main_threshold: float,
    joint_threshold: float,
) -> dict[str, Any]:
    """Evaluate selective prediction on accepted subset without mixing with full metrics."""
    n = len(preds)
    acc_idx = [
        i
        for i, p in enumerate(preds)
        if p["main_topic_confidence"] >= main_threshold
        and p["joint_confidence"] >= joint_threshold
    ]
    total_joint_errors = sum(
        1
        for i, p in enumerate(preds)
        if not (p["main_label_id"] == y_main_true[i] and p["subtopic_label_id"] == y_sub_true[i])
    )
    if not acc_idx:
        return {
            "main_threshold": main_threshold,
            "joint_threshold": joint_threshold,
            "coverage": 0.0,
            "accepted_samples": 0,
            "needs_review_samples": n,
            "main_accuracy": 0.0,
            "main_macro_f1": 0.0,
            "sub_e2e_accuracy": 0.0,
            "sub_e2e_macro_f1": 0.0,
            "joint_accuracy": 0.0,
            "joint_error_capture_rate": 1.0 if total_joint_errors else 0.0,
        }

    ym_t = [y_main_true[i] for i in acc_idx]
    ym_p = [preds[i]["main_label_id"] for i in acc_idx]
    ys_t = [y_sub_true[i] for i in acc_idx]
    ys_p = [preds[i]["subtopic_label_id"] for i in acc_idx]

    mm = compute_classification_metrics(ym_t, ym_p)
    sm = compute_classification_metrics(ys_t, ys_p)
    joint_acc = sum(1 for a, b, c, d in zip(ym_t, ym_p, ys_t, ys_p) if a == b and c == d) / len(acc_idx)
    captured_errors = sum(
        1
        for i in range(n)
        if i not in set(acc_idx)
        and not (preds[i]["main_label_id"] == y_main_true[i] and preds[i]["subtopic_label_id"] == y_sub_true[i])
    )
    return {
        "main_threshold": main_threshold,
        "joint_threshold": joint_threshold,
        "coverage": round(len(acc_idx) / n, 4),
        "accepted_samples": len(acc_idx),
        "needs_review_samples": n - len(acc_idx),
        "main_accuracy": mm["accuracy"],
        "main_macro_f1": mm["macro_f1"],
        "sub_e2e_accuracy": sm["accuracy"],
        "sub_e2e_macro_f1": sm["macro_f1"],
        "joint_accuracy": round(joint_acc, 4),
        "joint_error_capture_rate": (
            round(captured_errors / total_joint_errors, 4) if total_joint_errors else 0.0
        ),
    }


def _build_final_readme(
    *,
    versions: dict[str, str],
    checksums: dict[str, Any],
    test_metrics: dict[str, Any],
    temperatures: dict[str, Any],
) -> str:
    full = test_metrics["full_test"]
    acc70 = test_metrics["accepted_subset_default"]
    acc60 = test_metrics["accepted_subset_high_precision_ref"]
    return f"""# Final Production Model Package (`vocab_classifier`)

Official hierarchical vocabulary classifier selected from experiments E1–E10:
- **Encoder:** `sentence-transformers/all-MiniLM-L6-v2` (frozen 384-d mean-pooled L2-normalized embeddings)
- **Main Topic Classifier:** `LogisticRegression` (11 classes: 10 IELTS topical domains + `General Vocabulary`, `C=2.0`, `power_0.25` class weighting)
- **Subtopic Classifiers:** Per-`main_topic` `LogisticRegression` (45 subtopics total, `C=2.0`, `power_0.25` class weighting, strict hierarchy constraint)
- **Inference:** Top-1 default prediction, Top-3 candidate expansion for review/reranking, temperature scaling (`T_main={temperatures['main_temperature']}`, `T_sub={temperatures['subtopic_temperature']}`), selective abstention (`Main >= 0.60`, `Joint >= 0.30`)

## Evaluation Summary (`test`, `n={full['num_samples']}`)

### Full Test Set (100% Coverage)
| Metric | Score |
| :--- | ---: |
| Main Accuracy | `{full['main_topic']['accuracy']:.4f}` |
| Main Macro F1 | `{full['main_topic']['macro_f1']:.4f}` |
| General vs Topical F1 | `{full['general_vs_topical']['general_f1']:.4f}` |
| Subtopic E2E Macro F1 | `{full['subtopic_end_to_end']['macro_f1']:.4f}` |
| Subtopic Oracle Macro F1 | `{full['subtopic_oracle_main']['macro_f1']:.4f}` |
| Joint Exact Match Accuracy | `{full['joint_exact_match']:.4f}` |
| Top-3 Main Recall | `{full['top_3_main_recall']:.4f}` |
| Top-3 Subtopic Recall (via Top-3 Main) | `{full['top_3_subtopic_recall']:.4f}` |

### Selective Prediction (`Main >= 0.60, Joint >= 0.30`, Fixed from Validation)
| Profile | Coverage | Needs Review | Main Acc | Main Macro F1 | Sub E2E Macro F1 | Joint Acc |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| **Default Production (`70%` target)** | `{acc70['coverage']:.2%}` | `{acc70['needs_review_samples']}` | `{acc70['main_accuracy']:.4f}` | `{acc70['main_macro_f1']:.4f}` | `{acc70['sub_e2e_macro_f1']:.4f}` | `{acc70['joint_accuracy']:.4f}` |
| High-Precision Reference (`0.65, 0.35`) | `{acc60['coverage']:.2%}` | `{acc60['needs_review_samples']}` | `{acc60['main_accuracy']:.4f}` | `{acc60['main_macro_f1']:.4f}` | `{acc60['sub_e2e_macro_f1']:.4f}` | `{acc60['joint_accuracy']:.4f}` |

## Reproducibility Metadata

- **Dataset Version:** `{DATASET_VERSION}` (`seed=42`, group-stratified 80/10/10 split by `word_id`)
- **Python / Libraries:** Python `{versions['python']}`, torch `{versions['torch']}`, transformers `{versions['transformers']}`, scikit-learn `{versions['scikit_learn']}`, numpy `{versions['numpy']}`, joblib `{versions['joblib']}`
- **Checksums (SHA-256):**
  - `taxonomy.json`: `{checksums['taxonomy_sha256']}`
  - `train.jsonl`: `{checksums['train_sha256']}`
  - `val.jsonl`: `{checksums['val_sha256']}`
  - `test.jsonl`: `{checksums['test_sha256']}`

## Usage

```python
from src.inference.final_predictor import ProductionVocabPredictor

predictor = ProductionVocabPredictor.from_dir("final_model")
results = predictor.predict([
    {{
        "word": "biodiversity",
        "pos": "noun",
        "definition": "The variety of plant and animal life in the world.",
        "collocations": ["marine biodiversity", "protect biodiversity"],
        "examples": ["Deforestation threatens global biodiversity."],
    }}
])
print(results[0])
```
"""


def build_final_model_package(
    *,
    baseline_config_path: Path | str = DEFAULT_BASELINE_CONFIG_PATH,
    output_dir: Path | str = DEFAULT_FINAL_MODEL_DIR,
    save_local_encoder: bool = True,
    encoder: Any | None = None,
    tokenizer: Any | None = None,
) -> dict[str, Any]:
    """Train, calibrate, evaluate once on test, and package `final_model/`."""
    bcfg = load_json(baseline_config_path)
    seed = int(bcfg.get("seed", 42))
    taxonomy_path = _resolve_path(bcfg["taxonomy_path"])
    train_path = _resolve_path(bcfg["train_path"])
    val_path = _resolve_path(bcfg["val_path"])
    test_path = _resolve_path(bcfg["test_path"])
    label_mapping_path = PACKAGE_ROOT / "data" / "processed" / "label_mapping.json"

    taxonomy = load_taxonomy(taxonomy_path)
    train_records = load_records(train_path)
    val_records = load_records(val_path)
    test_records = load_records(test_path)

    # Verify zero word_id leakage across fixed splits
    tr_words = {r["word_id"] for r in train_records}
    va_words = {r["word_id"] for r in val_records}
    te_words = {r["word_id"] for r in test_records}
    if (tr_words & va_words) or (tr_words & te_words) or (va_words & te_words):
        raise AssertionError("Split leakage detected across train/val/test word_ids.")

    train_texts, y_train_main, y_train_sub = extract_texts_and_labels(train_records, taxonomy)
    val_texts, y_val_main, y_val_sub = extract_texts_and_labels(val_records, taxonomy)
    test_texts, y_test_main, y_test_sub = extract_texts_and_labels(test_records, taxonomy)

    minilm_cfg = dict(bcfg.get("minilm", {}))
    model_name = minilm_cfg.get("model_name", "sentence-transformers/all-MiniLM-L6-v2")
    if encoder is None or tokenizer is None:
        encoder, tokenizer = load_encoder_and_tokenizer(model_name)

    X_train = encode_frozen_minilm(train_texts, **minilm_cfg, encoder=encoder, tokenizer=tokenizer)
    X_val = encode_frozen_minilm(val_texts, **minilm_cfg, encoder=encoder, tokenizer=tokenizer)
    X_test = encode_frozen_minilm(test_texts, **minilm_cfg, encoder=encoder, tokenizer=tokenizer)

    # 1. Train exact Frozen MiniLM + LogReg (power_0.25) configuration
    main_clf, sub_clfs = _fit_power_logreg_bundle(
        X_train, y_train_main, y_train_sub, alpha=0.25, C=2.0, max_iter=1000, seed=seed
    )

    # 2. Fit temperature scaling on validation set
    temperatures = _fit_validation_temperatures(
        main_clf, sub_clfs, X_val, y_val_main, y_val_sub, taxonomy
    )

    # 3. Prepare output directories & save configs, encoder, classifiers, calibration
    out_root = Path(output_dir)
    for sub in ("encoder", "main_classifier", "subtopic_classifiers", "calibration", "config", "evaluation"):
        (out_root / sub).mkdir(parents=True, exist_ok=True)

    if save_local_encoder:
        enc_target = out_root / "encoder" / "all-MiniLM-L6-v2"
        enc_target.mkdir(parents=True, exist_ok=True)
        encoder.save_pretrained(enc_target)
        tokenizer.save_pretrained(enc_target)

    joblib.dump(main_clf, out_root / "main_classifier" / "model.joblib")

    id2label = taxonomy["id2label"]
    name_to_id = taxonomy["name_to_id"]
    sub_index: dict[str, Any] = {"by_main_label_id": {}, "by_main_topic_id": {}}
    for main_label_id, sub_clf in sorted(sub_clfs.items()):
        topic_id = name_to_id[id2label[main_label_id]]
        fname = f"{topic_id}.joblib"
        joblib.dump(sub_clf, out_root / "subtopic_classifiers" / fname)
        sub_index["by_main_label_id"][str(main_label_id)] = fname
        sub_index["by_main_topic_id"][topic_id] = fname
    save_json(sub_index, out_root / "subtopic_classifiers" / "index.json")

    save_json(temperatures, out_root / "calibration" / "temperatures.json")
    shutil.copy2(taxonomy_path, out_root / "config" / "taxonomy.json")

    checksums = {
        "dataset_version": DATASET_VERSION,
        "taxonomy_version": taxonomy["raw"].get("version", "1.1.0"),
        "taxonomy_sha256": sha256_file(taxonomy_path),
        "train_sha256": sha256_file(train_path),
        "val_sha256": sha256_file(val_path),
        "test_sha256": sha256_file(test_path),
        "label_mapping_sha256": sha256_file(label_mapping_path) if label_mapping_path.exists() else None,
        "splits": {
            "train": {"samples": len(train_records), "unique_words": len(tr_words)},
            "val": {"samples": len(val_records), "unique_words": len(va_words)},
            "test": {"samples": len(test_records), "unique_words": len(te_words)},
        },
    }
    preprocessing_cfg = {
        "input_variant": "full",
        "include_examples": True,
        "include_collocations": True,
        "text_template": "Word: {word} ({pos})\\nDefinition: {definition}\\nCollocations: ...\\nExamples: ...",
        "encoder": {
            "model_name": model_name,
            "embedding_dim": 384,
            "max_length": int(minilm_cfg.get("max_length", 192)),
            "batch_size": int(minilm_cfg.get("batch_size", 64)),
            "pooling": minilm_cfg.get("pooling", "mean"),
            "normalize": bool(minilm_cfg.get("normalize", True)),
        },
        "training_hyperparameters": {
            "classifier": "LogisticRegression",
            "C": 2.0,
            "max_iter": 1000,
            "class_weight": "power_0.25",
            "alpha": 0.25,
            "seed": seed,
        },
        "data_integrity": checksums,
    }
    inference_cfg = {
        "default_prediction_mode": "top_1_main_with_hierarchical_subtopic",
        "top_k_main": 3,
        "top_k_subtopic": 3,
        "main_confidence_threshold": 0.60,
        "joint_confidence_threshold": 0.30,
        "threshold_selection_split": "validation",
        "target_validation_coverage": 0.70,
        "alternative_high_precision_thresholds": {
            "main_confidence_threshold": 0.65,
            "joint_confidence_threshold": 0.35,
            "target_validation_coverage": 0.60,
        },
        "abstention_review_status": "needs_review",
    }
    save_json(preprocessing_cfg, out_root / "config" / "preprocessing.json")
    save_json(inference_cfg, out_root / "config" / "inference.json")

    # 4. Run final evaluation (validation reference + single test evaluation)
    predictor = ProductionVocabPredictor(
        encoder=encoder,
        tokenizer=tokenizer,
        main_clf=main_clf,
        sub_clfs=sub_clfs,
        taxonomy=taxonomy,
        preprocessing_cfg=preprocessing_cfg,
        inference_cfg=inference_cfg,
        temperatures=temperatures,
    )

    val_preds = predictor.predict_from_embeddings(X_val)
    test_preds = predictor.predict_from_embeddings(X_test)

    y_test_main_pred = [p["main_label_id"] for p in test_preds]
    y_test_sub_e2e = [p["subtopic_label_id"] for p in test_preds]

    # Oracle Subtopic predictions (conditioned on ground-truth Main Topic)
    y_test_sub_oracle = [0] * len(test_records)
    rows_by_main: dict[int, list[int]] = defaultdict(list)
    for idx, m_id in enumerate(y_test_main):
        rows_by_main[int(m_id)].append(idx)
    for m_id, rows in rows_by_main.items():
        preds_m = sub_clfs[m_id].predict(X_test[rows]).tolist()
        for r_idx, sp in zip(rows, preds_m):
            y_test_sub_oracle[r_idx] = int(sp)

    full_test_metrics = evaluate_hierarchical_predictions(
        y_main_true=y_test_main,
        y_main_pred=y_test_main_pred,
        y_sub_true=y_test_sub,
        y_sub_pred_e2e=y_test_sub_e2e,
        y_sub_pred_oracle=y_test_sub_oracle,
        taxonomy=taxonomy,
    )
    top3_main_recall = sum(
        1
        for mt, p in zip(y_test_main, test_preds)
        if mt in {c["main_label_id"] for c in p["top_k_main_candidates"]}
    ) / len(y_test_main)
    top3_sub_recall = sum(
        1
        for st, p in zip(y_test_sub, test_preds)
        if st in {c["subtopic_label_id"] for c in p["top_k_expanded_candidates"]}
    ) / len(y_test_sub)
    full_test_metrics["top_3_main_recall"] = round(top3_main_recall, 4)
    full_test_metrics["top_3_subtopic_recall"] = round(top3_sub_recall, 4)

    val_accepted = _evaluate_accepted_subset(
        val_preds, y_val_main, y_val_sub, main_threshold=0.60, joint_threshold=0.30
    )
    test_accepted_default = _evaluate_accepted_subset(
        test_preds, y_test_main, y_test_sub, main_threshold=0.60, joint_threshold=0.30
    )
    test_accepted_hp = _evaluate_accepted_subset(
        test_preds, y_test_main, y_test_sub, main_threshold=0.65, joint_threshold=0.35
    )

    test_metrics_bundle = {
        "dataset_version": DATASET_VERSION,
        "full_test": full_test_metrics,
        "accepted_subset_default": test_accepted_default,
        "accepted_subset_high_precision_ref": test_accepted_hp,
        "validation_accepted_reference": val_accepted,
    }
    classification_rep = {
        "main_topic_11": full_test_metrics["main_topic"],
        "subtopic_end_to_end_45": full_test_metrics["subtopic_end_to_end"],
        "subtopic_oracle_main_45": full_test_metrics["subtopic_oracle_main"],
    }
    confusion_rep = build_main_confusion_summary(y_test_main, y_test_main_pred, taxonomy)

    save_json(test_metrics_bundle, out_root / "evaluation" / "test_metrics.json")
    save_json(classification_rep, out_root / "evaluation" / "classification_report.json")
    save_json(confusion_rep, out_root / "evaluation" / "confusion_matrix.json")

    versions = {
        "python": platform.python_version(),
        "torch": torch.__version__,
        "transformers": transformers.__version__,
        "scikit_learn": sklearn.__version__,
        "numpy": np.__version__,
        "joblib": joblib.__version__,
    }
    readme_text = _build_final_readme(
        versions=versions,
        checksums=checksums,
        test_metrics=test_metrics_bundle,
        temperatures=temperatures,
    )
    (out_root / "README.md").write_text(readme_text, encoding="utf-8")
    return test_metrics_bundle


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Package and evaluate final production model.")
    parser.add_argument("--config", type=Path, default=DEFAULT_BASELINE_CONFIG_PATH)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_FINAL_MODEL_DIR)
    parser.add_argument("--no-save-encoder", action="store_true")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    args = parse_args(argv)
    bundle = build_final_model_package(
        baseline_config_path=args.config,
        output_dir=args.output_dir,
        save_local_encoder=not args.no_save_encoder,
    )
    f = bundle["full_test"]
    a = bundle["accepted_subset_default"]
    print(
        f"Full Test -> Main Acc={f['main_topic']['accuracy']:.4f}, Main F1={f['main_topic']['macro_f1']:.4f}, "
        f"Sub E2E F1={f['subtopic_end_to_end']['macro_f1']:.4f}, Sub Oracle F1={f['subtopic_oracle_main']['macro_f1']:.4f}, "
        f"Joint Acc={f['joint_exact_match']:.4f}"
    )
    print(
        f"Accepted (0.60, 0.30) -> Cov={a['coverage']:.2%} ({a['accepted_samples']}/{f['num_samples']}), "
        f"Main F1={a['main_macro_f1']:.4f}, Sub F1={a['sub_e2e_macro_f1']:.4f}, Joint Acc={a['joint_accuracy']:.4f}"
    )


if __name__ == "__main__":
    main()
