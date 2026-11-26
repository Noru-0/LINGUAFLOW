"""Stage 2 Experiments (E1-E4): class weighting, input ablation, gen correction, polysemy."""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Any, Callable

from sklearn.linear_model import LogisticRegression

from src.data.common import PACKAGE_ROOT, load_json, load_records, load_taxonomy, save_json
from src.data.preprocess import build_model_text
from src.evaluation.metrics import evaluate_hierarchical_predictions
from src.models.baselines import (
    HierarchicalLinearBaseline,
    compute_power_class_weights,
    encode_frozen_minilm,
)
from src.training.train_baselines import DEFAULT_BASELINE_CONFIG_PATH, extract_texts_and_labels

DEFAULT_EXPERIMENTS_DIR = PACKAGE_ROOT / "artifacts" / "experiments"

# Recorded pre-correction (v1.1 noisy gen) test metrics from initial Frozen MiniLM baseline
PRE_CORRECTION_V11_METRICS = {
    "balanced": {
        "main_acc": 0.6194,
        "main_macro_f1": 0.5975,
        "sub_e2e_macro_f1": 0.4442,
        "joint_acc": 0.5207,
    },
    "none": {
        "main_acc": 0.6752,
        "main_macro_f1": 0.6411,
        "sub_e2e_macro_f1": 0.4855,
    },
}


def _resolve_path(path_value: str | Path) -> Path:
    path = Path(path_value)
    return path if path.is_absolute() else PACKAGE_ROOT / path


def format_ablation_text(record: dict[str, Any], variant: str) -> str:
    """Format sense text according to input ablation variant."""
    if variant == "word_pos_def":
        return build_model_text(record, include_examples=False, include_collocations=False)
    if variant == "word_pos_def_col":
        return build_model_text(record, include_examples=False, include_collocations=True)
    if variant == "word_pos_def_ex":
        return build_model_text(record, include_examples=True, include_collocations=False)
    if variant == "full":
        return build_model_text(record, include_examples=True, include_collocations=True)
    raise ValueError(f"Unknown input variant '{variant}'.")


class _PowerWeightedLogRegFactory:
    """Picklable factory applying power-smoothed class weights per fit target."""

    def __init__(self, *, C: float = 2.0, alpha: float | None = None, balanced: bool = False, seed: int = 42) -> None:
        self.C = C
        self.alpha = alpha
        self.balanced = balanced
        self.seed = seed

    def make(self, y: list[int]) -> LogisticRegression:
        if self.balanced:
            cw: Any = "balanced"
        elif self.alpha is not None and self.alpha > 0.0:
            cw = compute_power_class_weights(y, alpha=self.alpha)
        else:
            cw = None
        return LogisticRegression(C=self.C, max_iter=1000, class_weight=cw, random_state=self.seed)


