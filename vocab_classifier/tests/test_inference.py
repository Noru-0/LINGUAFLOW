"""Unit tests for Stage 4 Top-K hierarchical inference, calibration, and abstention."""

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

from src.data.common import DEFAULT_TAXONOMY_PATH, load_taxonomy
from src.inference.hierarchical_inference import (
    CalibrationParams,
    HierarchicalPredictor,
    evaluate_topk_and_abstention,
)
from src.models.hierarchical_classifier import HierarchicalVocabClassifier, ModelConfig


class _StubEncoder(nn.Module):
    def __init__(self, hidden_size: int = 384, vocab_size: int = 64) -> None:
        super().__init__()
        self.config = SimpleNamespace(hidden_size=hidden_size)
        self.emb = nn.Embedding(vocab_size, hidden_size)

    def forward(self, input_ids: torch.Tensor, attention_mask: torch.Tensor) -> SimpleNamespace:
        return SimpleNamespace(last_hidden_state=self.emb(input_ids))


class _StubTokenizer:
    def __call__(
        self,
        texts: list[str],
        *,
        padding: bool = True,
        truncation: bool = True,
        max_length: int = 128,
        return_tensors: str = "pt",
    ) -> dict[str, torch.Tensor]:
        ids = [[1 + (ord(c) % 40) for c in t[:6]] or [1] for t in texts]
        ids = [row + [0] * (6 - len(row)) for row in ids]
        t_ids = torch.tensor(ids, dtype=torch.long)
        return {"input_ids": t_ids, "attention_mask": (t_ids != 0).long()}


class TestHierarchicalInference(unittest.TestCase):
    def setUp(self) -> None:
        self.taxonomy = load_taxonomy(DEFAULT_TAXONOMY_PATH)

    def test_topk_expansion_and_abstention(self) -> None:
        cfg = ModelConfig()
        model = HierarchicalVocabClassifier.from_config(cfg, encoder=_StubEncoder())
        predictor = HierarchicalPredictor(
            model,
            _StubTokenizer(),
            self.taxonomy,
            calibration=CalibrationParams(1.2, 1.1),
        )
        # Untrained stub has ~uniform confidences (~0.09), so strict threshold must abstain
        preds = predictor.predict_batch(
            [{"word": "about", "pos": "preposition", "definition": "Concerning a subject."}],
            top_k_main=2,
            top_k_joint=3,
            min_main_confidence=0.5,
            min_joint_confidence=0.3,
        )
        self.assertEqual(len(preds), 1)
        self.assertTrue(preds[0]["abstained"])
        self.assertEqual(preds[0]["review_status"], "needs_review")
        self.assertEqual(len(preds[0]["top_k_main_candidates"]), 2)
        self.assertEqual(len(preds[0]["top_k_joint_candidates"]), 3)
        # Accepted when thresholds are zero
        accepted = predictor.predict_batch(
            [{"word": "about", "pos": "preposition", "definition": "Concerning a subject."}],
            top_k_main=2,
            top_k_joint=3,
            min_main_confidence=0.0,
            min_joint_confidence=0.0,
            min_main_margin=0.0,
        )
        self.assertFalse(accepted[0]["abstained"])
        self.assertEqual(accepted[0]["review_status"], "accepted")

    def test_evaluate_topk_and_abstention_end_to_end(self) -> None:
        samples = [
            {
                "sample_id": f"s{i}",
                "word": f"word{i}",
                "pos": "noun",
                "definition": "Climate emissions.",
                "main_topic": "Environment & Nature",
                "subtopic_id": "env.climate",
                "text": "Climate emissions",
            }
            for i in range(6)
        ]
        with tempfile.TemporaryDirectory() as tmpdir:
            tmp = Path(tmpdir)
            for name in ("val.jsonl", "test.jsonl"):
                (tmp / name).write_text("\n".join(json.dumps(r) for r in samples) + "\n", encoding="utf-8")

            ckpt = tmp / "ckpt"
            model = HierarchicalVocabClassifier.from_config(ModelConfig(), encoder=_StubEncoder())
            model.save_checkpoint(ckpt)

            tcfg = tmp / "train_config.json"
            tcfg.write_text(
                json.dumps(
                    {
                        "taxonomy_path": str(DEFAULT_TAXONOMY_PATH),
                        "val_path": str(tmp / "val.jsonl"),
                        "test_path": str(tmp / "test.jsonl"),
                    }
                ),
                encoding="utf-8",
            )
            rep = evaluate_topk_and_abstention(
                train_config_path=tcfg,
                checkpoint_dir=ckpt,
                output_dir=tmp / "exp",
                encoder=_StubEncoder(),
                tokenizer=_StubTokenizer(),
            )
            self.assertIn("top_1_main", rep["E6_single_vs_topk"])
            self.assertIn("top_2_main", rep["E6_single_vs_topk"])
            self.assertIn("top_3_main", rep["E6_single_vs_topk"])
            self.assertTrue((ckpt / "calibration.json").exists())
            self.assertTrue((tmp / "exp" / "stage4_e6_report.md").exists())


if __name__ == "__main__":
    unittest.main()
