"""Research Experiments E7-E10:
- E7: Subtopic Head Recovery (isolate encoder drift vs linear head convergence)
- E8: Multi-task Loss Ablation L = L_main + lambda * L_sub (GPU required)
- E9: Top-K Metric Validation (verify hierarchy invariants, Top-K recall, joint MAP)
- E10: Selective Prediction (val threshold selection, risk-coverage curve, AURC, test eval)
"""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Any

import numpy as np
import torch
from sklearn.linear_model import LogisticRegression

from src.data.common import DEFAULT_TAXONOMY_PATH, PACKAGE_ROOT, load_json, load_records, load_taxonomy, save_json
from src.evaluation.metrics import compute_classification_metrics, evaluate_hierarchical_predictions
from src.inference.hierarchical_inference import (
    DEFAULT_FINETUNED_CKPT_DIR,
    HierarchicalPredictor,
)
from src.models.baselines import (
    HierarchicalLinearBaseline,
    compute_power_class_weights,
    encode_frozen_minilm,
)
from src.models.hierarchical_classifier import HierarchicalVocabClassifier, ModelConfig
from src.training.train_baselines import DEFAULT_BASELINE_CONFIG_PATH, extract_texts_and_labels
from src.training.train_minilm import DEFAULT_TRAIN_CONFIG_PATH, VocabSenseDataset, train_finetuned_minilm

DEFAULT_EXPERIMENTS_DIR = PACKAGE_ROOT / "artifacts" / "experiments"


def _resolve_path(path_value: str | Path) -> Path:
    path = Path(path_value)
    return path if path.is_absolute() else PACKAGE_ROOT / path


def _assert_gpu_or_override(*, allow_cpu: bool, task_name: str) -> None:
    if not allow_cpu and not torch.cuda.is_available():
        raise RuntimeError(
            f"{task_name} involves neural training/fine-tuning and requires a CUDA GPU "
            "(Vast.ai). CPU execution is disabled unless --allow-cpu is explicitly passed."
        )


