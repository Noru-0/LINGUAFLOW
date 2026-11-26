"""Unit tests for Frozen MiniLM error analysis and confusion diagnostics."""

from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np

PACKAGE_ROOT = Path(__file__).resolve().parents[1]
if str(PACKAGE_ROOT) not in sys.path:
    sys.path.insert(0, str(PACKAGE_ROOT))

from src.data.common import DEFAULT_TAXONOMY_PATH, load_taxonomy
from src.evaluation.error_analysis import (
    analyze_hierarchical_errors,
    format_error_analysis_markdown,
    run_frozen_minilm_error_analysis,
)
from src.training.train_baselines import run_baseline_benchmark


class TestErrorAnalysis(unittest.TestCase):
    def setUp(self) -> None:
        self.taxonomy = load_taxonomy(DEFAULT_TAXONOMY_PATH)

    def test_cascading_error_decomposition(self) -> None:
        env_id = self.taxonomy["label2id"]["Environment & Nature"]
        gen_id = self.taxonomy["label2id"]["General Vocabulary"]
        sub_climate = self.taxonomy["subtopic2id"]["env.climate"]
        sub_func = self.taxonomy["subtopic2id"]["gen.function"]

        records = [
            {
                "sample_id": "s1",
                "word": "carbon",
                "pos": "noun",
                "sense_index": 0,
                "source_topic": "environment",
                "label_source": "word_atlas_mapping",
                "definition": "Carbon gas.",
                "main_topic": "Environment & Nature",
            },
            {
                "sample_id": "s2",
                "word": "about",
                "pos": "preposition",
                "sense_index": 1,
                "source_topic": "daily",
                "label_source": "word_atlas_mapping+zero_shot_general",
                "definition": "Concerning something.",
                "main_topic": "General Vocabulary",
            },
        ]
        main_probs = np.zeros((2, 11), dtype=float)
        main_probs[0, env_id] = 0.9
        main_probs[1, env_id] = 0.8  # wrong high-confidence prediction

        report = analyze_hierarchical_errors(
            records=records,
            train_records=records,
            y_main_true=[env_id, gen_id],
            y_main_pred=[env_id, env_id],
            y_sub_true=[sub_climate, sub_func],
            y_sub_pred_e2e=[sub_climate, sub_climate],
            y_sub_pred_oracle=[sub_climate, sub_func],
            main_probs=main_probs,
            taxonomy=self.taxonomy,
        )
        decomp = report["decomposition"]
        self.assertEqual(decomp["joint_correct"], 1)
        self.assertEqual(decomp["cascading_main_wrong_sub_wrong"], 1)
        self.assertEqual(decomp["pure_cascading_recoverable_by_oracle_main"], 1)
        self.assertEqual(len(report["confusion"]["matrix"]), 11)
        md = format_error_analysis_markdown({**report, "split": "test"})
        self.assertIn("Cascading Error Decomposition", md)

    def test_run_frozen_minilm_error_analysis_end_to_end(self) -> None:
        samples = [
            {
                "sample_id": f"env_{i}",
                "word": f"climate{i}",
                "pos": "noun",
                "sense_index": 0,
                "source_topic": "environment",
                "label_source": "word_atlas_mapping",
                "definition": "Climate warming emissions.",
                "main_topic": "Environment & Nature",
                "subtopic_id": "env.climate",
                "text": "Word: climate (noun)\nDefinition: Climate warming emissions.",
            }
            for i in range(6)
        ] + [
            {
                "sample_id": f"gen_{i}",
                "word": f"about{i}",
                "pos": "preposition",
                "sense_index": 1,
                "source_topic": "daily",
                "label_source": "word_atlas_mapping+zero_shot_general",
                "definition": "Concerning a subject.",
                "main_topic": "General Vocabulary",
                "subtopic_id": "gen.function",
                "text": "Word: about (preposition)\nDefinition: Concerning a subject.",
            }
            for i in range(6)
        ]

        with tempfile.TemporaryDirectory() as tmpdir:
            tmp = Path(tmpdir)
            for name in ("train.jsonl", "val.jsonl", "test.jsonl"):
                (tmp / name).write_text("\n".join(json.dumps(r) for r in samples) + "\n", encoding="utf-8")

            cfg_path = tmp / "baseline_config.json"
            cfg_path.write_text(
                json.dumps(
                    {
                        "seed": 42,
                        "train_path": str(tmp / "train.jsonl"),
                        "val_path": str(tmp / "val.jsonl"),
                        "test_path": str(tmp / "test.jsonl"),
                        "taxonomy_path": str(DEFAULT_TAXONOMY_PATH),
                        "output_dir": str(tmp / "out"),
                        "minilm": {"model_name": "stub"},
                        "classifiers": {
                            "frozen_minilm_logreg": {"C": 1.0, "max_iter": 200},
                        },
                    }
                ),
                encoding="utf-8",
            )

            def _stub_encode(texts: list[str], **kwargs: object) -> np.ndarray:
                vecs = []
                for t in texts:
                    if "Climate" in t:
                        vecs.append([1.0, 0.0, 0.1, 0.0])
                    else:
                        vecs.append([0.0, 1.0, 0.0, 0.1])
                return np.asarray(vecs, dtype=np.float32)

            run_baseline_benchmark(
                config_path=cfg_path,
                selected_models=("frozen_minilm_logreg",),
                minilm_encoder_fn=_stub_encode,
            )
            report = run_frozen_minilm_error_analysis(
                config_path=cfg_path,
                split="test",
                minilm_encoder_fn=_stub_encode,
            )
            self.assertEqual(report["total_samples"], 12)
            self.assertTrue((tmp / "out" / "frozen_minilm_error_analysis.json").exists())
            self.assertTrue((tmp / "out" / "frozen_minilm_error_analysis.md").exists())


if __name__ == "__main__":
    unittest.main()
