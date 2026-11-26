"""Unit tests for the vocab_classifier data processing pipeline."""

from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path

PACKAGE_ROOT = Path(__file__).resolve().parents[1]
if str(PACKAGE_ROOT) not in sys.path:
    sys.path.insert(0, str(PACKAGE_ROOT))

from src.data.common import DEFAULT_RAW_PATH, DEFAULT_TAXONOMY_PATH, load_json, load_jsonl, load_taxonomy
from src.data.extract import extract_collocation, extract_word_senses, normalize_pos
from src.data.pipeline import run_pipeline
from src.data.preprocess import build_model_text, preprocess_records
from src.data.split import group_stratified_split


class TestExtract(unittest.TestCase):
    def setUp(self) -> None:
        self.taxonomy = load_taxonomy(DEFAULT_TAXONOMY_PATH)

    def test_library_matches_reference_process_json(self) -> None:
        raw_items = load_json(DEFAULT_RAW_PATH)
        library_raw = next(item for item in raw_items if item["id"] == "library")
        expected = load_json(PACKAGE_ROOT / "data" / "raw" / "word-atlas_process.json")

        actual = extract_word_senses(
            library_raw,
            self.taxonomy["source_topic_to_main_topic"],
            self.taxonomy["pos_mapping"],
        )
        self.assertEqual(actual, expected)

    def test_extract_collocation_and_pos(self) -> None:
        self.assertEqual(extract_collocation("public library｜公共图书馆"), "public library")
        self.assertEqual(extract_collocation("digital library | 数字图书馆"), "digital library")
        self.assertEqual(extract_collocation("  plain   collocation  "), "plain collocation")
        self.assertEqual(normalize_pos("n.", self.taxonomy["pos_mapping"]), "noun")
        self.assertEqual(normalize_pos("adj.", self.taxonomy["pos_mapping"]), "adjective")
        self.assertEqual(normalize_pos("", self.taxonomy["pos_mapping"]), "unknown")

    def test_unmapped_source_topic_marks_needs_review(self) -> None:
        item = {
            "id": "insight",
            "w": "insight",
            "topic": "thinking",
            "senses": [{"pos": "n.", "en": "A deep understanding."}],
            "ex": [{"en": "The book offers deep insight."}],
            "col": ["deep insight｜深刻见解"],
        }
        senses = extract_word_senses(
            item,
            self.taxonomy["source_topic_to_main_topic"],
            self.taxonomy["pos_mapping"],
        )
        self.assertEqual(len(senses), 1)
        self.assertIsNone(senses[0]["main_topic"])
        self.assertEqual(senses[0]["label_status"], "needs_review")


class TestPreprocess(unittest.TestCase):
    def setUp(self) -> None:
        self.taxonomy = load_taxonomy(DEFAULT_TAXONOMY_PATH)

    def test_preprocess_filters_normalizes_and_deduplicates(self) -> None:
        records = [
            {
                "sample_id": "solar_001",
                "word_id": "solar",
                "word": "solar  ",
                "sense_index": 0,
                "pos": "adjective",
                "definition": "Relating to   the sun.",
                "examples": ["Solar energy is clean.", "solar energy is clean."],
                "collocations": ["solar panel", "Solar Panel"],
                "source_topic": "environment",
                "main_topic": "Environment & Nature",
                "subtopic": "invalid.subtopic",
                "label_status": "main_topic_reviewed",
                "label_source": "word_atlas_mapping",
            },
            {
                "sample_id": "solar_002",
                "word_id": "solar",
                "word": "solar",
                "sense_index": 1,
                "pos": "adjective",
                "definition": "Relating to the sun.",  # duplicate sense
                "examples": [],
                "collocations": [],
                "source_topic": "environment",
                "main_topic": "Environment & Nature",
                "subtopic": None,
                "label_status": "needs_review",
                "label_source": "word_atlas_mapping",
            },
            {
                "sample_id": "solar_003",
                "word_id": "solar",
                "word": "solar",
                "sense_index": 2,
                "pos": "noun",
                "definition": "A solar power installation.",
                "examples": [],
                "collocations": [],
                "source_topic": "environment",
                "main_topic": "Environment & Nature",
                "subtopic": None,
                "label_status": "needs_review",
                "label_source": "word_atlas_mapping",
            },
            {
                "sample_id": "broken_001",
                "word_id": "broken",
                "word": "broken",
                "sense_index": 0,
                "pos": "adjective",
                "definition": "   ",  # invalid empty definition
            },
        ]
        labeled, review, counts = preprocess_records(records, self.taxonomy)
        self.assertEqual(counts["dropped_invalid"], 1)
        self.assertEqual(counts["dropped_duplicate_sense"], 1)
        self.assertEqual(counts["invalid_subtopic_cleared"], 1)
        self.assertEqual(len(labeled), 1)
        self.assertEqual(len(review), 1)
        self.assertEqual(labeled[0]["word"], "solar")
        self.assertEqual(labeled[0]["examples"], ["Solar energy is clean."])
        self.assertEqual(labeled[0]["collocations"], ["solar panel"])
        self.assertIsNone(labeled[0]["subtopic"])
        self.assertEqual(labeled[0]["main_topic_id"], "env")
        self.assertEqual(labeled[0]["label_id"], 0)
        self.assertIn("Definition: Relating to the sun.", labeled[0]["text"])

    def test_build_model_text_flags(self) -> None:
        record = {
            "word": "orbit",
            "pos": "noun",
            "definition": "A curved path around a planet.",
            "collocations": ["in orbit"],
            "examples": ["The satellite entered orbit."],
        }
        text_only_def = build_model_text(record, include_examples=False, include_collocations=False)
        self.assertNotIn("Collocations:", text_only_def)
        self.assertNotIn("Examples:", text_only_def)