def _fit_eval_frozen(
    *,
    X_train: Any,
    X_val: Any,
    X_test: Any,
    y_train_main: list[int],
    y_train_sub: list[int],
    y_val_main: list[int],
    y_val_sub: list[int],
    y_test_main: list[int],
    y_test_sub: list[int],
    taxonomy: dict[str, Any],
    C: float = 2.0,
    alpha: float | None = None,
    balanced: bool = False,
    seed: int = 42,
) -> tuple[HierarchicalLinearBaseline, dict[str, Any], dict[str, Any], list[int], list[int], list[int]]:
    factory = _PowerWeightedLogRegFactory(C=C, alpha=alpha, balanced=balanced, seed=seed)

    # Fit main and per-topic subtopic estimators with respective power weights.
    clf = HierarchicalLinearBaseline(lambda: factory.make(y_train_main))
    clf.main_clf = factory.make(y_train_main)
    clf.main_clf.fit(X_train, y_train_main)

    from collections import defaultdict
    import numpy as np
    from src.models.baselines import _ConstantLabelModel

    y_sub_arr = np.asarray(y_train_sub, dtype=int)
    indices_by_main: dict[int, list[int]] = defaultdict(list)
    for idx, main_id in enumerate(y_train_main):
        indices_by_main[int(main_id)].append(idx)

    clf.sub_clfs = {}
    for main_id, row_indices in sorted(indices_by_main.items()):
        sub_targets = y_sub_arr[row_indices]
        unique_subs = np.unique(sub_targets)
        if len(unique_subs) == 1:
            clf.sub_clfs[main_id] = _ConstantLabelModel(int(unique_subs[0]))
        else:
            sub_clf = factory.make(sub_targets.tolist())
            sub_clf.fit(X_train[row_indices], sub_targets)
            clf.sub_clfs[main_id] = sub_clf

    val_main_pred, val_sub_e2e = clf.predict(X_val)
    val_sub_oracle = clf.predict_subtopics_given_main(X_val, y_val_main)
    val_metrics = evaluate_hierarchical_predictions(
        y_main_true=y_val_main,
        y_main_pred=val_main_pred,
        y_sub_true=y_val_sub,
        y_sub_pred_e2e=val_sub_e2e,
        y_sub_pred_oracle=val_sub_oracle,
        taxonomy=taxonomy,
    )

    test_main_pred, test_sub_e2e = clf.predict(X_test)
    test_sub_oracle = clf.predict_subtopics_given_main(X_test, y_test_main)
    test_metrics = evaluate_hierarchical_predictions(
        y_main_true=y_test_main,
        y_main_pred=test_main_pred,
        y_sub_true=y_test_sub,
        y_sub_pred_e2e=test_sub_e2e,
        y_sub_pred_oracle=test_sub_oracle,
        taxonomy=taxonomy,
    )
    return clf, val_metrics, test_metrics, test_main_pred, test_sub_e2e, test_sub_oracle


def _subset_metrics(
    indices: list[int],
    y_main_true: list[int],
    y_main_pred: list[int],
    y_sub_true: list[int],
    y_sub_e2e: list[int],
    y_sub_oracle: list[int],
    taxonomy: dict[str, Any],
) -> dict[str, Any]:
    return evaluate_hierarchical_predictions(
        y_main_true=[y_main_true[i] for i in indices],
        y_main_pred=[y_main_pred[i] for i in indices],
        y_sub_true=[y_sub_true[i] for i in indices],
        y_sub_pred_e2e=[y_sub_e2e[i] for i in indices],
        y_sub_pred_oracle=[y_sub_oracle[i] for i in indices],
        taxonomy=taxonomy,
    )