def run_e7_subtopic_recovery(
    *,
    train_config_path: Path | str = DEFAULT_TRAIN_CONFIG_PATH,
    baseline_config_path: Path | str = DEFAULT_BASELINE_CONFIG_PATH,
    finetuned_ckpt_dir: Path | str = DEFAULT_FINETUNED_CKPT_DIR,
    output_dir: Path | str = DEFAULT_EXPERIMENTS_DIR,
    allow_cpu: bool = False,
) -> dict[str, Any]:
    """E7: Isolate whether Subtopic drop comes from encoder drift or head convergence."""
    _assert_gpu_or_override(allow_cpu=allow_cpu, task_name="E7 Subtopic Head Recovery")

    tcfg = load_json(train_config_path)
    bcfg = load_json(baseline_config_path)
    taxonomy = load_taxonomy(_resolve_path(tcfg["taxonomy_path"]))
    seed = int(tcfg.get("seed", 42))

    train_records = load_records(_resolve_path(tcfg["train_path"]))
    val_records = load_records(_resolve_path(tcfg["val_path"]))
    test_records = load_records(_resolve_path(tcfg["test_path"]))

    tr_texts, y_tr_m, y_tr_s = extract_texts_and_labels(train_records, taxonomy)
    va_texts, y_va_m, y_va_s = extract_texts_and_labels(val_records, taxonomy)
    te_texts, y_te_m, y_te_s = extract_texts_and_labels(test_records, taxonomy)

    # Variant 1: Fine-tuned encoder + newly trained Logistic Regression (on trusted subtopics)
    ckpt = Path(finetuned_ckpt_dir)
    ft_model = HierarchicalVocabClassifier.load_checkpoint(ckpt, taxonomy_path=_resolve_path(tcfg["taxonomy_path"]))
    from src.models.hierarchical_classifier import load_encoder_and_tokenizer

    _, tok = load_encoder_and_tokenizer(ft_model.config.model_name)
    minilm_cfg = dict(bcfg.get("minilm", {}))
    X_tr = encode_frozen_minilm(tr_texts, **minilm_cfg, encoder=ft_model.encoder, tokenizer=tok)
    X_va = encode_frozen_minilm(va_texts, **minilm_cfg, encoder=ft_model.encoder, tokenizer=tok)
    X_te = encode_frozen_minilm(te_texts, **minilm_cfg, encoder=ft_model.encoder, tokenizer=tok)

    # Fit Main on all train, Subtopic on trusted train (matching Stage 3 masking!)
    trusted_idx = [i for i, r in enumerate(train_records) if r.get("is_trusted_subtopic", True)]
    main_cw = compute_power_class_weights(y_tr_m, alpha=float(tcfg.get("class_weight_alpha", 0.25)))
    main_clf = LogisticRegression(C=2.0, max_iter=1000, class_weight=main_cw, random_state=seed)
    main_clf.fit(X_tr, y_tr_m)

    sub_baseline = HierarchicalLinearBaseline(
        lambda: LogisticRegression(C=2.0, max_iter=1000, random_state=seed)
    )
    sub_baseline.fit(
        X_tr[trusted_idx],
        [y_tr_m[i] for i in trusted_idx],
        [y_tr_s[i] for i in trusted_idx],
    )
    sub_baseline.main_clf = main_clf

    va_m_pred, va_s_e2e = sub_baseline.predict(X_va)
    va_s_ora = sub_baseline.predict_subtopics_given_main(X_va, y_va_m)
    te_m_pred, te_s_e2e = sub_baseline.predict(X_te)
    te_s_ora = sub_baseline.predict_subtopics_given_main(X_te, y_te_m)

    v1_res = {
        "val": evaluate_hierarchical_predictions(
            y_main_true=y_va_m,
            y_main_pred=va_m_pred,
            y_sub_true=y_va_s,
            y_sub_pred_e2e=va_s_e2e,
            y_sub_pred_oracle=va_s_ora,
            taxonomy=taxonomy,
        ),
        "test": evaluate_hierarchical_predictions(
            y_main_true=y_te_m,
            y_main_pred=te_m_pred,
            y_sub_true=y_te_s,
            y_sub_pred_e2e=te_s_e2e,
            y_sub_pred_oracle=te_s_ora,
            taxonomy=taxonomy,
        ),
    }

    # Variant 2: Fine-tuned encoder (frozen) + trainable Subtopic/Main heads (AdamW)
    out = Path(output_dir)
    ft_model_v2 = HierarchicalVocabClassifier.load_checkpoint(ckpt, taxonomy_path=_resolve_path(tcfg["taxonomy_path"]))
    v2_res = train_finetuned_minilm(
        train_config_path,
        encoder=ft_model_v2.encoder,
        tokenizer=tok,
        output_dir_override=out / "e7_finetuned_encoder_trainable_head",
        config_overrides={"epochs": 8, "patience": 3, "head_lr": 1e-3},
        freeze_encoder=True,
    )

    # Variant 3: Frozen pretrained MiniLM encoder + trainable neural heads (AdamW)
    v3_res = train_finetuned_minilm(
        train_config_path,
        output_dir_override=out / "e7_frozen_encoder_trainable_heads",
        config_overrides={"epochs": 8, "patience": 3, "head_lr": 1e-3},
        freeze_encoder=True,
    )

    summary = {
        "finetuned_encoder_logreg": v1_res,
        "finetuned_encoder_trainable_head": {"val": v2_res["val"], "test": v2_res["test"]},
        "frozen_encoder_trainable_heads": {"val": v3_res["val"], "test": v3_res["test"]},
    }
    save_json(summary, out / "e7_subtopic_recovery_results.json")
    (out / "e7_subtopic_recovery_report.md").write_text(
        format_e7_markdown(summary), encoding="utf-8"
    )
    return summary


