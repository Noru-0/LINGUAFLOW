"""Group-stratified train/val/test splitting by word_id to prevent sense-level data leakage."""

from __future__ import annotations

import argparse
import random
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

from src.data.common import (
    DEFAULT_LABELED_PATH,
    PROCESSED_DIR,
    load_records,
    save_json,
    save_jsonl,
)

DEFAULT_SPLIT_STATS_PATH = PROCESSED_DIR / "split_stats.json"


def _allocate_counts(total: int, ratios: tuple[float, float, float]) -> tuple[int, int, int]:
    """Allocate integer split counts for a stratum while preserving exact sum."""
    if total == 0:
        return (0, 0, 0)
    if total == 1:
        return (1, 0, 0)
    if total == 2:
        return (1, 0, 1) if ratios[2] > 0 else (2, 0, 0)

    raw = [total * r for r in ratios]
    counts = [int(x) for x in raw]
    remainder = total - sum(counts)

    # Distribute remaining items to splits with largest fractional remainders.
    remainders = sorted(
        range(3),
        key=lambda i: (raw[i] - counts[i], ratios[i]),
        reverse=True,
    )
    for idx in remainders[:remainder]:
        counts[idx] += 1

    # Guarantee at least 1 train sample when total >= 3.
    if counts[0] == 0:
        donor = 1 if counts[1] >= counts[2] else 2
        counts[0] += 1
        counts[donor] -= 1
    return (counts[0], counts[1], counts[2])


def _validate_ratios(train_ratio: float, val_ratio: float, test_ratio: float) -> None:
    """Validate split ratios are non-negative and sum to 1.0."""
    for name, val in (("train", train_ratio), ("val", val_ratio), ("test", test_ratio)):
        if val < 0.0:
            raise ValueError(f"{name}_ratio must be non-negative, got {val}")
    total = train_ratio + val_ratio + test_ratio
    if abs(total - 1.0) > 1e-6:
        raise ValueError(f"Split ratios must sum to 1.0, got {total:.6f}")


def group_stratified_split(
    records: list[dict[str, Any]],
    *,
    train_ratio: float = 0.8,
    val_ratio: float = 0.1,
    test_ratio: float = 0.1,
    seed: int = 42,
    group_key: str = "word_id",
    label_key: str = "main_topic",
) -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    """Split records into train/val/test grouped by word_id and stratified by label."""
    _validate_ratios(train_ratio, val_ratio, test_ratio)
    if not records:
        return ([], [], [])

    groups: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for record in records:
        gid = str(record[group_key])
        groups[gid].append(record)

    # Determine each group's primary label for stratification.
    strata: dict[str, list[str]] = defaultdict(list)
    for gid in sorted(groups.keys()):
        group_labels = [str(r[label_key]) for r in groups[gid]]
        primary_label = Counter(group_labels).most_common(1)[0][0]
        strata[primary_label].append(gid)

    rng = random.Random(seed)
    split_groups: tuple[list[str], list[str], list[str]] = ([], [], [])
    ratios = (train_ratio, val_ratio, test_ratio)

    for label in sorted(strata.keys()):
        group_ids = strata[label]
        rng.shuffle(group_ids)
        n_train, n_val, _ = _allocate_counts(len(group_ids), ratios)
        split_groups[0].extend(group_ids[:n_train])
        split_groups[1].extend(group_ids[n_train : n_train + n_val])
        split_groups[2].extend(group_ids[n_train + n_val :])

    splits: list[list[dict[str, Any]]] = [[], [], []]
    for split_idx, gids in enumerate(split_groups):
        for gid in sorted(gids):
            splits[split_idx].extend(
                sorted(groups[gid], key=lambda r: (r.get("sense_index", 0), r["sample_id"]))
            )

    train_records, val_records, test_records = splits
    _verify_no_leakage(train_records, val_records, test_records, group_key=group_key)
    return (train_records, val_records, test_records)


def _verify_no_leakage(
    train: list[dict[str, Any]],
    val: list[dict[str, Any]],
    test: list[dict[str, Any]],
    *,
    group_key: str,
) -> None:
    """Ensure zero group_key or sample_id overlap across splits."""
    split_groups = [
        {r[group_key] for r in train},
        {r[group_key] for r in val},
        {r[group_key] for r in test},
    ]
    pairs = (("train", "val", 0, 1), ("train", "test", 0, 2), ("val", "test", 1, 2))
    for name_a, name_b, idx_a, idx_b in pairs:
        overlap = split_groups[idx_a] & split_groups[idx_b]
        if overlap:
            raise AssertionError(
                f"Group leakage detected between {name_a} and {name_b}: {sorted(overlap)[:5]}"
            )


def _split_summary(records: list[dict[str, Any]]) -> dict[str, Any]:
    summary: dict[str, Any] = {
        "samples": len(records),
        "unique_words": len({r["word_id"] for r in records}),
        "by_main_topic": dict(sorted(Counter(r["main_topic"] for r in records).items())),
    }
    subtopics = [r.get("subtopic") for r in records if r.get("subtopic") is not None]
    if subtopics:
        summary["by_subtopic"] = dict(sorted(Counter(subtopics).items()))
    return summary


def split_dataset(
    input_path: Path | str = DEFAULT_LABELED_PATH,
    output_dir: Path | str = PROCESSED_DIR,
    *,
    train_ratio: float = 0.8,
    val_ratio: float = 0.1,
    test_ratio: float = 0.1,
    seed: int = 42,
) -> dict[str, Any]:
    """Load preprocessed labeled records, split deterministically, and save train/val/test."""
    records = load_records(input_path)
    train, val, test = group_stratified_split(
        records,
        train_ratio=train_ratio,
        val_ratio=val_ratio,
        test_ratio=test_ratio,
        seed=seed,
    )

    out_dir = Path(output_dir)
    save_jsonl(train, out_dir / "train.jsonl")
    save_jsonl(val, out_dir / "val.jsonl")
    save_jsonl(test, out_dir / "test.jsonl")

    stats = {
        "seed": seed,
        "ratios": {"train": train_ratio, "val": val_ratio, "test": test_ratio},
        "total_samples": len(records),
        "total_unique_words": len({r["word_id"] for r in records}),
        "train": _split_summary(train),
        "val": _split_summary(val),
        "test": _split_summary(test),
    }
    save_json(stats, out_dir / "split_stats.json")
    return stats


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parse CLI arguments for dataset splitting."""
    parser = argparse.ArgumentParser(
        description="Group-stratified train/val/test split by word_id."
    )
    parser.add_argument("--input", type=Path, default=DEFAULT_LABELED_PATH)
    parser.add_argument("--output-dir", type=Path, default=PROCESSED_DIR)
    parser.add_argument("--train-ratio", type=float, default=0.8)
    parser.add_argument("--val-ratio", type=float, default=0.1)
    parser.add_argument("--test-ratio", type=float, default=0.1)
    parser.add_argument("--seed", type=int, default=42)
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    """CLI entrypoint for dataset splitting."""
    args = parse_args(argv)
    stats = split_dataset(
        input_path=args.input,
        output_dir=args.output_dir,
        train_ratio=args.train_ratio,
        val_ratio=args.val_ratio,
        test_ratio=args.test_ratio,
        seed=args.seed,
    )
    print(
        f"Split {stats['total_samples']} samples -> "
        f"train={stats['train']['samples']}, "
        f"val={stats['val']['samples']}, "
        f"test={stats['test']['samples']}"
    )


if __name__ == "__main__":
    main()