def run_stage2_experiments(
    config_path: Path | str = DEFAULT_BASELINE_CONFIG_PATH,
    *,
    output_dir: Path | str = DEFAULT_EXPERIMENTS_DIR,
    minilm_encoder_fn: Callable[..., Any] = encode_frozen_minilm,
) -> dict[str, Any]:
    """Run E1 (class_weight), E2 (input ablation), E3 (gen correction), E4 (primary vs secondary)."""
    cfg = load_json(config_path)
    seed = int(cfg.get("seed", 42))
    taxonomy = load_taxonomy(_resolve_path(cfg["taxonomy_path"]))
    minilm_cfg = cfg.get("minilm", {})

    train_records = load_records(_resolve_path(cfg["train_path"]))
    val_records = load_records(_resolve_path(cfg["val_path"]))
    test_records = load_records(_resolve_path(cfg["test_path"]))

    _, y_train_main, y_train_sub = extract_texts_and_labels(train_records, taxonomy)
    _, y_val_main, y_val_sub = extract_texts_and_labels(val_records, taxonomy)
    _, y_test_main, y_test_sub = extract_texts_and_labels(test_records, taxonomy)

    # Encode all 4 input variants once to run E1-E4 cleanly and fast.
    variants = ("full", "word_pos_def_col", "word_pos_def_ex", "word_pos_def")
    extra_kw: dict[str, Any] = {}
    if minilm_encoder_fn is encode_frozen_minilm:
        from src.models.hierarchical_classifier import load_encoder_and_tokenizer

        enc, tok = load_encoder_and_tokenizer(
            minilm_cfg.get("model_name", "sentence-transformers/all-MiniLM-L6-v2")
        )
        extra_kw = {"encoder": enc, "tokenizer": tok}

    embeddings: dict[str, tuple[Any, Any, Any]] = {}
    for var in variants:
        tr_t = [format_ablation_text(r, var) for r in train_records]
        va_t = [format_ablation_text(r, var) for r in val_records]
        te_t = [format_ablation_text(r, var) for r in test_records]
        embeddings[var] = (
            minilm_encoder_fn(tr_t, **minilm_cfg, **extra_kw),
            minilm_encoder_fn(va_t, **minilm_cfg, **extra_kw),
            minilm_encoder_fn(te_t, **minilm_cfg, **extra_kw),
        )

    X_tr_full, X_va_full, X_te_full = embeddings["full"]

    # E1: class_weight ablation on full input
    e1_configs = [
        ("balanced", {"balanced": True, "alpha": None}),
        ("power_0.75", {"balanced": False, "alpha": 0.75}),
        ("power_0.50", {"balanced": False, "alpha": 0.50}),
        ("power_0.25", {"balanced": False, "alpha": 0.25}),
        ("none", {"balanced": False, "alpha": None}),
    ]
    e1_results: dict[str, Any] = {}
    best_e1_name = "none"
    best_e1_val_f1 = -1.0
    best_e1_params: dict[str, Any] = {"balanced": False, "alpha": None}

    for name, kw in e1_configs:
        _, val_m, test_m, _, _, _ = _fit_eval_frozen(
            X_train=X_tr_full,
            X_val=X_va_full,
            X_test=X_te_full,
            y_train_main=y_train_main,
            y_train_sub=y_train_sub,
            y_val_main=y_val_main,
            y_val_sub=y_val_sub,
            y_test_main=y_test_main,
            y_test_sub=y_test_sub,
            taxonomy=taxonomy,
            seed=seed,
            **kw,
        )
        e1_results[name] = {"val": val_m, "test": test_m}
        if val_m["main_topic"]["macro_f1"] > best_e1_val_f1:
            best_e1_val_f1 = val_m["main_topic"]["macro_f1"]
            best_e1_name = name
            best_e1_params = kw

    # E2: Input ablation using best class_weight strategy from E1
    e2_results: dict[str, Any] = {}
    best_e2_name = "full"
    best_e2_val_f1 = -1.0
    best_preds: tuple[list[int], list[int], list[int]] = ([], [], [])

    for var in variants:
        X_tr_v, X_va_v, X_te_v = embeddings[var]
        _, val_m, test_m, p_main, p_sub_e2e, p_sub_ora = _fit_eval_frozen(
            X_train=X_tr_v,
            X_val=X_va_v,
            X_test=X_te_v,
            y_train_main=y_train_main,
            y_train_sub=y_train_sub,
            y_val_main=y_val_main,
            y_val_sub=y_val_sub,
            y_test_main=y_test_main,
            y_test_sub=y_test_sub,
            taxonomy=taxonomy,
            seed=seed,
            **best_e1_params,
        )
        e2_results[var] = {"val": val_m, "test": test_m}
        if val_m["main_topic"]["macro_f1"] > best_e2_val_f1:
            best_e2_val_f1 = val_m["main_topic"]["macro_f1"]
            best_e2_name = var
            best_preds = (p_main, p_sub_e2e, p_sub_ora)

    # E3: General-label correction comparison (v1.1 noisy vs v1.2 Stage 1 corrected, in pp)
    v12_bal = e1_results["balanced"]["test"]
    v12_none = e1_results["none"]["test"]
    e3_results = {
        "balanced_v11": PRE_CORRECTION_V11_METRICS["balanced"],
        "balanced_v12": {
            "main_acc": v12_bal["main_topic"]["accuracy"],
            "main_macro_f1": v12_bal["main_topic"]["macro_f1"],
            "sub_e2e_macro_f1": v12_bal["subtopic_end_to_end"]["macro_f1"],
            "joint_acc": v12_bal["joint_exact_match"],
        },
        "none_v11": PRE_CORRECTION_V11_METRICS["none"],
        "none_v12": {
            "main_acc": v12_none["main_topic"]["accuracy"],
            "main_macro_f1": v12_none["main_topic"]["macro_f1"],
            "sub_e2e_macro_f1": v12_none["subtopic_end_to_end"]["macro_f1"],
            "joint_acc": v12_none["joint_exact_match"],
        },
    }

    # E4: Primary (sense_index=0) vs Secondary (sense_index>0) vs Clean Audited Benchmark
    p_main, p_sub_e2e, p_sub_ora = best_preds
    primary_idx = [i for i, r in enumerate(test_records) if int(r.get("sense_index", 0)) == 0]
    secondary_idx = [i for i, r in enumerate(test_records) if int(r.get("sense_index", 0)) > 0]
    audited_idx = [
        i
        for i, r in enumerate(test_records)
        if not r.get("secondary_conflict", False) and r.get("gen_audit_flag") is None
    ]
    e4_results = {
        "best_config": {"weighting": best_e1_name, "input_variant": best_e2_name},
        "all_test": _subset_metrics(
            list(range(len(test_records))),
            y_test_main,
            p_main,
            y_test_sub,
            p_sub_e2e,
            p_sub_ora,
            taxonomy,
        ),
        "primary_only": _subset_metrics(
            primary_idx, y_test_main, p_main, y_test_sub, p_sub_e2e, p_sub_ora, taxonomy
        )
        if primary_idx
        else None,
        "secondary_only": _subset_metrics(
            secondary_idx, y_test_main, p_main, y_test_sub, p_sub_e2e, p_sub_ora, taxonomy
        )
        if secondary_idx
        else None,
        "audited_clean_benchmark": _subset_metrics(
            audited_idx, y_test_main, p_main, y_test_sub, p_sub_e2e, p_sub_ora, taxonomy
        )
        if audited_idx
        else None,
    }

    summary = {
        "best_e1_weighting": best_e1_name,
        "best_e2_input": best_e2_name,
        "E1_class_weight_ablation": e1_results,
        "E2_input_ablation": e2_results,
        "E3_general_label_correction": e3_results,
        "E4_primary_vs_secondary": e4_results,
    }
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)
    save_json(summary, out / "stage2_e1_e4_results.json")
    (out / "stage2_e1_e4_report.md").write_text(
        format_stage2_markdown(summary), encoding="utf-8"
    )
    return summary


