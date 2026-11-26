"""Clean, normalize, format model input text, and filter extracted vocabulary senses."""

from __future__ import annotations

import argparse
from collections import Counter
from pathlib import Path
from typing import Any

from src.data.common import (
    DEFAULT_EXTRACTED_PATH,
    DEFAULT_LABEL_MAPPING_PATH,
    DEFAULT_LABELED_PATH,
    DEFAULT_REVIEW_PATH,
    DEFAULT_TAXONOMY_PATH,
    PROCESSED_DIR,
    load_records,
    load_taxonomy,
    normalize_whitespace,
    save_json,
    save_jsonl,
)

DEFAULT_PREPROCESS_STATS_PATH = PROCESSED_DIR / "preprocess_stats.json"


def dedupe_preserve_order(items: list[Any]) -> list[str]:
    """Normalize strings and remove case-insensitive duplicates while preserving order."""
    seen: set[str] = set()
    result: list[str] = []
    for item in items:
        cleaned = normalize_whitespace(str(item))
        if not cleaned:
            continue
        key = cleaned.lower()
        if key not in seen:
            seen.add(key)
            result.append(cleaned)
    return result


def build_model_text(
    record: dict[str, Any],
    *,
    include_examples: bool = True,
    include_collocations: bool = True,
) -> str:
    """Build a deterministic structured text representation for topic classification."""
    lines = [
        f"Word: {record['word']} ({record['pos']})",
        f"Definition: {record['definition']}",
    ]
    if include_collocations and record.get("collocations"):
        lines.append(f"Collocations: {', '.join(record['collocations'])}")
    if include_examples and record.get("examples"):
        lines.append(f"Examples: {' | '.join(record['examples'])}")
    return "\n".join(lines)


def _clean_record(raw_record: dict[str, Any]) -> dict[str, Any] | None:
    """Validate and normalize a single extracted sense record; return None if unusable."""
    sample_id = normalize_whitespace(raw_record.get("sample_id"))
    word_id = normalize_whitespace(raw_record.get("word_id"))
    word = normalize_whitespace(raw_record.get("word"))
    pos = normalize_whitespace(raw_record.get("pos")).lower() or "unknown"
    definition = normalize_whitespace(raw_record.get("definition"))

    if not sample_id or not word_id or not word or not definition:
        return None

    sense_index = int(raw_record.get("sense_index", 0))
    examples = dedupe_preserve_order(raw_record.get("examples") or [])
    collocations = dedupe_preserve_order(raw_record.get("collocations") or [])

    source_topic = normalize_whitespace(raw_record.get("source_topic")) or None
    main_topic = normalize_whitespace(raw_record.get("main_topic")) or None
    subtopic = normalize_whitespace(raw_record.get("subtopic")) or None
    subtopic_id = normalize_whitespace(raw_record.get("subtopic_id")) or None
    label_status = normalize_whitespace(raw_record.get("label_status")) or "needs_review"
    label_source = normalize_whitespace(raw_record.get("label_source")) or "unknown"

    return {
        "sample_id": sample_id,
        "word_id": word_id,
        "word": word,
        "sense_index": sense_index,
        "pos": pos,
        "definition": definition,
        "examples": examples,
        "collocations": collocations,
        "source_topic": source_topic,
        "main_topic": main_topic,
        "subtopic": subtopic,
        "subtopic_id": subtopic_id,
        "label_status": label_status,
        "label_source": label_source,
    }


def preprocess_records(
    records: list[dict[str, Any]],
    taxonomy: dict[str, Any],
    *,
    allowed_statuses: tuple[str, ...] = ("main_topic_reviewed",),
    promote_mapped_needs_review: bool = False,
    include_examples: bool = True,
    include_collocations: bool = True,
    deduplicate_senses: bool = True,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]], dict[str, int]]:
    """Clean records, format model text, and split into labeled vs needs-review pools."""
    name_to_id: dict[str, str] = taxonomy["name_to_id"]
    topic_type_map: dict[str, str] = taxonomy.get("topic_type_map", {})
    label2id: dict[str, int] = taxonomy["label2id"]
    valid_subtopics: dict[str, str] = taxonomy["valid_subtopics"]
    subtopic_id_to_name: dict[str, str] = taxonomy.get("subtopic_id_to_name", {})

    labeled: list[dict[str, Any]] = []
    needs_review: list[dict[str, Any]] = []
    seen_sense_keys: set[tuple[str, str, str]] = set()
    counts = {
        "input_records": len(records),
        "dropped_invalid": 0,
        "dropped_duplicate_sense": 0,
        "invalid_subtopic_cleared": 0,
        "promoted_to_main_topic_reviewed": 0,
    }

    for raw in records:
        cleaned = _clean_record(raw)
        if cleaned is None:
            counts["dropped_invalid"] += 1
            continue

        if deduplicate_senses:
            sense_key = (cleaned["word_id"], cleaned["pos"], cleaned["definition"].lower())
            if sense_key in seen_sense_keys:
                counts["dropped_duplicate_sense"] += 1
                continue
            seen_sense_keys.add(sense_key)

        raw_sub_id = cleaned["subtopic_id"] or (
            cleaned["subtopic"] if cleaned["subtopic"] in valid_subtopics else None
        )
        if raw_sub_id is not None and raw_sub_id in valid_subtopics:
            cleaned["subtopic_id"] = raw_sub_id
            cleaned["subtopic"] = subtopic_id_to_name.get(raw_sub_id, cleaned["subtopic"])
        else:
            if cleaned["subtopic"] is not None or cleaned["subtopic_id"] is not None:
                counts["invalid_subtopic_cleared"] += 1
            cleaned["subtopic"] = None
            cleaned["subtopic_id"] = None

        cleaned["text"] = build_model_text(
            cleaned,
            include_examples=include_examples,
            include_collocations=include_collocations,
        )

        main_topic = cleaned["main_topic"]
        is_valid_topic = main_topic is not None and main_topic in label2id
        if is_valid_topic:
            cleaned["main_topic_id"] = name_to_id[main_topic]
            cleaned["topic_type"] = topic_type_map.get(main_topic, "topical")
            cleaned["label_id"] = label2id[main_topic]
            if promote_mapped_needs_review and cleaned["label_status"] == "needs_review":
                cleaned["label_status"] = "main_topic_reviewed"
                counts["promoted_to_main_topic_reviewed"] += 1
        else:
            cleaned["main_topic"] = None
            cleaned["main_topic_id"] = None
            cleaned["topic_type"] = None
            cleaned["label_id"] = None

        if is_valid_topic and cleaned["label_status"] in allowed_statuses:
            labeled.append(cleaned)
        else:
            needs_review.append(cleaned)

    return labeled, needs_review, counts