def run_e8_loss_ablation(
    *,
    train_config_path: Path | str = DEFAULT_TRAIN_CONFIG_PATH,
    lambdas: tuple[float, ...] = (0.25, 0.5, 1.0, 2.0),
    output_dir: Path | str = DEFAULT_EXPERIMENTS_DIR,
    allow_cpu: bool = False,
) -> dict[str, Any]:
    """E8: Multi-task loss weight ablation L = L_main + lambda * L_sub."""
    _assert_gpu_or_override(allow_cpu=allow_cpu, task_name="E8 Multi-task Loss Ablation")

    out = Path(output_dir)
    runs: dict[str, Any] = {}
    for lam in lambdas:
        res = train_finetuned_minilm(
            train_config_path,
            output_dir_override=out / f"e8_lambda_{lam}",
            model_config_overrides={"subtopic_loss_weight": float(lam)},
            freeze_encoder=False,
        )
        runs[str(lam)] = {
            "lambda": float(lam),
            "best_epoch": res["best_epoch"],
            "val": res["val"],
            "test": res["test"],
        }

    summary = {"lambdas": list(lambdas), "runs": runs}
    save_json(summary, out / "e8_loss_ablation_results.json")
    (out / "e8_loss_ablation_report.md").write_text(
        format_e8_markdown(summary), encoding="utf-8"
    )
    return summary


