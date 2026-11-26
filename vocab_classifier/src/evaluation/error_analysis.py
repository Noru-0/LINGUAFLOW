"""Error analysis for the primary baseline (Frozen MiniLM + Logistic Regression)."""

from __future__ import annotations

import argparse
import pickle
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Callable

import numpy as np
from sklearn.metrics import confusion_matrix

from src.data.common import PACKAGE_ROOT, load_json, load_records, load_taxonomy, save_json
from src.models.baselines import HierarchicalLinearBaseline, encode_frozen_minilm
from src.training.train_baselines import DEFAULT_BASELINE_CONFIG_PATH, extract_texts_and_labels

DEFAULT_ERROR_ANALYSIS_DIR = PACKAGE_ROOT / "artifacts" / "baselines"


def _resolve_path(path_value: str | Path) -> Path:
    path = Path(path_value)
    return path if path.is_absolute() else PACKAGE_ROOT / path


def build_main_confusion_summary(
    y_true: list[int],
    y_pred: list[int],
    taxonomy: dict[str, Any],
    *,
    top_n_pairs: int = 15,
) -> dict[str, Any]:
    """Build 11x11 Main Topic confusion matrix and top off-diagonal confused pairs."""
    id2label: dict[int, str] = taxonomy["id2label"]
    name_to_id: dict[str, str] = taxonomy["name_to_id"]
    label_ids = sorted(id2label.keys())
    short_names = [name_to_id[id2label[i]] for i in label_ids]
    full_names = [id2label[i] for i in label_ids]

    cm = confusion_matrix(y_true, y_pred, labels=label_ids)
    row_totals = cm.sum(axis=1)

    confused_pairs: list[dict[str, Any]] = []
    for i, true_name in enumerate(full_names):
        for j, pred_name in enumerate(full_names):
            if i == j or cm[i, j] == 0:
                continue
            count = int(cm[i, j])
            total_true = int(row_totals[i])
            confused_pairs.append(
                {
                    "true_main": true_name,
                    "true_id": short_names[i],
                    "pred_main": pred_name,
                    "pred_id": short_names[j],
                    "count": count,
                    "rate_of_true": round(count / total_true, 4) if total_true else 0.0,
                }
            )

    confused_pairs.sort(key=lambda x: (-x["count"], -x["rate_of_true"]))
    return {
        "labels": full_names,
        "short_labels": short_names,
        "matrix": cm.tolist(),
        "top_confused_pairs": confused_pairs[:top_n_pairs],
    }


def _rate_summary(flags: list[bool]) -> dict[str, Any]:
    total = len(flags)
    errors = sum(1 for f in flags if f)
    return {
        "total": total,
        "errors": errors,
        "error_rate": round(errors / total, 4) if total else 0.0,
    }


