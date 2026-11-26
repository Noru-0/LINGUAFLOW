"""End-to-end data processing pipeline: extract -> preprocess -> (optional subtopic labeling) -> split."""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Any

from src.data.common import (
    DEFAULT_EXTRACTED_PATH,
    DEFAULT_FINAL_LABELED_PATH,
    DEFAULT_LABEL_MAPPING_PATH,
    DEFAULT_LABELED_PATH,
    DEFAULT_RAW_PATH,
    DEFAULT_REVIEW_PATH,
    DEFAULT_SUBTOPIC_CANDIDATES_PATH,
    DEFAULT_TAXONOMY_PATH,
    PROCESSED_DIR,
)
from src.data.extract import DEFAULT_EXTRACT_STATS_PATH, extract_dataset
from src.data.preprocess import DEFAULT_PREPROCESS_STATS_PATH, preprocess_dataset
from src.data.split import split_dataset
from src.data.subtopic_labeling import DEFAULT_SUBTOPIC_STATS_PATH, generate_subtopic_candidates


def run_pipeline(
    raw_path: Path | str = DEFAULT_RAW_PATH,
    taxonomy_path: Path | str = DEFAULT_TAXONOMY_PATH,
    processed_dir: Path | str = PROCESSED_DIR,
    *,
    include_needs_review: bool = False,
    promote_mapped_needs_review: bool = False,
    auto_subtopic: bool = False,
    detect_general: bool = True,
    rescue_unmapped_general: bool = True,
    general_margin: float = 0.14,
    broad_general_margin: float = 0.05,
    subtopic_backend: str = "auto",
    train_ratio: float = 0.8,
    val_ratio: float = 0.1,
    test_ratio: float = 0.1,
    seed: int = 42,
) -> dict[str, Any]:
    """Run extraction, preprocessing, optional General+subtopic labeling, and splitting."""
    out_dir = Path(processed_dir)
    extracted_path = out_dir / DEFAULT_EXTRACTED_PATH.name
    labeled_path = out_dir / DEFAULT_LABELED_PATH.name
    review_path = out_dir / DEFAULT_REVIEW_PATH.name
    label_mapping_path = out_dir / DEFAULT_LABEL_MAPPING_PATH.name
    candidates_path = out_dir / DEFAULT_SUBTOPIC_CANDIDATES_PATH.name
    final_labeled_path = out_dir / DEFAULT_FINAL_LABELED_PATH.name

    extract_stats = extract_dataset(
        input_path=raw_path,
        output_path=extracted_path,
        taxonomy_path=taxonomy_path,
        stats_path=out_dir / DEFAULT_EXTRACT_STATS_PATH.name,
    )
    preprocess_stats = preprocess_dataset(
        input_path=extracted_path,
        labeled_output_path=labeled_path,
        review_output_path=review_path,
        taxonomy_path=taxonomy_path,
        label_mapping_path=label_mapping_path,
        stats_path=out_dir / DEFAULT_PREPROCESS_STATS_PATH.name,
        include_needs_review=include_needs_review,
        promote_mapped_needs_review=promote_mapped_needs_review,
    )

    result: dict[str, Any] = {
        "extract": extract_stats,
        "preprocess": preprocess_stats,
    }
    split_input = labeled_path

    if auto_subtopic:
        subtopic_stats = generate_subtopic_candidates(
            input_path=labeled_path,
            output_path=candidates_path,
            taxonomy_path=taxonomy_path,
            stats_path=out_dir / DEFAULT_SUBTOPIC_STATS_PATH.name,
            review_input_path=review_path if (detect_general and rescue_unmapped_general) else None,
            review_output_path=review_path if (detect_general and rescue_unmapped_general) else None,
            final_output_path=final_labeled_path,
            auto_select=True,
            detect_general=detect_general,
            general_margin=general_margin,
            broad_general_margin=broad_general_margin,
            backend=subtopic_backend,
        )
        result["subtopic"] = subtopic_stats
        split_input = final_labeled_path

    split_stats = split_dataset(
        input_path=split_input,
        output_dir=out_dir,
        train_ratio=train_ratio,
        val_ratio=val_ratio,
        test_ratio=test_ratio,
        seed=seed,
    )
    result["split"] = split_stats
    return result


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parse CLI arguments for the full data pipeline."""
    parser = argparse.ArgumentParser(description="Run full vocab_classifier data pipeline.")
    parser.add_argument("--raw", type=Path, default=DEFAULT_RAW_PATH)
    parser.add_argument("--taxonomy", type=Path, default=DEFAULT_TAXONOMY_PATH)
    parser.add_argument("--processed-dir", type=Path, default=PROCESSED_DIR)
    parser.add_argument("--include-needs-review", action="store_true")
    parser.add_argument("--promote-mapped", action="store_true")
    parser.add_argument("--auto-subtopic", action="store_true")
    parser.add_argument("--no-detect-general", action="store_true")
    parser.add_argument("--no-rescue-unmapped", action="store_true")
    parser.add_argument("--general-margin", type=float, default=0.14)
    parser.add_argument("--broad-general-margin", type=float, default=0.05)
    parser.add_argument(
        "--subtopic-backend",
        choices=("auto", "embedding", "nli", "lexical"),
        default="auto",
    )
    parser.add_argument("--train-ratio", type=float, default=0.8)
    parser.add_argument("--val-ratio", type=float, default=0.1)
    parser.add_argument("--test-ratio", type=float, default=0.1)
    parser.add_argument("--seed", type=int, default=42)
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    """CLI entrypoint for the full data pipeline."""
    args = parse_args(argv)
    summary = run_pipeline(
        raw_path=args.raw,
        taxonomy_path=args.taxonomy,
        processed_dir=args.processed_dir,
        include_needs_review=args.include_needs_review,
        promote_mapped_needs_review=args.promote_mapped,
        auto_subtopic=args.auto_subtopic,
        detect_general=not args.no_detect_general,
        rescue_unmapped_general=not args.no_rescue_unmapped,
        general_margin=args.general_margin,
        broad_general_margin=args.broad_general_margin,
        subtopic_backend=args.subtopic_backend,
        train_ratio=args.train_ratio,
        val_ratio=args.val_ratio,
        test_ratio=args.test_ratio,
        seed=args.seed,
    )
    print(
        f"Pipeline complete: extracted={summary['extract']['extracted_senses']}, "
        f"final_labeled={summary['split']['total_samples']}, "
        f"train={summary['split']['train']['samples']}, "
        f"val={summary['split']['val']['samples']}, "
        f"test={summary['split']['test']['samples']}"
    )


if __name__ == "__main__":
    main()
