"""Shared I/O, path, taxonomy, and text normalization helpers for src.data."""

from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path
from typing import Any

PACKAGE_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = PACKAGE_ROOT / "data"
RAW_DIR = DATA_DIR / "raw"
TAXONOMY_DIR = DATA_DIR / "taxonomy"
PROCESSED_DIR = DATA_DIR / "processed"

DEFAULT_RAW_PATH = RAW_DIR / "word-atlas.json"
DEFAULT_TAXONOMY_PATH = TAXONOMY_DIR / "taxonomy.json"
DEFAULT_EXTRACTED_PATH = PROCESSED_DIR / "extracted_senses.jsonl"
DEFAULT_LABELED_PATH = PROCESSED_DIR / "processed_labeled.jsonl"
DEFAULT_REVIEW_PATH = PROCESSED_DIR / "needs_review.jsonl"
DEFAULT_LABEL_MAPPING_PATH = PROCESSED_DIR / "label_mapping.json"

_CONTROL_CHARS_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
_WHITESPACE_RE = re.compile(r"\s+")


def normalize_whitespace(text: str | None) -> str:
    """Normalize Unicode compatibility forms, strip control chars, and collapse whitespace."""
    if not text:
        return ""
    cleaned = unicodedata.normalize("NFKC", str(text))
    cleaned = _CONTROL_CHARS_RE.sub(" ", cleaned)
    return _WHITESPACE_RE.sub(" ", cleaned).strip()


def load_json(path: Path | str) -> Any:
    """Read a UTF-8 JSON file."""
    with Path(path).open("r", encoding="utf-8") as f:
        return json.load(f)


def save_json(data: Any, path: Path | str, indent: int = 2) -> Path:
    """Write data as formatted UTF-8 JSON, creating parent directories if needed."""
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    with target.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=indent)
        f.write("\n")
    return target


def load_jsonl(path: Path | str) -> list[dict[str, Any]]:
    """Read a UTF-8 JSON Lines file into a list of dictionaries."""
    records: list[dict[str, Any]] = []
    with Path(path).open("r", encoding="utf-8") as f:
        for line in f:
            stripped = line.strip()
            if stripped:
                records.append(json.loads(stripped))
    return records


def save_jsonl(records: list[dict[str, Any]], path: Path | str) -> Path:
    """Write records as UTF-8 JSON Lines, creating parent directories if needed."""
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    with target.open("w", encoding="utf-8") as f:
        for record in records:
            f.write(json.dumps(record, ensure_ascii=False))
            f.write("\n")
    return target


def load_records(path: Path | str) -> list[dict[str, Any]]:
    """Load records from either a `.jsonl` or `.json` file."""
    target = Path(path)
    if target.suffix.lower() == ".jsonl":
        return load_jsonl(target)
    data = load_json(target)
    if not isinstance(data, list):
        raise ValueError(f"Expected list of records in {target}, got {type(data).__name__}")
    return data


def load_taxonomy(path: Path | str = DEFAULT_TAXONOMY_PATH) -> dict[str, Any]:
    """Load taxonomy config and construct lookup tables for main topics, subtopics, and mappings."""
    raw = load_json(path)
    main_topics = raw.get("taxonomy", [])

    name_to_id: dict[str, str] = {}
    id_to_name: dict[str, str] = {}
    label2id: dict[str, int] = {}
    id2label: dict[int, str] = {}
    valid_subtopics: dict[str, str] = {}

    for idx, topic in enumerate(main_topics):
        topic_id = topic["id"]
        name_en = topic["name_en"]
        name_to_id[name_en] = topic_id
        id_to_name[topic_id] = name_en
        label2id[name_en] = idx
        id2label[idx] = name_en
        for sub in topic.get("subtopics", []):
            valid_subtopics[sub["id"]] = name_en

    return {
        "raw": raw,
        "main_topics": main_topics,
        "name_to_id": name_to_id,
        "id_to_name": id_to_name,
        "label2id": label2id,
        "id2label": id2label,
        "valid_subtopics": valid_subtopics,
        "source_topic_to_main_topic": raw.get("source_topic_to_main_topic", {}),
        "pos_mapping": raw.get("pos_mapping", {}),
    }