def analyze_hierarchical_errors(
    *,
    records: list[dict[str, Any]],
    train_records: list[dict[str, Any]],
    y_main_true: list[int],
    y_main_pred: list[int],
    y_sub_true: list[int],
    y_sub_pred_e2e: list[int],
    y_sub_pred_oracle: list[int],
    main_probs: np.ndarray,
    taxonomy: dict[str, Any],
    max_examples: int = 30,
) -> dict[str, Any]:
    """Analyze cascading Main->Subtopic errors, class imbalance, and label-noise signals."""
    id2label: dict[int, str] = taxonomy["id2label"]
    id2subtopic: dict[int, str] = taxonomy["id2subtopic"]
    name_to_id: dict[str, str] = taxonomy["name_to_id"]

    total = len(records)
    joint_correct = 0
    main_correct_sub_wrong = 0
    main_wrong_sub_wrong = 0
    pure_cascading_recoverable = 0  # Main wrong & E2E sub wrong, BUT Oracle sub was right!

    by_sense_bucket: dict[str, list[bool]] = defaultdict(list)
    by_label_source: dict[str, list[bool]] = defaultdict(list)
    by_source_topic: dict[str, list[bool]] = defaultdict(list)
    by_conf_bucket: dict[str, list[bool]] = defaultdict(list)

    cascading_examples: list[dict[str, Any]] = []
    sub_only_examples: list[dict[str, Any]] = []

    for idx, rec in enumerate(records):
        mt, mp = y_main_true[idx], y_main_pred[idx]
        st, sp_e2e, sp_ora = y_sub_true[idx], y_sub_pred_e2e[idx], y_sub_pred_oracle[idx]
        main_ok = mt == mp
        sub_ok = st == sp_e2e
        oracle_ok = st == sp_ora

        if main_ok and sub_ok:
            joint_correct += 1
        elif main_ok and not sub_ok:
            main_correct_sub_wrong += 1
        else:
            main_wrong_sub_wrong += 1
            if oracle_ok:
                pure_cascading_recoverable += 1

        sense_bucket = "primary (sense_index=0)" if rec.get("sense_index", 0) == 0 else "secondary (sense_index>0)"
        by_sense_bucket[sense_bucket].append(not main_ok)

        raw_source = str(rec.get("label_source") or "unknown").replace("+zero_shot_top1", "")
        by_label_source[raw_source].append(not main_ok)
        by_source_topic[str(rec.get("source_topic") or "<none>")].append(not main_ok)

        pred_conf = float(main_probs[idx, mp])
        if pred_conf >= 0.7:
            c_bucket = "high (>=0.70)"
        elif pred_conf >= 0.4:
            c_bucket = "medium (0.40-0.70)"
        else:
            c_bucket = "low (<0.40)"
        by_conf_bucket[c_bucket].append(not main_ok)

        true_conf = float(main_probs[idx, mt])
        entry = {
            "sample_id": rec.get("sample_id"),
            "word": rec.get("word"),
            "pos": rec.get("pos"),
            "sense_index": rec.get("sense_index", 0),
            "source_topic": rec.get("source_topic"),
            "label_source": raw_source,
            "definition": rec.get("definition"),
            "true_main": id2label[mt],
            "true_main_id": name_to_id[id2label[mt]],
            "pred_main": id2label[mp],
            "pred_main_id": name_to_id[id2label[mp]],
            "pred_main_conf": round(pred_conf, 4),
            "true_main_prob": round(true_conf, 4),
            "true_subtopic": id2subtopic[st],
            "pred_subtopic_e2e": id2subtopic[sp_e2e],
            "pred_subtopic_oracle": id2subtopic[sp_ora],
            "recoverable_if_main_correct": oracle_ok,
        }
        if not main_ok:
            cascading_examples.append(entry)
        elif not sub_ok:
            sub_only_examples.append(entry)

    # Sort cascading examples: prioritize recoverable high-confidence errors to inspect root causes.
    cascading_examples.sort(
        key=lambda x: (-int(x["recoverable_if_main_correct"]), -x["pred_main_conf"])
    )

    # Per-class support in train vs test precision/recall/F1.
    train_counts = Counter(r["main_topic"] for r in train_records)
    test_true_counts = Counter(id2label[y] for y in y_main_true)
    test_pred_counts = Counter(id2label[y] for y in y_main_pred)
    test_correct_counts = Counter(
        id2label[yt] for yt, yp in zip(y_main_true, y_main_pred) if yt == yp
    )

    class_balance_analysis: list[dict[str, Any]] = []
    for label_id in sorted(id2label.keys()):
        name = id2label[label_id]
        tp = test_correct_counts[name]
        sup = test_true_counts[name]
        pred_n = test_pred_counts[name]
        prec = tp / pred_n if pred_n else 0.0
        rec_rate = tp / sup if sup else 0.0
        f1 = (2 * prec * rec_rate / (prec + rec_rate)) if (prec + rec_rate) else 0.0
        class_balance_analysis.append(
            {
                "main_topic": name,
                "main_topic_id": name_to_id[name],
                "train_support": train_counts[name],
                "test_support": sup,
                "test_predicted": pred_n,
                "precision": round(prec, 4),
                "recall": round(rec_rate, 4),
                "f1": round(f1, 4),
            }
        )

    total_sub_errors = main_correct_sub_wrong + main_wrong_sub_wrong
    return {
        "total_samples": total,
        "decomposition": {
            "joint_correct": joint_correct,
            "joint_accuracy": round(joint_correct / total, 4) if total else 0.0,
            "main_correct_sub_wrong": main_correct_sub_wrong,
            "cascading_main_wrong_sub_wrong": main_wrong_sub_wrong,
            "cascading_share_of_all_subtopic_errors": (
                round(main_wrong_sub_wrong / total_sub_errors, 4) if total_sub_errors else 0.0
            ),
            "pure_cascading_recoverable_by_oracle_main": pure_cascading_recoverable,
            "recoverable_share_of_cascading": (
                round(pure_cascading_recoverable / main_wrong_sub_wrong, 4)
                if main_wrong_sub_wrong
                else 0.0
            ),
        },
        "confusion": build_main_confusion_summary(y_main_true, y_main_pred, taxonomy),
        "class_imbalance": class_balance_analysis,
        "error_rate_by_sense_index": {
            k: _rate_summary(v) for k, v in sorted(by_sense_bucket.items())
        },
        "error_rate_by_label_source": {
            k: _rate_summary(v) for k, v in sorted(by_label_source.items())
        },
        "error_rate_by_source_topic": dict(
            sorted(
                ((k, _rate_summary(v)) for k, v in by_source_topic.items()),
                key=lambda item: -item[1]["error_rate"],
            )
        ),
        "error_rate_by_confidence": {
            k: _rate_summary(v) for k, v in sorted(by_conf_bucket.items())
        },
        "sample_cascading_errors": cascading_examples[:max_examples],
        "sample_subtopic_only_errors": sub_only_examples[:15],
    }


