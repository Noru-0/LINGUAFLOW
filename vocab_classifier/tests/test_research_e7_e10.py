"""Unit tests for E7-E10 research validation, selective prediction, and GPU guards."""

from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

import torch
import torch.nn as nn

PACKAGE_ROOT = Path(__file__).resolve().parents[1]
if str(PACKAGE_ROOT) not in sys.path:
    sys.path.insert(0, str(PACKAGE_ROOT))

from src.data.common import DEFAULT_TAXONOMY_PATH, load_taxonomy
from src.evaluation.research_e7_e10 import (
    run_e10_selective_prediction,
    run_e7_subtopic_recovery,
    run_e8_loss_ablation,
    run_e9_topk_validation,
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


class TestResearchE7E10(unittest.TestCase):
    def test_e7_e8_refuse_cpu_training_by_default(self) -> None:
        with patch("torch.cuda.is_available", return_value=False):
            with self.assertRaises(RuntimeError):
                run_e7_subtopic_recovery(allow_cpu=False)
            with self.assertRaises(RuntimeError):
                run_e8_loss_ablation(allow_cpu=False)

    def test_e9_and_e10_on_temp_checkpoint(self) -> None:
        samples = [
            {
                "sample_id": f"e{i}",
                "word": f"climate{i}",
                "pos": "noun",
                "definition": "Climate emissions.",
                "main_topic": "Environment & Nature",
                "subtopic_id": "env.climate",
                "text": f"Climate emissions {i}",
            }
            for i in range(6)
        ] + [
            {
                "sample_id": f"g{i}",
                "word": f"about{i}",
                "pos": "preposition",
                "definition": "Concerning something.",
                "main_topic": "General Vocabulary",
                "subtopic_id": "gen.function",
                "text": f"About something {i}",
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

            rep9 = run_e9_topk_validation(
                train_config_path=tcfg,
                checkpoint_dir=ckpt,
                output_dir=tmp / "exp",
                encoder=_StubEncoder(),
                tokenizer=_StubTokenizer(),
            )
            self.assertEqual(rep9["invariants"]["hierarchy_violations"], 0)
            self.assertEqual(rep9["invariants"]["joint_prob_mismatches"], 0)
            self.assertIn("top_1_main_recall", rep9["pure_main_recall"])

            rep10 = run_e10_selective_prediction(
                train_config_path=tcfg,
                checkpoint_dir=ckpt,
                output_dir=tmp / "exp",
                encoder=_StubEncoder(),
                tokenizer=_StubTokenizer(),
            )
            self.assertEqual(len(rep10["test_risk_coverage_curve"]), 20)
            self.assertEqual(len(rep10["operating_points"]), 5)
            self.assertTrue((tmp / "exp" / "e9_topk_validation_report.md").exists())
            self.assertTrue((tmp / "exp" / "e10_selective_prediction_report.md").exists())


if __name__ == "__main__":
    unittest.main()