def run_e9_topk_validation(
    *,
    train_config_path: Path | str = DEFAULT_TRAIN_CONFIG_PATH,
    checkpoint_dir: Path | str = DEFAULT_FINETUNED_CKPT_DIR,
    output_dir: Path | str = DEFAULT_EXPERIMENTS_DIR,
    encoder: torch.nn.Module | None = None,
    tokenizer: Any | None = None,
) -> dict[str, Any]:
    """E9: Validate Top-1/Top-K Main metrics, hierarchy invariants, Top-K Subtopic Recall & Joint Acc."""
    tcfg = load_json(train_config_path)
    taxonomy_path = _resolve_path(tcfg["taxonomy_path"])
    test_path = _resolve_path(tcfg["test_path"])
    taxonomy = load_taxonomy(taxonomy_path)
    test_records = load_records(test_path)

    ckpt = Path(checkpoint_dir)
    device = "cuda" if torch.cuda.is_available() else "cpu"
    if encoder is not None and tokenizer is not None:
        mcfg = ModelConfig.from_json(ckpt / "model_config.json")
        model = HierarchicalVocabClassifier.from_config(
            mcfg, taxonomy_path=taxonomy_path, encoder=encoder
        )
        state = torch.load(ckpt / "model_state.pt", map_location=device, weights_only=True)
        model.load_state_dict(state)
        from src.inference.hierarchical_inference import CalibrationParams

        cal_path = ckpt / "calibration.json"
        cal = CalibrationParams.from_json(cal_path) if cal_path.exists() else CalibrationParams()
        predictor = HierarchicalPredictor(model, tokenizer, taxonomy, calibration=cal, device=device)
    else:
        predictor = HierarchicalPredictor.from_checkpoint(ckpt, taxonomy_path=taxonomy_path, device=device)

    test_ds = VocabSenseDataset(test_records, taxonomy, mask_untrusted_subtopics=False)
    y_main_true = test_ds.main_labels
    y_sub_true = test_ds.eval_subtopic_labels
    valid_subtopics = taxonomy["valid_subtopics"]

    invariants = {
        "hierarchy_violations": 0,
        "joint_prob_mismatches": 0,
        "non_monotonic_main_candidates": 0,
        "non_monotonic_joint_candidates": 0,
    }

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

        for p in batch_preds:
            m_probs = [c["probability"] for c in p["top_k_main_candidates"]]
            if m_probs != sorted(m_probs, reverse=True):
                invariants["non_monotonic_main_candidates"] += 1
            j_probs = [c["joint_prob"] for c in p["top_k_joint_candidates"]]
            if j_probs != sorted(j_probs, reverse=True):
                invariants["non_monotonic_joint_candidates"] += 1
            if valid_subtopics.get(p["subtopic_id"]) != p["main_topic"]:
                invariants["hierarchy_violations"] += 1
            expected_joint = p["main_topic_confidence"] * p["subtopic_confidence"]
            if abs(expected_joint - p["joint_confidence"]) > 1e-3:
                invariants["joint_prob_mismatches"] += 1

    # Pure Top-K Main Topic Recall (from top_k_main_candidates directly, independent of joint re-ranking)
    preds_k3 = preds_by_k[3]
    pure_main_recall = {}
    for k in (1, 2, 3):
        hits = sum(
            1
            for mt, p in zip(y_main_true, preds_k3)
            if taxonomy["id2label"][mt] in {c["main_topic"] for c in p["top_k_main_candidates"][:k]}
        )
        pure_main_recall[f"top_{k}_main_recall"] = round(hits / len(y_main_true), 4) if y_main_true else 0.0

    expansion_table: dict[str, Any] = {}
    k1_cascading_indices = {
        i
        for i, (mt, st, p) in enumerate(zip(y_main_true, y_sub_true, preds_by_k[1]))
        if p["main_label_id"] != mt and p["subtopic_label_id"] != st
    }

    for k_main in (1, 2, 3):
        ps = preds_by_k[k_main]
        ym_p = [p["main_label_id"] for p in ps]
        ys_p = [p["subtopic_label_id"] for p in ps]
        mm = compute_classification_metrics(y_main_true, ym_p)
        sm = compute_classification_metrics(y_sub_true, ys_p)
        joint_acc = sum(1 for mt, mp, st, sp in zip(y_main_true, ym_p, y_sub_true, ys_p) if mt == mp and st == sp) / len(y_main_true)

        sub_recall_at = {}
        for rk in (1, 2, 3):
            hits = sum(
                1
                for st, p in zip(y_sub_true, ps)
                if st in {c["subtopic_label_id"] for c in p["top_k_joint_candidates"][:rk]}
            )
            sub_recall_at[f"top_{rk}_sub_recall"] = round(hits / len(y_sub_true), 4)

        recovered_top1 = sum(1 for i in k1_cascading_indices if ys_p[i] == y_sub_true[i])
        recovered_top3 = sum(
            1
            for i in k1_cascading_indices
            if y_sub_true[i] in {c["subtopic_label_id"] for c in ps[i]["top_k_joint_candidates"][:3]}
        )
        expansion_table[f"top_{k_main}_main"] = {
            "main_acc": mm["accuracy"],
            "main_macro_f1": mm["macro_f1"],
            "sub_e2e_acc": sm["accuracy"],
            "sub_e2e_macro_f1": sm["macro_f1"],
            "joint_acc": round(joint_acc, 4),
            **sub_recall_at,
            "k1_cascading_recovered_top1": recovered_top1,
            "k1_cascading_recovered_top3": recovered_top3,
        }

    report = {
        "num_samples": len(test_records),
        "invariants": invariants,
        "pure_main_recall": pure_main_recall,
        "expansion_comparison": expansion_table,
    }
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)
    save_json(report, out / "e9_topk_validation_results.json")
    (out / "e9_topk_validation_report.md").write_text(format_e9_markdown(report), encoding="utf-8")
    return report


def _trapezoid_area(ys: list[float], xs: list[float]) -> float:
    """Compute trapezoidal area across sorted x coordinates (NumPy 1.x/2.x independent)."""
    if len(xs) < 2:
        return 0.0
    return sum(0.5 * (ys[i] + ys[i + 1]) * (xs[i + 1] - xs[i]) for i in range(len(xs) - 1))