def format_stage2_markdown(summary: dict[str, Any]) -> str:
    """Format E1-E4 experiment results with deltas in percentage points (pp)."""
    lines = [
        "# Stage 2 Experiments (E1–E4): Frozen MiniLM + Logistic Regression",
        "",
        "## E1: Class Weight Ablation (`full` input)",
        "",
        "| Weighting | Val Main Macro F1 | Test Main Acc | Test Main Macro F1 | Test General F1 | Test Sub E2E Macro F1 | Test Joint Acc |",
        "| :--- | ---: | ---: | ---: | ---: | ---: | ---: |",
    ]
    for name, entry in summary["E1_class_weight_ablation"].items():
        vm = entry["val"]
        tm = entry["test"]
        lines.append(
            f"| `{name}` | {vm['main_topic']['macro_f1']:.4f} "
            f"| {tm['main_topic']['accuracy']:.4f} | {tm['main_topic']['macro_f1']:.4f} "
            f"| {tm['general_vs_topical']['general_f1']:.4f} "
            f"| {tm['subtopic_end_to_end']['macro_f1']:.4f} | {tm['joint_exact_match']:.4f} |"
        )

    lines.extend(
        [
            "",
            f"## E2: Input Ablation (`weighting={summary['best_e1_weighting']}`)",
            "",
            "| Input Variant | Val Main Macro F1 | Test Main Acc | Test Main Macro F1 | Test Sub E2E Macro F1 | Test Sub Oracle Macro F1 | Test Joint Acc |",
            "| :--- | ---: | ---: | ---: | ---: | ---: | ---: |",
        ]
    )
    for var, entry in summary["E2_input_ablation"].items():
        vm = entry["val"]
        tm = entry["test"]
        lines.append(
            f"| `{var}` | {vm['main_topic']['macro_f1']:.4f} "
            f"| {tm['main_topic']['accuracy']:.4f} | {tm['main_topic']['macro_f1']:.4f} "
            f"| {tm['subtopic_end_to_end']['macro_f1']:.4f} | {tm['subtopic_oracle_main']['macro_f1']:.4f} "
            f"| {tm['joint_exact_match']:.4f} |"
        )

    e3 = summary["E3_general_label_correction"]
    d_bal_acc = (e3["balanced_v12"]["main_acc"] - e3["balanced_v11"]["main_acc"]) * 100
    d_bal_f1 = (e3["balanced_v12"]["main_macro_f1"] - e3["balanced_v11"]["main_macro_f1"]) * 100
    d_none_acc = (e3["none_v12"]["main_acc"] - e3["none_v11"]["main_acc"]) * 100
    d_none_f1 = (e3["none_v12"]["main_macro_f1"] - e3["none_v11"]["main_macro_f1"]) * 100

    lines.extend(
        [
            "",
            "## E3: General-Label Correction (`v1.1` vs `v1.2` corrected)",
            "",
            "| Setting | Main Acc | Main Macro F1 | Sub E2E Macro F1 |",
            "| :--- | ---: | ---: | ---: |",
            f"| `balanced` (v1.1 pre-correction) | {e3['balanced_v11']['main_acc']:.4f} | {e3['balanced_v11']['main_macro_f1']:.4f} | {e3['balanced_v11']['sub_e2e_macro_f1']:.4f} |",
            f"| `balanced` (v1.2 corrected) | {e3['balanced_v12']['main_acc']:.4f} ({d_bal_acc:+.2f} pp) | {e3['balanced_v12']['main_macro_f1']:.4f} ({d_bal_f1:+.2f} pp) | {e3['balanced_v12']['sub_e2e_macro_f1']:.4f} |",
            f"| `none` (v1.1 pre-correction) | {e3['none_v11']['main_acc']:.4f} | {e3['none_v11']['main_macro_f1']:.4f} | {e3['none_v11']['sub_e2e_macro_f1']:.4f} |",
            f"| `none` (v1.2 corrected) | {e3['none_v12']['main_acc']:.4f} ({d_none_acc:+.2f} pp) | {e3['none_v12']['main_macro_f1']:.4f} ({d_none_f1:+.2f} pp) | {e3['none_v12']['sub_e2e_macro_f1']:.4f} |",
            "",
            f"## E4: Primary vs Secondary Sense Evaluation (`{summary['best_e1_weighting']}` + `{summary['best_e2_input']}`)",
            "",
            "| Test Subset | Samples | Main Acc | Main Macro F1 | Sub E2E Macro F1 | Sub Oracle Macro F1 | Joint Acc |",
            "| :--- | ---: | ---: | ---: | ---: | ---: | ---: |",
        ]
    )
    for key in ("all_test", "primary_only", "secondary_only", "audited_clean_benchmark"):
        m = summary["E4_primary_vs_secondary"].get(key)
        if m is None:
            continue
        lines.append(
            f"| `{key}` | {m['num_samples']} "
            f"| {m['main_topic']['accuracy']:.4f} | {m['main_topic']['macro_f1']:.4f} "
            f"| {m['subtopic_end_to_end']['macro_f1']:.4f} | {m['subtopic_oracle_main']['macro_f1']:.4f} "
            f"| {m['joint_exact_match']:.4f} |"
        )
    lines.append("")
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="Run Stage 2 experiments E1-E4.")
    parser.add_argument("--config", type=Path, default=DEFAULT_BASELINE_CONFIG_PATH)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_EXPERIMENTS_DIR)
    args = parser.parse_args(argv)
    summary = run_stage2_experiments(config_path=args.config, output_dir=args.output_dir)
    print(format_stage2_markdown(summary))


if __name__ == "__main__":
    main()