def format_error_analysis_markdown(report: dict[str, Any]) -> str:
    """Format detailed Frozen MiniLM error analysis as a readable Markdown report."""
    d = report["decomposition"]
    lines = [
        "# Error Analysis: Primary Baseline (`Frozen MiniLM + Logistic Regression`)",
        "",
        f"Evaluated on `{report['split']}` (`{report['total_samples']}` samples).",
        "",
        "## 1. Cascading Error Decomposition (Main Topic -> Subtopic)",
        "",
        "| Outcome Category | Count | Share |",
        "| :--- | ---: | ---: |",
        f"| Joint Correct (Main OK & Subtopic OK) | {d['joint_correct']} | {d['joint_accuracy']:.2%} |",
        f"| Subtopic-only Error (Main OK, Subtopic Wrong) | {d['main_correct_sub_wrong']} | {d['main_correct_sub_wrong'] / report['total_samples']:.2%} |",
        f"| **Cascading Error (Main Wrong -> Subtopic Wrong)** | **{d['cascading_main_wrong_sub_wrong']}** | **{d['cascading_main_wrong_sub_wrong'] / report['total_samples']:.2%}** |",
        "",
        f"- **Share of all Subtopic errors caused by Main Topic errors:** `{d['cascading_share_of_all_subtopic_errors']:.2%}`",
        f"- **Cascading errors immediately fixed if Main Topic were Oracle:** `{d['pure_cascading_recoverable_by_oracle_main']} / {d['cascading_main_wrong_sub_wrong']}` (`{d['recoverable_share_of_cascading']:.2%}`)",
        "",
        "## 2. Main Topic Confusion Matrix (11 x 11)",
        "",
    ]

    cm_info = report["confusion"]
    short = cm_info["short_labels"]
    lines.append("| True \\ Pred | " + " | ".join(short) + " |")
    lines.append("| :--- | " + " | ".join("---:" for _ in short) + " |")
    for idx, row in enumerate(cm_info["matrix"]):
        lines.append(f"| **{short[idx]}** | " + " | ".join(str(v) for v in row) + " |")

    lines.extend(
        [
            "",
            "### Top Confused Main Topic Pairs",
            "",
            "| True Main Topic | Predicted Main Topic | Errors | % of True Class |",
            "| :--- | :--- | ---: | ---: |",
        ]
    )
    for pair in cm_info["top_confused_pairs"]:
        lines.append(
            f"| {pair['true_main']} (`{pair['true_id']}`) "
            f"| {pair['pred_main']} (`{pair['pred_id']}`) "
            f"| {pair['count']} | {pair['rate_of_true']:.1%} |"
        )

    lines.extend(
        [
            "",
            "## 3. Class Imbalance & Per-Class Performance",
            "",
            "| Main Topic | Train Support | Test Support | Test Predicted | Precision | Recall | F1 |",
            "| :--- | ---: | ---: | ---: | ---: | ---: | ---: |",
        ]
    )
    for row in sorted(report["class_imbalance"], key=lambda r: r["train_support"]):
        lines.append(
            f"| {row['main_topic']} (`{row['main_topic_id']}`) "
            f"| {row['train_support']} | {row['test_support']} | {row['test_predicted']} "
            f"| {row['precision']:.4f} | {row['recall']:.4f} | {row['f1']:.4f} |"
        )

    lines.extend(
        [
            "",
            "## 4. Label Quality & Polysemy Diagnostics",
            "",
            "### By Sense Position (`sense_index`)",
            "| Bucket | Samples | Main Errors | Main Error Rate |",
            "| :--- | ---: | ---: | ---: |",
        ]
    )
    for k, v in report["error_rate_by_sense_index"].items():
        lines.append(f"| {k} | {v['total']} | {v['errors']} | {v['error_rate']:.2%} |")

    lines.extend(
        [
            "",
            "### By Label Source",
            "| Label Source | Samples | Main Errors | Main Error Rate |",
            "| :--- | ---: | ---: | ---: |",
        ]
    )
    for k, v in report["error_rate_by_label_source"].items():
        lines.append(f"| `{k}` | {v['total']} | {v['errors']} | {v['error_rate']:.2%} |")

    lines.extend(
        [
            "",
            "### By Raw `source_topic` (Top Error Rates)",
            "| Source Topic | Samples | Main Errors | Main Error Rate |",
            "| :--- | ---: | ---: | ---: |",
        ]
    )
    for k, v in list(report["error_rate_by_source_topic"].items())[:12]:
        lines.append(f"| `{k}` | {v['total']} | {v['errors']} | {v['error_rate']:.2%} |")

    lines.extend(
        [
            "",
            "## 5. Sample Recoverable Cascading Errors (For Manual Inspection)",
            "",
            "| Sample | POS | Sense | Source Topic | True Main -> Pred Main (Conf) | True Sub -> E2E / Oracle Sub | Definition |",
            "| :--- | :--- | ---: | :--- | :--- | :--- | :--- |",
        ]
    )
    for ex in report["sample_cascading_errors"][:15]:
        defn = str(ex["definition"] or "").replace("|", "/")[:70]
        lines.append(
            f"| `{ex['sample_id']}` | {ex['pos']} | {ex['sense_index']} | `{ex['source_topic']}` "
            f"| `{ex['true_main_id']}` -> `{ex['pred_main_id']}` ({ex['pred_main_conf']:.2f}) "
            f"| `{ex['true_subtopic']}` -> `{ex['pred_subtopic_e2e']}` / `{ex['pred_subtopic_oracle']}` "
            f"| {defn} |"
        )
    lines.append("")
    return "\n".join(lines)


