"""Train and benchmark the three baseline models on train/val/test splits."""

from __future__ import annotations

import argparse
import pickle
import time
from pathlib import Path
from typing import Any, Callable

from src.data.common import PACKAGE_ROOT, load_json, load_records, load_taxonomy, save_json
from src.data.preprocess import build_model_text
from src.evaluation.metrics import evaluate_hierarchical_predictions, format_benchmark_markdown
from src.models.baselines import (
    HierarchicalLinearBaseline,
    build_tfidf_vectorizer,
    encode_frozen_minilm,
    make_logreg_factory,
    make_svm_factory,
)

DEFAULT_BASELINE_CONFIG_PATH = PACKAGE_ROOT / "configs" / "baseline_config.json"


def _resolve_path(path_value: str | Path) -> Path:
    path = Path(path_value)
    return path if path.is_absolute() else PACKAGE_ROOT / path


def extract_texts_and_labels(
    records: list[dict[str, Any]],
    taxonomy: dict[str, Any],
) -> tuple[list[str], list[int], list[int]]:
    """Extract formatted model texts and integer (main_label_id, subtopic_label_id) targets."""
    label2id: dict[str, int] = taxonomy["label2id"]
    subtopic2id: dict[str, int] = taxonomy["subtopic2id"]
    subtopic_name_to_id: dict[str, str] = taxonomy["subtopic_name_to_id"]

    texts: list[str] = []
    y_main: list[int] = []
    y_sub: list[int] = []

    for rec in records:
        text = rec.get("text") or build_model_text(rec)
        main_id = rec.get("label_id")
        if main_id is None:
            main_id = label2id[rec["main_topic"]]

        sub_id = rec.get("subtopic_label_id")
        if sub_id is None:
            raw_sub = rec.get("subtopic_id") or rec.get("subtopic")
            canonical_sub = subtopic_name_to_id.get(raw_sub, raw_sub)
            sub_id = subtopic2id[canonical_sub]

        texts.append(str(text))
        y_main.append(int(main_id))
        y_sub.append(int(sub_id))

    return texts, y_main, y_sub


