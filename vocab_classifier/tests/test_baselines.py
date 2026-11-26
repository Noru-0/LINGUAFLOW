"""Unit tests for baseline models, evaluation metrics, and benchmark runner."""

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
from src.evaluation.experiments import run_stage2_experiments
from src.evaluation.metrics import evaluate_hierarchical_predictions, format_benchmark_markdown
from src.models.baselines import (
    HierarchicalLinearBaseline,
    compute_power_class_weights,
    make_logreg_factory,
)
from src.training.train_baselines import run_baseline_benchmark


class TestBaselines(unittest.TestCase):
    def setUp(self) -> None:
        self.taxonomy = load_taxonomy(DEFAULT_TAXONOMY_PATH)

    def test_hierarchical_linear_baseline_and_metrics(self) -> None:
        rng = np.random.default_rng(7)
        env_id = self.taxonomy["label2id"]["Environment & Nature"]
        gen_id = self.taxonomy["label2id"]["General Vocabulary"]
        sub_climate = self.taxonomy["subtopic2id"]["env.climate"]
        sub_wildlife = self.taxonomy["subtopic2id"]["env.wildlife"]
        sub_func = self.taxonomy["subtopic2id"]["gen.function"]
        sub_link = self.taxonomy["subtopic2id"]["gen.linking"]

        X = np.vstack(
            [
                rng.normal(loc=[2.0, 2.0, 0.0, 0.0], scale=0.2, size=(10, 4)),
                rng.normal(loc=[2.0, -2.0, 0.0, 0.0], scale=0.2, size=(10, 4)),
                rng.normal(loc=[-2.0, 0.0, 2.0, 0.0], scale=0.2, size=(10, 4)),
                rng.normal(loc=[-2.0, 0.0, -2.0, 0.0], scale=0.2, size=(10, 4)),
            ]
        )
        y_main = [env_id] * 20 + [gen_id] * 20
        y_sub = [sub_climate] * 10 + [sub_wildlife] * 10 + [sub_func] * 10 + [sub_link] * 10

        clf = HierarchicalLinearBaseline(make_logreg_factory({"C": 1.0}, seed=42))
        clf.fit(X, y_main, y_sub)
        pred_main, pred_sub_e2e = clf.predict(X)
        pred_sub_oracle = clf.predict_subtopics_given_main(X, y_main)

        metrics = evaluate_hierarchical_predictions(
            y_main_true=y_main,
            y_main_pred=pred_main,
            y_sub_true=y_sub,
            y_sub_pred_e2e=pred_sub_e2e,
            y_sub_pred_oracle=pred_sub_oracle,
            taxonomy=self.taxonomy,
        )
        self.assertGreaterEqual(metrics["main_topic"]["macro_f1"], 0.95)
        self.assertGreaterEqual(metrics["subtopic_end_to_end"]["macro_f1"], 0.95)
        self.assertGreaterEqual(metrics["general_vs_topical"]["general_f1"], 0.95)

    def test_run_baseline_benchmark_on_temp_splits(self) -> None:
        samples = [
            {
                "sample_id": f"env_c_{i}",
                "word": f"emission{i}",
                "pos": "noun",
                "definition": "Greenhouse gas carbon emissions climate warming.",
                "main_topic": "Environment & Nature",
                "subtopic_id": "env.climate",
                "text": "Word: emission (noun)\nDefinition: Greenhouse gas carbon emissions climate warming.",
            }
            for i in range(6)
        ] + [
            {
                "sample_id": f"env_w_{i}",
                "word": f"species{i}",
                "pos": "noun",
                "definition": "Endangered wildlife biodiversity habitat forest conservation.",
                "main_topic": "Environment & Nature",
                "subtopic_id": "env.wildlife",
                "text": "Word: species (noun)\nDefinition: Endangered wildlife biodiversity habitat forest conservation.",
            }
            for i in range(6)
        ] + [
            {
                "sample_id": f"gen_f_{i}",
                "word": f"about{i}",
                "pos": "preposition",
                "definition": "Grammatical function preposition spatial temporal relation.",
                "main_topic": "General Vocabulary",
                "subtopic_id": "gen.function",
                "text": "Word: about (preposition)\nDefinition: Grammatical function preposition spatial temporal relation.",
            }
            for i in range(6)
        ] + [
            {
                "sample_id": f"gen_l_{i}",
                "word": f"however{i}",
                "pos": "adverb",
                "definition": "Discourse linking conjunction contrasting clauses however although.",
                "main_topic": "General Vocabulary",
                "subtopic_id": "gen.linking",
                "text": "Word: however (adverb)\nDefinition: Discourse linking conjunction contrasting clauses however although.",
            }
            for i in range(6)
        ]

        with tempfile.TemporaryDirectory() as tmpdir:
            tmp = Path(tmpdir)
            for name, subset in (("train.jsonl", samples), ("val.jsonl", samples[:8]), ("test.jsonl", samples[-8:])):
                (tmp / name).write_text("\n".join(json.dumps(r) for r in subset) + "\n", encoding="utf-8")

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
                        "tfidf": {"ngram_range": [1, 2], "max_features": 500, "min_df": 1},
                        "minilm": {"model_name": "stub"},
                        "classifiers": {
                            "tfidf_logreg": {"C": 1.0, "max_iter": 200},
                            "tfidf_svm": {"C": 1.0, "max_iter": 500},
                            "frozen_minilm_logreg": {"C": 1.0, "max_iter": 200},
                        },
                    }
                ),
                encoding="utf-8",
            )

            def _stub_encode(texts: list[str], **kwargs: object) -> np.ndarray:
                rng = np.random.default_rng(len(texts))
                return rng.normal(size=(len(texts), 16)).astype(np.float32)

            results = run_baseline_benchmark(
                config_path=cfg_path,
                minilm_encoder_fn=_stub_encode,
            )
            self.assertEqual(
                set(results["models"].keys()),
                {"tfidf_logreg", "tfidf_svm", "frozen_minilm_logreg"},
            )
            self.assertTrue((tmp / "out" / "baseline_results.json").exists())
            self.assertTrue((tmp / "out" / "baseline_report.md").exists())
            md = format_benchmark_markdown(results)
            self.assertIn("TF-IDF + Logistic Regression", md)
            self.assertIn("TF-IDF + Linear SVM", md)
            self.assertIn("Frozen MiniLM + Logistic Regression", md)

    def test_power_class_weights_and_stage2_experiments(self) -> None:
        weights = compute_power_class_weights([0] * 100 + [1] * 10, alpha=0.5)
        self.assertGreater(weights[1], weights[0])
        self.assertLess(weights[1] / weights[0], 10.0)

        samples = [
            {
                "sample_id": f"env_c_{i}",
                "word": f"emission{i}",
                "pos": "noun",
                "sense_index": 0,
                "definition": "Greenhouse gas carbon emissions climate warming.",
                "collocations": ["carbon emissions"],
                "examples": ["Carbon emissions are rising."],
                "main_topic": "Environment & Nature",
                "subtopic_id": "env.climate",
            }
            for i in range(6)
        ] + [
            {
                "sample_id": f"gen_f_{i}",
                "word": f"about{i}",
                "pos": "preposition",
                "sense_index": 1,
                "definition": "Concerning a subject.",
                "collocations": ["talk about"],
                "examples": ["They talked about policy."],
                "main_topic": "General Vocabulary",
                "subtopic_id": "gen.function",
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
                    }
                ),
                encoding="utf-8",
            )

            def _stub_encode(texts: list[str], **kwargs: object) -> np.ndarray:
                vecs = []
                for t in texts:
                    if "Greenhouse" in t:
                        vecs.append([1.0, 0.0, 0.1, 0.0])
                    else:
                        vecs.append([0.0, 1.0, 0.0, 0.1])
                return np.asarray(vecs, dtype=np.float32)

            summary = run_stage2_experiments(
                config_path=cfg_path,
                output_dir=tmp / "exp",
                minilm_encoder_fn=_stub_encode,
            )
            self.assertIn("E1_class_weight_ablation", summary)
            self.assertIn("E2_input_ablation", summary)
            self.assertIn("E3_general_label_correction", summary)
            self.assertIn("E4_primary_vs_secondary", summary)
            self.assertTrue((tmp / "exp" / "stage2_e1_e4_report.md").exists())


if __name__ == "__main__":
    unittest.main()