class TestSplitAndPipeline(unittest.TestCase):
    def test_group_stratified_split_prevents_word_leakage(self) -> None:
        records = []
        for idx in range(30):
            topic = "Environment & Nature" if idx < 15 else "Education & Academia"
            wid = f"word_{idx:02d}"
            for sense_idx in range(2):
                records.append(
                    {
                        "sample_id": f"{wid}_{sense_idx + 1:03d}",
                        "word_id": wid,
                        "sense_index": sense_idx,
                        "main_topic": topic,
                    }
                )

        train, val, test = group_stratified_split(records, seed=123)
        self.assertEqual(len(train) + len(val) + len(test), len(records))
        train_words = {r["word_id"] for r in train}
        val_words = {r["word_id"] for r in val}
        test_words = {r["word_id"] for r in test}
        self.assertFalse(train_words & val_words)
        self.assertFalse(train_words & test_words)
        self.assertFalse(val_words & test_words)
        # Determinism check
        train2, val2, test2 = group_stratified_split(records, seed=123)
        self.assertEqual([r["sample_id"] for r in train], [r["sample_id"] for r in train2])
        self.assertEqual([r["sample_id"] for r in val], [r["sample_id"] for r in val2])
        self.assertEqual([r["sample_id"] for r in test], [r["sample_id"] for r in test2])

    def test_end_to_end_pipeline_on_temp_subset(self) -> None:
        sample_raw = [
            {
                "id": f"edu_{i}",
                "w": f"eduword{i}",
                "topic": "education",
                "senses": [
                    {"pos": "n.", "en": f"Education sense 1 for {i}."},
                    {"pos": "v.", "en": f"Education sense 2 for {i}."},
                ],
                "ex": [{"en": f"Example sentence for eduword{i}."}],
                "col": [f"study eduword{i}｜学习"],
            }
            for i in range(10)
        ] + [
            {
                "id": f"env_{i}",
                "w": f"envword{i}",
                "topic": "environment",
                "senses": [{"pos": "n.", "en": f"Environment sense for {i}."}],
                "ex": [{"en": f"Example sentence for envword{i}."}],
                "col": [f"protect envword{i}｜保护"],
            }
            for i in range(10)
        ]

        with tempfile.TemporaryDirectory() as tmpdir:
            tmp = Path(tmpdir)
            raw_path = tmp / "raw.json"
            out_dir = tmp / "processed"
            raw_path.write_text(json.dumps(sample_raw), encoding="utf-8")

            summary = run_pipeline(
                raw_path=raw_path,
                taxonomy_path=DEFAULT_TAXONOMY_PATH,
                processed_dir=out_dir,
                include_needs_review=True,
            )
            self.assertEqual(summary["extract"]["extracted_senses"], 30)
            self.assertEqual(summary["preprocess"]["labeled_records"], 30)
            train = load_jsonl(out_dir / "train.jsonl")
            val = load_jsonl(out_dir / "val.jsonl")
            test = load_jsonl(out_dir / "test.jsonl")
            self.assertEqual(len(train) + len(val) + len(test), 30)
            self.assertFalse({r["word_id"] for r in train} & {r["word_id"] for r in test})


if __name__ == "__main__":
    unittest.main()