def _compute_risk_coverage_curve(
    y_main_true: list[int],
    y_sub_true: list[int],
    preds: list[dict[str, Any]],
    *,
    score_key: str = "joint_confidence",
    num_points: int = 20,
) -> dict[str, Any]:
    """Compute Risk-Coverage curve (Risk = 1 - Acc) and trapezoidal AURC."""
    n = len(preds)
    order = sorted(range(n), key=lambda i: -float(preds[i][score_key]))
    coverages = [round((k + 1) / num_points, 2) for k in range(num_points)]
    curve: list[dict[str, Any]] = []

    for cov in coverages:
        k_n = max(1, int(round(cov * n)))
        idx_slice = order[:k_n]
        main_acc = sum(1 for i in idx_slice if preds[i]["main_label_id"] == y_main_true[i]) / k_n
        joint_acc = sum(
            1
            for i in idx_slice
            if preds[i]["main_label_id"] == y_main_true[i]
            and preds[i]["subtopic_label_id"] == y_sub_true[i]
        ) / k_n
        curve.append(
            {
                "coverage": round(k_n / n, 4),
                "threshold": round(float(preds[idx_slice[-1]][score_key]), 4),
                "main_risk": round(1.0 - main_acc, 4),
                "joint_risk": round(1.0 - joint_acc, 4),
                "main_acc": round(main_acc, 4),
                "joint_acc": round(joint_acc, 4),
            }
        )

    xs = [pt["coverage"] for pt in curve]
    aurc_main = _trapezoid_area([pt["main_risk"] for pt in curve], xs)
    aurc_joint = _trapezoid_area([pt["joint_risk"] for pt in curve], xs)
    return {
        "score_key": score_key,
        "aurc_main": round(aurc_main, 4),
        "aurc_joint": round(aurc_joint, 4),
        "curve": curve,
    }


def _select_val_thresholds(
    y_main_true: list[int],
    y_sub_true: list[int],
    val_preds: list[dict[str, Any]],
    target_coverages: tuple[float, ...] = (0.90, 0.80, 0.70, 0.60, 0.50),
) -> list[dict[str, Any]]:
    """Select (min_main_conf, min_joint_conf) thresholds on validation set."""
    grid_main = [round(0.05 * i, 2) for i in range(18)]
    grid_joint = [round(0.05 * i, 2) for i in range(16)]
    n = len(val_preds)

    candidates: list[tuple[float, float, float, float]] = []
    for tm in grid_main:
        for tj in grid_joint:
            acc_idx = [
                i
                for i, p in enumerate(val_preds)
                if p["main_topic_confidence"] >= tm and p["joint_confidence"] >= tj
            ]
            if not acc_idx:
                continue
            cov = len(acc_idx) / n
            j_acc = sum(
                1
                for i in acc_idx
                if val_preds[i]["main_label_id"] == y_main_true[i]
                and val_preds[i]["subtopic_label_id"] == y_sub_true[i]
            ) / len(acc_idx)
            candidates.append((cov, j_acc, tm, tj))

    selected: list[dict[str, Any]] = []
    for target in target_coverages:
        feasible = [c for c in candidates if c[0] >= target]
        if feasible:
            # Closest coverage above target, breaking ties by highest val joint accuracy.
            best = min(feasible, key=lambda c: (c[0] - target, -c[1]))
        else:
            best = max(candidates, key=lambda c: (c[0], c[1]))
        selected.append(
            {
                "target_coverage": target,
                "min_main_conf": best[2],
                "min_joint_conf": best[3],
                "val_coverage": round(best[0], 4),
                "val_joint_acc": round(best[1], 4),
            }
        )
    return selected