def preprocess_dataset(
    input_path: Path | str = DEFAULT_EXTRACTED_PATH,
    labeled_output_path: Path | str = DEFAULT_LABELED_PATH,
    review_output_path: Path | str = DEFAULT_REVIEW_PATH,
    taxonomy_path: Path | str = DEFAULT_TAXONOMY_PATH,
    label_mapping_path: Path | str = DEFAULT_LABEL_MAPPING_PATH,
    stats_path: Path | str | None = DEFAULT_PREPROCESS_STATS_PATH,
    *,
    include_needs_review: bool = False,
    promote_mapped_needs_review: bool = False,
    include_examples: bool = True,
    include_collocations: bool = True,
) -> dict[str, Any]:
    """Run preprocessing on extracted sense records and persist outputs."""
    records = load_records(input_path)
    taxonomy = load_taxonomy(taxonomy_path)

    allowed_statuses = (
        ("main_topic_reviewed", "needs_review")
        if include_needs_review
        else ("main_topic_reviewed",)
    )
    labeled, needs_review, counts = preprocess_records(
        records,
        taxonomy,
        allowed_statuses=allowed_statuses,
        promote_mapped_needs_review=promote_mapped_needs_review,
        include_examples=include_examples,
        include_collocations=include_collocations,
    )

    save_jsonl(labeled, labeled_output_path)
    save_jsonl(needs_review, review_output_path)

    label_mapping = {
        "label2id": taxonomy["label2id"],
        "id2label": {str(k): v for k, v in taxonomy["id2label"].items()},
        "name_to_topic_id": taxonomy["name_to_id"],
        "topic_id_to_name": taxonomy["id_to_name"],
        "topic_type_map": taxonomy["topic_type_map"],
        "subtopic2id": taxonomy["subtopic2id"],
        "id2subtopic": {str(k): v for k, v in taxonomy["id2subtopic"].items()},
        "subtopic_id_to_name": taxonomy["subtopic_id_to_name"],
    }
    save_json(label_mapping, label_mapping_path)

    stats: dict[str, Any] = {
        **counts,
        "labeled_records": len(labeled),
        "needs_review_records": len(needs_review),
        "unique_labeled_words": len({r["word_id"] for r in labeled}),
        "labeled_by_main_topic": dict(Counter(r["main_topic"] for r in labeled)),
        "include_needs_review": include_needs_review,
        "promote_mapped_needs_review": promote_mapped_needs_review,
        "include_examples": include_examples,
        "include_collocations": include_collocations,
    }
    if stats_path is not None:
        save_json(stats, stats_path)
    return stats


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parse CLI arguments for preprocessing."""
    parser = argparse.ArgumentParser(
        description="Clean extracted sense records and build model-ready text datasets."
    )
    parser.add_argument("--input", type=Path, default=DEFAULT_EXTRACTED_PATH)
    parser.add_argument("--labeled-output", type=Path, default=DEFAULT_LABELED_PATH)
    parser.add_argument("--review-output", type=Path, default=DEFAULT_REVIEW_PATH)
    parser.add_argument("--taxonomy", type=Path, default=DEFAULT_TAXONOMY_PATH)
    parser.add_argument("--label-mapping", type=Path, default=DEFAULT_LABEL_MAPPING_PATH)
    parser.add_argument("--stats", type=Path, default=DEFAULT_PREPROCESS_STATS_PATH)
    parser.add_argument(
        "--include-needs-review",
        action="store_true",
        help="Include 'needs_review' senses that have a non-null main_topic in the labeled output.",
    )
    parser.add_argument(
        "--promote-mapped",
        action="store_true",
        help="Promote 'needs_review' senses with main_topic != null to 'main_topic_reviewed'.",
    )
    parser.add_argument("--no-examples", action="store_true", help="Omit examples from model text.")
    parser.add_argument(
        "--no-collocations", action="store_true", help="Omit collocations from model text."
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    """CLI entrypoint for preprocessing."""
    args = parse_args(argv)
    stats = preprocess_dataset(
        input_path=args.input,
        labeled_output_path=args.labeled_output,
        review_output_path=args.review_output,
        taxonomy_path=args.taxonomy,
        label_mapping_path=args.label_mapping,
        stats_path=args.stats,
        include_needs_review=args.include_needs_review,
        promote_mapped_needs_review=args.promote_mapped,
        include_examples=not args.no_examples,
        include_collocations=not args.no_collocations,
    )
    print(
        f"Preprocessed {stats['labeled_records']} labeled senses "
        f"({stats['unique_labeled_words']} words), {stats['needs_review_records']} needs_review."
    )


if __name__ == "__main__":
    main()
