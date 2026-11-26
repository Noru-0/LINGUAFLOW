"""Shared evaluation metrics for Main Topic (11), General vs Topical, and Subtopic (45)."""

from __future__ import annotations

from typing import Any

from sklearn.metrics import accuracy_score, f1_score, precision_recall_fscore_support


def compute_classification_metrics(
    y_true: list[int],
    y_pred: list[int],
    *,
    label_names: dict[int, str] | None = None,
) -> dict[str, Any]:
    """Compute accuracy, macro F1, weighted F1, and optional per-class breakdown."""
    acc = float(accuracy_score(y_true, y_pred))
    macro_f1 = float(f1_score(y_true, y_pred, average="macro", zero_division=0))
    weighted_f1 = float(f1_score(y_true, y_pred, average="weighted", zero_division=0))

    result: dict[str, Any] = {
        "accuracy": round(acc, 4),
        "macro_f1": round(macro_f1, 4),
        "weighted_f1": round(weighted_f1, 4),
    }

    if label_names is not None:
        labels = sorted(set(y_true) | set(y_pred))
        precisions, recalls, f1s, supports = precision_recall_fscore_support(
            y_true, y_pred, labels=labels, zero_division=0
        )
        per_class: dict[str, dict[str, Any]] = {}
        for label_id, p, r, f1, sup in zip(labels, precisions, recalls, f1s, supports):
            name = label_names.get(label_id, str(label_id))
            per_class[name] = {
                "precision": round(float(p), 4),
                "recall": round(float(r), 4),
                "f1": round(float(f1), 4),
                "support": int(sup),
            }
        result["per_class"] = per_class

    return result


def evaluate_hierarchical_predictions(
    *,
    y_main_true: list[int],
    y_main_pred: list[int],
    y_sub_true: list[int],
    y_sub_pred_e2e: list[int],
    y_sub_pred_oracle: list[int],
    taxonomy: dict[str, Any],
) -> dict[str, Any]:
    """Evaluate Task 1 (Main Topic), General vs Topical, and Task 2 (Subtopic)."""
    id2label: dict[int, str] = taxonomy["id2label"]
    id2subtopic: dict[int, str] = taxonomy["id2subtopic"]
    gen_label_id = taxonomy["label2id"]["General Vocabulary"]

    main_metrics = compute_classification_metrics(
        y_main_true, y_main_pred, label_names=id2label
    )
    sub_e2e_metrics = compute_classification_metrics(
        y_sub_true, y_sub_pred_e2e, label_names=id2subtopic
    )
    sub_oracle_metrics = compute_classification_metrics(
        y_sub_true, y_sub_pred_oracle, label_names=id2subtopic
    )

    y_gen_true = [1 if y == gen_label_id else 0 for y in y_main_true]
    y_gen_pred = [1 if y == gen_label_id else 0 for y in y_main_pred]
    gen_p, gen_r, gen_f1, _ = precision_recall_fscore_support(
        y_gen_true, y_gen_pred, labels=[1], zero_division=0
    )

    joint_correct = sum(
        1
        for mt, mp, st, sp in zip(y_main_true, y_main_pred, y_sub_true, y_sub_pred_e2e)
        if mt == mp and st == sp
    )
    joint_acc = round(joint_correct / len(y_main_true), 4) if y_main_true else 0.0

    return {
        "num_samples": len(y_main_true),
        "main_topic": main_metrics,
        "general_vs_topical": {
            "general_precision": round(float(gen_p[0]), 4),
            "general_recall": round(float(gen_r[0]), 4),
            "general_f1": round(float(gen_f1[0]), 4),
        },
        "subtopic_end_to_end": sub_e2e_metrics,
        "subtopic_oracle_main": sub_oracle_metrics,
        "joint_exact_match": joint_acc,
    }


def format_benchmark_markdown(results: dict[str, Any]) -> str:
    """Format multi-model baseline evaluation results into a Markdown comparison table."""
    lines = [
        "# Baseline Models Benchmark Results",
        "",
        "## Test Set Summary",
        "",
        "| Model | Main Acc | Main Macro F1 | Main Weighted F1 | General F1 | Subtopic E2E Macro F1 | Subtopic Oracle Macro F1 | Joint Acc |",
        "| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ]
    for model_key, entry in results.get("models", {}).items():
        m = entry["test"]
        lines.append(
            f"| {entry['display_name']} (`{model_key}`) "
            f"| {m['main_topic']['accuracy']:.4f} "
            f"| {m['main_topic']['macro_f1']:.4f} "
            f"| {m['main_topic']['weighted_f1']:.4f} "
            f"| {m['general_vs_topical']['general_f1']:.4f} "
            f"| {m['subtopic_end_to_end']['macro_f1']:.4f} "
            f"| {m['subtopic_oracle_main']['macro_f1']:.4f} "
            f"| {m['joint_exact_match']:.4f} |"
        )

    lines.extend(
        [
            "",
            "## Validation Set Summary",
            "",
            "| Model | Main Acc | Main Macro F1 | Subtopic E2E Macro F1 | Subtopic Oracle Macro F1 | Fit Time (s) |",
            "| :--- | ---: | ---: | ---: | ---: | ---: |",
        ]
    )
    for model_key, entry in results.get("models", {}).items():
        m = entry["val"]
        lines.append(
            f"| {entry['display_name']} (`{model_key}`) "
            f"| {m['main_topic']['accuracy']:.4f} "
            f"| {m['main_topic']['macro_f1']:.4f} "
            f"| {m['subtopic_end_to_end']['macro_f1']:.4f} "
            f"| {m['subtopic_oracle_main']['macro_f1']:.4f} "
            f"| {entry['fit_seconds']:.2f} |"
        )
    lines.append("")
    return "\n".join(lines)