def run_e10_selective_prediction(
    *,
    train_config_path: Path | str = DEFAULT_TRAIN_CONFIG_PATH,
    checkpoint_dir: Path | str = DEFAULT_FINETUNED_CKPT_DIR,
    output_dir: Path | str = DEFAULT_EXPERIMENTS_DIR,
    encoder: torch.nn.Module | None = None,
    tokenizer: Any | None = None,
) -> dict[str, Any]:
    """E10: Select abstention thresholds on val, build risk-coverage curve, evaluate on test."""
    tcfg = load_json(train_config_path)
    taxonomy_path = _resolve_path(tcfg["taxonomy_path"])
    val_path = _resolve_path(tcfg["val_path"])
    test_path = _resolve_path(tcfg["test_path"])
    taxonomy = load_taxonomy(taxonomy_path)

    val_records = load_records(val_path)
    test_records = load_records(test_path)

    ckpt = Path(checkpoint_dir)
    device = "cuda" if torch.cuda.is_available() else "cpu"
    if encoder is not None and tokenizer is not None:
        mcfg = ModelConfig.from_json(ckpt / "model_config.json")
        model = HierarchicalVocabClassifier.from_config(
            mcfg, taxonomy_path=taxonomy_path, encoder=encoder
        )
        state = torch.load(ckpt / "model_state.pt", map_location=device, weights_only=True)
        model.load_state_dict(state)
        from src.inference.hierarchical_inference import CalibrationParams

        cal_path = ckpt / "calibration.json"
        cal = CalibrationParams.from_json(cal_path) if cal_path.exists() else CalibrationParams()
        predictor = HierarchicalPredictor(model, tokenizer, taxonomy, calibration=cal, device=device)
    else:
        predictor = HierarchicalPredictor.from_checkpoint(ckpt, taxonomy_path=taxonomy_path, device=device)

    val_ds = VocabSenseDataset(val_records, taxonomy, mask_untrusted_subtopics=False)
    test_ds = VocabSenseDataset(test_records, taxonomy, mask_untrusted_subtopics=False)

    val_preds: list[dict[str, Any]] = []
    for start in range(0, len(val_records), 64):
        val_preds.extend(predictor.predict_batch(val_records[start : start + 64], top_k_main=2))

    test_preds: list[dict[str, Any]] = []
    for start in range(0, len(test_records), 64):
        test_preds.extend(predictor.predict_batch(test_records[start : start + 64], top_k_main=2))

    val_curve = _compute_risk_coverage_curve(val_ds.main_labels, val_ds.eval_subtopic_labels, val_preds)
    test_curve = _compute_risk_coverage_curve(test_ds.main_labels, test_ds.eval_subtopic_labels, test_preds)

    selected_points = _select_val_thresholds(val_ds.main_labels, val_ds.eval_subtopic_labels, val_preds)
    total_test_joint_errors = sum(
        1
        for i, p in enumerate(test_preds)
        if not (
            p["main_label_id"] == test_ds.main_labels[i]
            and p["subtopic_label_id"] == test_ds.eval_subtopic_labels[i]
        )
    )

    test_operating_points: list[dict[str, Any]] = []
    for pt in selected_points:
        tm, tj = pt["min_main_conf"], pt["min_joint_conf"]
        acc_idx = [
            i
            for i, p in enumerate(test_preds)
            if p["main_topic_confidence"] >= tm and p["joint_confidence"] >= tj
        ]
        rej_idx = [i for i in range(len(test_preds)) if i not in set(acc_idx)]
        if not acc_idx:
            continue

        mm = compute_classification_metrics(
            [test_ds.main_labels[i] for i in acc_idx],
            [test_preds[i]["main_label_id"] for i in acc_idx],
        )
        sm = compute_classification_metrics(
            [test_ds.eval_subtopic_labels[i] for i in acc_idx],
            [test_preds[i]["subtopic_label_id"] for i in acc_idx],
        )
        joint_acc = sum(
            1
            for i in acc_idx
            if test_preds[i]["main_label_id"] == test_ds.main_labels[i]
            and test_preds[i]["subtopic_label_id"] == test_ds.eval_subtopic_labels[i]
        ) / len(acc_idx)
        captured_errors = sum(
            1
            for i in rej_idx
            if not (
                test_preds[i]["main_label_id"] == test_ds.main_labels[i]
                and test_preds[i]["subtopic_label_id"] == test_ds.eval_subtopic_labels[i]
            )
        )
        test_operating_points.append(
            {
                **pt,
                "test_coverage": round(len(acc_idx) / len(test_preds), 4),
                "accepted_samples": len(acc_idx),
                "needs_review_samples": len(rej_idx),
                "test_accepted_main_acc": mm["accuracy"],
                "test_accepted_main_macro_f1": mm["macro_f1"],
                "test_accepted_sub_acc": sm["accuracy"],
                "test_accepted_sub_macro_f1": sm["macro_f1"],
                "test_accepted_joint_acc": round(joint_acc, 4),
                "joint_error_capture_rate": (
                    round(captured_errors / total_test_joint_errors, 4)
                    if total_test_joint_errors
                    else 0.0
                ),
            }
        )

    report = {
        "val_aurc_main": val_curve["aurc_main"],
        "val_aurc_joint": val_curve["aurc_joint"],
        "test_aurc_main": test_curve["aurc_main"],
        "test_aurc_joint": test_curve["aurc_joint"],
        "val_risk_coverage_curve": val_curve["curve"],
        "test_risk_coverage_curve": test_curve["curve"],
        "operating_points": test_operating_points,
    }
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)
    save_json(report, out / "e10_selective_prediction_results.json")
    (out / "e10_selective_prediction_report.md").write_text(
        format_e10_markdown(report), encoding="utf-8"
    )
    return report