def run_frozen_minilm_error_analysis(
    config_path: Path | str = DEFAULT_BASELINE_CONFIG_PATH,
    *,
    split: str = "test",
    model_path: Path | str | None = None,
    output_dir: Path | str | None = None,
    minilm_encoder_fn: Callable[..., Any] = encode_frozen_minilm,
) -> dict[str, Any]:
    """Run full error analysis on the primary Frozen MiniLM + LogReg baseline."""
    cfg = load_json(config_path)
    taxonomy = load_taxonomy(_resolve_path(cfg["taxonomy_path"]))
    train_records = load_records(_resolve_path(cfg["train_path"]))

    split_key = f"{split}_path"
    if split_key not in cfg:
        raise ValueError(f"Unsupported split '{split}'; expected train, val, or test.")
    eval_records = load_records(_resolve_path(cfg[split_key]))

    out_dir = Path(output_dir) if output_dir else _resolve_path(cfg["output_dir"])
    out_dir.mkdir(parents=True, exist_ok=True)
    ckpt_path = Path(model_path) if model_path else out_dir / "frozen_minilm_logreg.pkl"

    with ckpt_path.open("rb") as f:
        clf: HierarchicalLinearBaseline = pickle.load(f)

    eval_texts, y_main_true, y_sub_true = extract_texts_and_labels(eval_records, taxonomy)
    minilm_cfg = cfg.get("minilm", {})
    X_eval = minilm_encoder_fn(eval_texts, **minilm_cfg)

    y_main_pred = clf.predict_main(X_eval)
    y_sub_e2e = clf.predict_subtopics_given_main(X_eval, y_main_pred)
    y_sub_oracle = clf.predict_subtopics_given_main(X_eval, y_main_true)
    raw_probs = clf.main_clf.predict_proba(X_eval)
    main_probs = np.zeros((len(eval_records), len(taxonomy["id2label"])), dtype=float)
    for col_idx, class_id in enumerate(clf.main_clf.classes_):
        main_probs[:, int(class_id)] = raw_probs[:, col_idx]

    report = analyze_hierarchical_errors(
        records=eval_records,
        train_records=train_records,
        y_main_true=y_main_true,
        y_main_pred=y_main_pred,
        y_sub_true=y_sub_true,
        y_sub_pred_e2e=y_sub_e2e,
        y_sub_pred_oracle=y_sub_oracle,
        main_probs=main_probs,
        taxonomy=taxonomy,
    )
    report["split"] = split
    report["model"] = "frozen_minilm_logreg"

    save_json(report, out_dir / "frozen_minilm_error_analysis.json")
    md = format_error_analysis_markdown(report)
    (out_dir / "frozen_minilm_error_analysis.md").write_text(md, encoding="utf-8")
    return report


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parse CLI arguments for Frozen MiniLM error analysis."""
    parser = argparse.ArgumentParser(
        description="Error analysis for primary baseline (Frozen MiniLM + Logistic Regression)."
    )
    parser.add_argument("--config", type=Path, default=DEFAULT_BASELINE_CONFIG_PATH)
    parser.add_argument("--split", choices=("val", "test"), default="test")
    parser.add_argument("--model-path", type=Path, default=None)
    parser.add_argument("--output-dir", type=Path, default=None)
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    """CLI entrypoint for error analysis."""
    args = parse_args(argv)
    report = run_frozen_minilm_error_analysis(
        config_path=args.config,
        split=args.split,
        model_path=args.model_path,
        output_dir=args.output_dir,
    )
    print(format_error_analysis_markdown(report))


if __name__ == "__main__":
    main()
