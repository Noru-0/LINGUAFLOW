"""Unit tests for final production model packaging and ProductionVocabPredictor."""

from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace

import torch
import torch.nn as nn

PACKAGE_ROOT = Path(__file__).resolve().parents[1]
if str(PACKAGE_ROOT) not in sys.path:
    sys.path.insert(0, str(PACKAGE_ROOT))

from src.data.common import DEFAULT_TAXONOMY_PATH
from src.inference.final_predictor import ProductionVocabPredictor
from src.training.finalize_model import build_final_model_package


class _DeterministicStubEncoder(nn.Module):
    def __init__(self, hidden_size: int = 384, vocab_size: int = 64) -> None:
        super().__init__()
        self.config = SimpleNamespace(hidden_size=hidden_size)
        self.emb = nn.Embedding(vocab_size, hidden_size)

    def forward(self, input_ids: torch.Tensor, attention_mask: torch.Tensor) -> SimpleNamespace:
        return SimpleNamespace(last_hidden_state=self.emb(input_ids))

    def save_pretrained(self, out_dir: Path | str) -> None:
        Path(out_dir).mkdir(parents=True, exist_ok=True)


class _DeterministicStubTokenizer:
    def __call__(
        self,
        texts: list[str],
        *,
        padding: bool = True,
        truncation: bool = True,
        max_length: int = 192,
        return_tensors: str = "pt",
    ) -> dict[str, torch.Tensor]:
        ids = []
        for t in texts:
            tok = 1 if "Climate" in t else (2 if "Biodiversity" in t else 3)
            ids.append([tok, tok + 10, tok + 20])
        t_ids = torch.tensor(ids, dtype=torch.long)
        return {"input_ids": t_ids, "attention_mask": torch.ones_like(t_ids)}

    def save_pretrained(self, out_dir: Path | str) -> None:
        Path(out_dir).mkdir(parents=True, exist_ok=True)


class TestFinalModelPackage(unittest.TestCase):
    def test_build_final_package_and_reload_predictor(self) -> None:
        samples = [
            {
                "sample_id": f"c_{i}",
                "word_id": f"climate_{i}",
                "word": f"climate{i}",
                "pos": "noun",
                "definition": "Climate warming emissions.",
                "collocations": ["carbon emissions"],
                "examples": ["Climate emissions increased."],
                "main_topic": "Environment & Nature",
                "subtopic_id": "env.climate",
                "text": f"Word: climate{i} (noun)\nDefinition: Climate warming emissions.",
            }
            for i in range(6)
        ] + [
            {
                "sample_id": f"w_{i}",
                "word_id": f"wild_{i}",
                "word": f"wildlife{i}",
                "pos": "noun",
                "definition": "Biodiversity and wildlife conservation.",
                "collocations": ["wildlife habitat"],
                "examples": ["Biodiversity protects ecosystems."],
                "main_topic": "Environment & Nature",
                "subtopic_id": "env.wildlife",
                "text": f"Word: wildlife{i} (noun)\nDefinition: Biodiversity and wildlife conservation.",
            }
            for i in range(6)
        ] + [
            {
                "sample_id": f"g_{i}",
                "word_id": f"about_{i}",
                "word": f"about{i}",
                "pos": "preposition",
                "definition": "Concerning a subject.",
                "collocations": ["talk about"],
                "examples": ["Think about it."],
                "main_topic": "General Vocabulary",
                "subtopic_id": "gen.function",
                "text": f"Word: about{i} (preposition)\nDefinition: Concerning a subject.",
            }
            for i in range(6)
        ]

        with tempfile.TemporaryDirectory() as tmpdir:
            tmp = Path(tmpdir)
            for split_name, offset in (("train.jsonl", "tr"), ("val.jsonl", "va"), ("test.jsonl", "te")):
                split_recs = [
                    {**r, "word_id": f"{offset}_{r['word_id']}"} for r in samples
                ]
                (tmp / split_name).write_text(
                    "\n".join(json.dumps(r) for r in split_recs) + "\n",
                    encoding="utf-8",
                )

            bcfg = tmp / "baseline_config.json"
            bcfg.write_text(
                json.dumps(
                    {
                        "seed": 42,
                        "train_path": str(tmp / "train.jsonl"),
                        "val_path": str(tmp / "val.jsonl"),
                        "test_path": str(tmp / "test.jsonl"),
                        "taxonomy_path": str(DEFAULT_TAXONOMY_PATH),
                        "minilm": {"model_name": "stub", "max_length": 32, "batch_size": 8},
                    }
                ),
                encoding="utf-8",
            )

            out_dir = tmp / "final_model"
            enc = _DeterministicStubEncoder()
            tok = _DeterministicStubTokenizer()
            metrics = build_final_model_package(
                baseline_config_path=bcfg,
                output_dir=out_dir,
                save_local_encoder=False,
                encoder=enc,
                tokenizer=tok,
            )

            for expected_path in (
                out_dir / "main_classifier" / "model.joblib",
                out_dir / "subtopic_classifiers" / "index.json",
                out_dir / "calibration" / "temperatures.json",
                out_dir / "config" / "taxonomy.json",
                out_dir / "config" / "preprocessing.json",
                out_dir / "config" / "inference.json",
                out_dir / "evaluation" / "test_metrics.json",
                out_dir / "evaluation" / "classification_report.json",
                out_dir / "evaluation" / "confusion_matrix.json",
                out_dir / "README.md",
            ):
                self.assertTrue(expected_path.exists(), f"Missing {expected_path}")

            self.assertEqual(metrics["full_test"]["num_samples"], 18)
            self.assertGreaterEqual(metrics["full_test"]["main_topic"]["accuracy"], 0.99)

            # Reload predictor with stub encoder/tokenizer and check Top-1 + abstention schema
            from src.data.common import load_json, load_taxonomy
            import joblib

            predictor = ProductionVocabPredictor(
                encoder=enc,
                tokenizer=tok,
                main_clf=joblib.load(out_dir / "main_classifier" / "model.joblib"),
                sub_clfs={
                    int(k): joblib.load(out_dir / "subtopic_classifiers" / v)
                    for k, v in load_json(out_dir / "subtopic_classifiers" / "index.json")["by_main_label_id"].items()
                },
                taxonomy=load_taxonomy(out_dir / "config" / "taxonomy.json"),
                preprocessing_cfg=load_json(out_dir / "config" / "preprocessing.json"),
                inference_cfg=load_json(out_dir / "config" / "inference.json"),
                temperatures=load_json(out_dir / "calibration" / "temperatures.json"),
            )
            preds = predictor.predict([samples[0], samples[-1]])
            self.assertEqual(len(preds), 2)
            self.assertEqual(preds[0]["main_topic_id"], "env")
            self.assertEqual(preds[1]["main_topic_id"], "gen")
            self.assertIn("top_k_main_candidates", preds[0])
            self.assertIn("top_k_subtopic_candidates", preds[0])
            # Threshold above 1.0 forces abstention -> needs_review
            abstained = predictor.predict([samples[0]], main_threshold=1.01, joint_threshold=1.01)
            self.assertTrue(abstained[0]["abstained"])
            self.assertEqual(abstained[0]["review_status"], "needs_review")


if __name__ == "__main__":
    unittest.main()