def format_e7_markdown(summary: dict[str, Any]) -> str:
    lines = [
        "# E7: Subtopic Head Recovery",
        "",
        "| Variant | Test Main Acc | Test Main Macro F1 | Test Sub E2E Macro F1 | Test Sub Oracle Macro F1 | Test Joint Acc |",
        "| :--- | ---: | ---: | ---: | ---: | ---: |",
    ]
    for name, entry in summary.items():
        t = entry["test"]
        lines.append(
            f"| `{name}` | {t['main_topic']['accuracy']:.4f} | {t['main_topic']['macro_f1']:.4f} "
            f"| {t['subtopic_end_to_end']['macro_f1']:.4f} | {t['subtopic_oracle_main']['macro_f1']:.4f} "
            f"| {t['joint_exact_match']:.4f} |"
        )
    lines.append("")
    return "\n".join(lines)


def format_e8_markdown(summary: dict[str, Any]) -> str:
    lines = [
        "# E8: Multi-Task Loss Weight Ablation ($L = L_{main} + \\lambda L_{sub}$)",
        "",
        "| $\\lambda$ | Best Epoch | Val Main F1 | Val Sub E2E F1 | Test Main Acc | Test Main Macro F1 | Test Sub E2E Macro F1 | Test Sub Oracle Macro F1 | Test Joint Acc |",
        "| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ]
    for _, run in summary["runs"].items():
        v, t = run["val"], run["test"]
        lines.append(
            f"| {run['lambda']:.2f} | {run['best_epoch']} "
            f"| {v['main_topic']['macro_f1']:.4f} | {v['subtopic_end_to_end']['macro_f1']:.4f} "
            f"| {t['main_topic']['accuracy']:.4f} | {t['main_topic']['macro_f1']:.4f} "
            f"| {t['subtopic_end_to_end']['macro_f1']:.4f} | {t['subtopic_oracle_main']['macro_f1']:.4f} "
            f"| {t['joint_exact_match']:.4f} |"
        )
    lines.append("")
    return "\n".join(lines)


def format_e9_markdown(report: dict[str, Any]) -> str:
    inv = report["invariants"]
    pmr = report["pure_main_recall"]
    lines = [
        "# E9: Top-K Metric Validation",
        "",
        "## Mathematical & Hierarchy Invariants (`test`)",
        f"- Hierarchy violations (`subtopic` parent != `main_topic`): `{inv['hierarchy_violations']}`",
        f"- Joint probability mismatches: `{inv['joint_prob_mismatches']}`",
        f"- Non-monotonic Main / Joint candidates: `{inv['non_monotonic_main_candidates']}` / `{inv['non_monotonic_joint_candidates']}`",
        "",
        "## Pure Main Topic Top-K Recall",
        f"- Top-1 Recall: `{pmr['top_1_main_recall']:.4f}` | Top-2 Recall: `{pmr['top_2_main_recall']:.4f}` | Top-3 Recall: `{pmr['top_3_main_recall']:.4f}`",
        "",
        "## Candidate Expansion Comparison (Single Main vs Joint MAP Top-K)",
        "",
        "| Strategy | Main Acc | Main Macro F1 | Sub E2E Acc | Sub E2E Macro F1 | Joint Acc | Top-2 Sub Recall | Top-3 Sub Recall | K=1 Cascading Recovered (Top-1 / Top-3) |",
        "| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ]
    for key, m in report["expansion_comparison"].items():
        lines.append(
            f"| `{key}` | {m['main_acc']:.4f} | {m['main_macro_f1']:.4f} "
            f"| {m['sub_e2e_acc']:.4f} | {m['sub_e2e_macro_f1']:.4f} | {m['joint_acc']:.4f} "
            f"| {m['top_2_sub_recall']:.4f} | {m['top_3_sub_recall']:.4f} "
            f"| {m['k1_cascading_recovered_top1']} / {m['k1_cascading_recovered_top3']} |"
        )
    lines.append("")
    return "\n".join(lines)


def format_e10_markdown(report: dict[str, Any]) -> str:
    lines = [
        "# E10: Selective Prediction & Risk–Coverage Analysis",
        "",
        f"- **Val AURC (Main / Joint):** `{report['val_aurc_main']:.4f}` / `{report['val_aurc_joint']:.4f}`",
        f"- **Test AURC (Main / Joint):** `{report['test_aurc_main']:.4f}` / `{report['test_aurc_joint']:.4f}`",
        "",
        "## Test Performance Using Validation-Selected Thresholds",
        "",
        "| Target Val Cov | Threshold (`main`, `joint`) | Val Cov | Test Cov | Needs Review | Test Main Acc | Test Main Macro F1 | Test Sub Macro F1 | Test Joint Acc | Error Capture |",
        "| ---: | :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ]
    for row in report["operating_points"]:
        lines.append(
            f"| {row['target_coverage']:.0%} | `({row['min_main_conf']:.2f}, {row['min_joint_conf']:.2f})` "
            f"| {row['val_coverage']:.2%} | {row['test_coverage']:.2%} | {row['needs_review_samples']} "
            f"| {row['test_accepted_main_acc']:.4f} | {row['test_accepted_main_macro_f1']:.4f} "
            f"| {row['test_accepted_sub_macro_f1']:.4f} | {row['test_accepted_joint_acc']:.4f} "
            f"| {row['joint_error_capture_rate']:.2%} |"
        )

    lines.extend(
        [
            "",
            "## Test Risk–Coverage Curve (Sorted by Joint Confidence)",
            "",
            "| Coverage | Joint Threshold | Main Risk (1-Acc) | Joint Risk (1-Acc) | Main Acc | Joint Acc |",
            "| ---: | ---: | ---: | ---: | ---: | ---: |",
        ]
    )
    for pt in report["test_risk_coverage_curve"][::2]:
        lines.append(
            f"| {pt['coverage']:.0%} | {pt['threshold']:.4f} | {pt['main_risk']:.4f} "
            f"| {pt['joint_risk']:.4f} | {pt['main_acc']:.4f} | {pt['joint_acc']:.4f} |"
        )
    lines.append("")
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="Run research experiments E7-E10.")
    parser.add_argument(
        "--experiments",
        nargs="+",
        choices=("E7", "E8", "E9", "E10"),
        default=["E9", "E10"],
        help="Experiments to run (E7/E8 require CUDA GPU unless --allow-cpu is passed).",
    )
    parser.add_argument("--allow-cpu", action="store_true")
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_EXPERIMENTS_DIR)
    args = parser.parse_args(argv)

    for exp in args.experiments:
        if exp == "E7":
            rep = run_e7_subtopic_recovery(output_dir=args.output_dir, allow_cpu=args.allow_cpu)
            print(format_e7_markdown(rep))
        elif exp == "E8":
            rep = run_e8_loss_ablation(output_dir=args.output_dir, allow_cpu=args.allow_cpu)
            print(format_e8_markdown(rep))
        elif exp == "E9":
            rep = run_e9_topk_validation(output_dir=args.output_dir)
            print(format_e9_markdown(rep))
        elif exp == "E10":
            rep = run_e10_selective_prediction(output_dir=args.output_dir)
            print(format_e10_markdown(rep))


if __name__ == "__main__":
    main()