def _save_pickle(obj: Any, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("wb") as f:
        pickle.dump(obj, f)


def _fit_and_eval_model(
    *,
    display_name: str,
    estimator_factory: Callable[[], Any],
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
) -> tuple[HierarchicalLinearBaseline, dict[str, Any]]:
    """Fit a HierarchicalLinearBaseline and compute val + test metrics."""
    clf = HierarchicalLinearBaseline(estimator_factory)
    t0 = time.perf_counter()
    clf.fit(X_train, y_train_main, y_train_sub)
    fit_seconds = round(time.perf_counter() - t0, 3)

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

    return clf, {
        "display_name": display_name,
        "fit_seconds": fit_seconds,
        "val": val_metrics,
        "test": test_metrics,
    }


def run_baseline_benchmark(
    config_path: Path | str = DEFAULT_BASELINE_CONFIG_PATH,
    *,
    selected_models: tuple[str, ...] | None = None,
    output_dir_override: Path | str | None = None,
    minilm_encoder_fn: Callable[..., Any] = encode_frozen_minilm,
) -> dict[str, Any]:
    """Run TF-IDF+LogReg, TF-IDF+LinearSVM, and Frozen MiniLM+LogReg benchmarks."""
    cfg = load_json(config_path)
    seed = int(cfg.get("seed", 42))
    taxonomy = load_taxonomy(_resolve_path(cfg["taxonomy_path"]))

    train_records = load_records(_resolve_path(cfg["train_path"]))
    val_records = load_records(_resolve_path(cfg["val_path"]))
    test_records = load_records(_resolve_path(cfg["test_path"]))

    train_texts, y_train_main, y_train_sub = extract_texts_and_labels(train_records, taxonomy)
    val_texts, y_val_main, y_val_sub = extract_texts_and_labels(val_records, taxonomy)
    test_texts, y_test_main, y_test_sub = extract_texts_and_labels(test_records, taxonomy)

    out_dir = Path(output_dir_override) if output_dir_override else _resolve_path(cfg["output_dir"])
    out_dir.mkdir(parents=True, exist_ok=True)

    active = set(
        selected_models
        or ("tfidf_logreg", "tfidf_svm", "frozen_minilm_logreg")
    )

    results: dict[str, Any] = {
        "seed": seed,
        "splits": {
            "train": len(train_records),
            "val": len(val_records),
            "test": len(test_records),
        },
        "models": {},
    }

    if active & {"tfidf_logreg", "tfidf_svm"}:
        vectorizer = build_tfidf_vectorizer(cfg.get("tfidf", {}))
        X_train_tfidf = vectorizer.fit_transform(train_texts)
        X_val_tfidf = vectorizer.transform(val_texts)
        X_test_tfidf = vectorizer.transform(test_texts)
        _save_pickle(vectorizer, out_dir / "tfidf_vectorizer.pkl")

        if "tfidf_logreg" in active:
            clf, entry = _fit_and_eval_model(
                display_name="TF-IDF + Logistic Regression",
                estimator_factory=make_logreg_factory(
                    cfg["classifiers"]["tfidf_logreg"], seed=seed
                ),
                X_train=X_train_tfidf,
                X_val=X_val_tfidf,
                X_test=X_test_tfidf,
                y_train_main=y_train_main,
                y_train_sub=y_train_sub,
                y_val_main=y_val_main,
                y_val_sub=y_val_sub,
                y_test_main=y_test_main,
                y_test_sub=y_test_sub,
                taxonomy=taxonomy,
            )
            results["models"]["tfidf_logreg"] = entry
            _save_pickle(clf, out_dir / "tfidf_logreg.pkl")

        if "tfidf_svm" in active:
            clf, entry = _fit_and_eval_model(
                display_name="TF-IDF + Linear SVM",
                estimator_factory=make_svm_factory(
                    cfg["classifiers"]["tfidf_svm"], seed=seed
                ),
                X_train=X_train_tfidf,
                X_val=X_val_tfidf,
                X_test=X_test_tfidf,
                y_train_main=y_train_main,
                y_train_sub=y_train_sub,
                y_val_main=y_val_main,
                y_val_sub=y_val_sub,
                y_test_main=y_test_main,
                y_test_sub=y_test_sub,
                taxonomy=taxonomy,
            )
            results["models"]["tfidf_svm"] = entry
            _save_pickle(clf, out_dir / "tfidf_svm.pkl")

    if "frozen_minilm_logreg" in active:
        minilm_cfg = cfg.get("minilm", {})
        t_emb = time.perf_counter()
        X_train_emb = minilm_encoder_fn(train_texts, **minilm_cfg)
        X_val_emb = minilm_encoder_fn(val_texts, **minilm_cfg)
        X_test_emb = minilm_encoder_fn(test_texts, **minilm_cfg)
        emb_seconds = round(time.perf_counter() - t_emb, 3)

        clf, entry = _fit_and_eval_model(
            display_name="Frozen MiniLM + Logistic Regression",
            estimator_factory=make_logreg_factory(
                cfg["classifiers"]["frozen_minilm_logreg"], seed=seed
            ),
            X_train=X_train_emb,
            X_val=X_val_emb,
            X_test=X_test_emb,
            y_train_main=y_train_main,
            y_train_sub=y_train_sub,
            y_val_main=y_val_main,
            y_val_sub=y_val_sub,
            y_test_main=y_test_main,
            y_test_sub=y_test_sub,
            taxonomy=taxonomy,
        )
        entry["embedding_seconds"] = emb_seconds
        results["models"]["frozen_minilm_logreg"] = entry
        _save_pickle(clf, out_dir / "frozen_minilm_logreg.pkl")

    save_json(results, out_dir / "baseline_results.json")
    report_md = format_benchmark_markdown(results)
    (out_dir / "baseline_report.md").write_text(report_md, encoding="utf-8")
    return results


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parse CLI arguments for baseline benchmarking."""
    parser = argparse.ArgumentParser(description="Train and evaluate baseline models.")
    parser.add_argument("--config", type=Path, default=DEFAULT_BASELINE_CONFIG_PATH)
    parser.add_argument(
        "--models",
        nargs="+",
        choices=("tfidf_logreg", "tfidf_svm", "frozen_minilm_logreg"),
        default=None,
        help="Optional subset of baselines to run.",
    )
    parser.add_argument("--output-dir", type=Path, default=None)
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    """CLI entrypoint for baseline benchmarking."""
    args = parse_args(argv)
    results = run_baseline_benchmark(
        config_path=args.config,
        selected_models=tuple(args.models) if args.models else None,
        output_dir_override=args.output_dir,
    )
    print(format_benchmark_markdown(results))


if __name__ == "__main__":
    main()
