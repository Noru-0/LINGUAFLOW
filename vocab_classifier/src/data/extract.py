"""Extract raw Word Atlas entries into sense-level records conforming to schema.md."""

from __future__ import annotations

import argparse
from collections import Counter
from pathlib import Path
from typing import Any

from src.data.common import (
    DEFAULT_EXTRACTED_PATH,
    DEFAULT_RAW_PATH,
    DEFAULT_TAXONOMY_PATH,
    PROCESSED_DIR,
    load_json,
    load_taxonomy,
    normalize_whitespace,
    save_json,
    save_jsonl,
)

DEFAULT_EXTRACT_STATS_PATH = PROCESSED_DIR / "extract_stats.json"


def extract_collocation(raw_collocation: str) -> str:
    """Strip bilingual translation suffix (after '｜' or '|') from a collocation entry."""
    text = str(raw_collocation)
    for sep in ("｜", "|"):
        if sep in text:
            text = text.split(sep, 1)[0]
            break
    return normalize_whitespace(text)


def extract_english_list(items: list[Any], *, is_example: bool) -> list[str]:
    """Extract cleaned, deduplicated English strings from raw example or collocation lists."""
    seen: set[str] = set()
    cleaned_items: list[str] = []
    for entry in items:
        if is_example:
            raw_text = entry.get("en", "") if isinstance(entry, dict) else str(entry)
            text = normalize_whitespace(raw_text)
        else:
            text = extract_collocation(str(entry))

        if not text:
            continue
        key = text.lower()
        if key not in seen:
            seen.add(key)
            cleaned_items.append(text)
    return cleaned_items


def normalize_pos(raw_pos: str | None, pos_mapping: dict[str, str]) -> str:
    """Map abbreviated POS tags (e.g. 'n.') to canonical full names (e.g. 'noun')."""
    cleaned = normalize_whitespace(raw_pos)
    if not cleaned:
        return "unknown"
    lowered = cleaned.lower()
    return pos_mapping.get(lowered, lowered.rstrip("."))


def extract_word_senses(
    item: dict[str, Any],
    source_topic_map: dict[str, str | None],
    pos_mapping: dict[str, str],
) -> list[dict[str, Any]]:
    """Explode a single raw vocabulary entry into one record per sense."""
    word = normalize_whitespace(item.get("w"))
    word_id = normalize_whitespace(item.get("id")) or word.lower()
    raw_topic = normalize_whitespace(item.get("topic"))
    source_topic: str | None = raw_topic or None
    main_topic = source_topic_map.get(source_topic) if source_topic else None

    examples = extract_english_list(item.get("ex") or [], is_example=True)
    collocations = extract_english_list(item.get("col") or [], is_example=False)
    senses = item.get("senses") or []

    records: list[dict[str, Any]] = []
    for sense_index, sense in enumerate(senses):
        definition = normalize_whitespace(sense.get("en") if isinstance(sense, dict) else "")
        pos_raw = sense.get("pos") if isinstance(sense, dict) else ""
        pos = normalize_pos(pos_raw, pos_mapping)

        # Only primary senses (index 0) with a confident source_topic mapping are marked reviewed;
        # secondary senses may belong to different domains due to polysemy.
        if main_topic is not None and sense_index == 0:
            label_status = "main_topic_reviewed"
        else:
            label_status = "needs_review"

        records.append(
            {
                "sample_id": f"{word_id}_{sense_index + 1:03d}",
                "word_id": word_id,
                "word": word,
                "sense_index": sense_index,
                "pos": pos,
                "definition": definition,
                "examples": list(examples),
                "collocations": list(collocations),
                "source_topic": source_topic,
                "main_topic": main_topic,
                "subtopic": None,
                "label_status": label_status,
                "label_source": "word_atlas_mapping",
            }
        )
    return records


def compute_extract_stats(
    raw_count: int,
    records: list[dict[str, Any]],
) -> dict[str, Any]:
    """Compute summary counts for extracted sense records."""
    return {
        "raw_words": raw_count,
        "extracted_senses": len(records),
        "by_label_status": dict(Counter(r["label_status"] for r in records)),
        "by_main_topic": dict(Counter(r["main_topic"] or "<unmapped>" for r in records)),
        "by_source_topic": dict(Counter(r["source_topic"] or "<missing>" for r in records)),
        "by_pos": dict(Counter(r["pos"] for r in records)),
    }


def extract_dataset(
    input_path: Path | str = DEFAULT_RAW_PATH,
    output_path: Path | str = DEFAULT_EXTRACTED_PATH,
    taxonomy_path: Path | str = DEFAULT_TAXONOMY_PATH,
    stats_path: Path | str | None = DEFAULT_EXTRACT_STATS_PATH,
    output_format: str = "jsonl",
) -> dict[str, Any]:
    """Extract all senses from raw Word Atlas JSON and write normalized records + stats."""
    raw_items = load_json(input_path)
    if not isinstance(raw_items, list):
        raise ValueError(f"Expected JSON list in {input_path}, got {type(raw_items).__name__}")

    taxonomy = load_taxonomy(taxonomy_path)
    source_topic_map = taxonomy["source_topic_to_main_topic"]
    pos_mapping = taxonomy["pos_mapping"]

    records: list[dict[str, Any]] = []
    seen_sample_ids: set[str] = set()
    for item in raw_items:
        for record in extract_word_senses(item, source_topic_map, pos_mapping):
            sid = record["sample_id"]
            if sid in seen_sample_ids:
                raise ValueError(f"Duplicate sample_id generated: {sid}")
            seen_sample_ids.add(sid)
            records.append(record)

    fmt = output_format.lower()
    if fmt == "jsonl":
        save_jsonl(records, output_path)
    elif fmt == "json":
        save_json(records, output_path)
    else:
        raise ValueError(f"Unsupported output_format '{output_format}'; expected 'jsonl' or 'json'.")

    stats = compute_extract_stats(len(raw_items), records)
    stats["input_path"] = str(input_path)
    stats["output_path"] = str(output_path)
    if stats_path is not None:
        save_json(stats, stats_path)
    return stats


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parse CLI arguments for raw dataset extraction."""
    parser = argparse.ArgumentParser(
        description="Extract sense-level vocabulary records from raw word-atlas.json."
    )
    parser.add_argument("--input", type=Path, default=DEFAULT_RAW_PATH, help="Path to raw JSON.")
    parser.add_argument(
        "--output", type=Path, default=DEFAULT_EXTRACTED_PATH, help="Output file path."
    )
    parser.add_argument(
        "--taxonomy", type=Path, default=DEFAULT_TAXONOMY_PATH, help="Path to taxonomy.json."
    )
    parser.add_argument(
        "--stats", type=Path, default=DEFAULT_EXTRACT_STATS_PATH, help="Path to write stats JSON."
    )
    parser.add_argument(
        "--format",
        choices=("jsonl", "json"),
        default="jsonl",
        help="Output serialization format.",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    """CLI entrypoint for dataset extraction."""
    args = parse_args(argv)
    stats = extract_dataset(
        input_path=args.input,
        output_path=args.output,
        taxonomy_path=args.taxonomy,
        stats_path=args.stats,
        output_format=args.format,
    )
    print(
        f"Extracted {stats['extracted_senses']} senses from {stats['raw_words']} words -> {args.output}"
    )


if __name__ == "__main__":
    main()
