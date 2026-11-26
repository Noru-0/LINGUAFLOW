"""Unit tests for Stage 3 MiniLM fine-tuning trainer and masked subtopic loss."""

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
from src.models.hierarchical_classifier import HierarchicalVocabClassifier, ModelConfig
from src.training.train_minilm import VocabSenseDataset, train_finetuned_minilm


class _TinyEncoder(nn.Module):
    def __init__(self, hidden_size: int = 384, vocab_size: int = 64) -> None:
        super().__init__()
        self.config = SimpleNamespace(hidden_size=hidden_size)
        self.emb = nn.Embedding(vocab_size, hidden_size)
        self.proj = nn.Linear(hidden_size, hidden_size)

    def forward(self, input_ids: torch.Tensor, attention_mask: torch.Tensor) -> SimpleNamespace:
        return SimpleNamespace(last_hidden_state=self.proj(self.emb(input_ids)))


class _TinyTokenizer:
    def __call__(
        self,
        texts: list[str],
        *,
        padding: bool = True,
        truncation: bool = True,
        max_length: int = 128,
        return_tensors: str = "pt",
    ) -> dict[str, torch.Tensor]:
        batch_ids = []
        for t in texts:
            toks = [1 + (ord(ch) % 50) for ch in t[:8]] or [1]
            batch_ids.append(toks + [0] * (8 - len(toks)))
        input_ids = torch.tensor(batch_ids, dtype=torch.long)
        mask = (input_ids != 0).long()
        return {"input_ids": input_ids, "attention_mask": mask}

    def save_pretrained(self, out_dir: Path | str) -> None:
        Path(out_dir).mkdir(parents=True, exist_ok=True)
        (Path(out_dir) / "tokenizer_stub.json").write_text("{}", encoding="utf-8")


class TestTrainMiniLM(unittest.TestCase):
    def setUp(self) -> None:
        self.taxonomy = load_taxonomy(DEFAULT_TAXONOMY_PATH)

    def test_untrusted_subtopic_masking_in_dataset_and_loss(self) -> None:
        records = [
            {
                "sample_id": "s1",
                "word": "carbon",
                "pos": "noun",
                "definition": "Carbon gas.",
                "main_topic": "Environment & Nature",
                "subtopic_id": "env.climate",
                "is_trusted_subtopic": True,
            },
            {
                "sample_id": "s2",
                "word": "strait",
                "pos": "noun",
                "definition": "Financial difficulty.",
                "main_topic": "Environment & Nature",
                "subtopic_id": "env.disaster",
                "is_trusted_subtopic": False,
            },
        ]
        ds = VocabSenseDataset(records, self.taxonomy, mask_untrusted_subtopics=True)
        self.assertNotEqual(ds.subtopic_labels[0], -100)
        self.assertEqual(ds.subtopic_labels[1], -100)

        # Verify forward handles all -100 subtopic labels without NaN
        cfg = ModelConfig()
        model = HierarchicalVocabClassifier.from_config(cfg, encoder=_TinyEncoder())
        out = model(
            torch.tensor([[1, 2, 3], [4, 5, 6]]),
            torch.ones((2, 3), dtype=torch.long),
            main_labels=torch.tensor([0, 0]),
            subtopic_labels=torch.tensor([-100, -100]),
        )
        self.assertIsNone(out["subtopic_loss"])
        self.assertTrue(torch.isfinite(out["loss"]).item())

    def test_train_finetuned_minilm_early_stopping_on_temp_data(self) -> None:
        samples = [
            {
                "sample_id": f"e{i}",
                "word": f"climate{i}",
                "pos": "noun",
                "sense_index": 0,
                "definition": "Greenhouse gas climate.",
                "main_topic": "Environment & Nature",
                "subtopic_id": "env.climate",
                "is_trusted_subtopic": True,
                "text": "AAAA climate",
            }
            for i in range(6)
        ] + [
            {
                "sample_id": f"g{i}",
                "word": f"about{i}",
                "pos": "preposition",
                "sense_index": 0,
                "definition": "Concerning something.",
                "main_topic": "General Vocabulary",
                "subtopic_id": "gen.function",
                "is_trusted_subtopic": True,
                "text": "ZZZZ about",
            }
            for i in range(6)
        ]

        with tempfile.TemporaryDirectory() as tmpdir:
            tmp = Path(tmpdir)
            for name in ("train.jsonl", "val.jsonl", "test.jsonl"):
                (tmp / name).write_text("\n".join(json.dumps(r) for r in samples) + "\n", encoding="utf-8")

            mcfg_path = tmp / "model_config.json"
            ModelConfig().to_json(mcfg_path)

            tcfg_path = tmp / "train_config.json"
            tcfg_path.write_text(
                json.dumps(
                    {
                        "seed": 42,
                        "model_config_path": str(mcfg_path),
                        "train_path": str(tmp / "train.jsonl"),
                        "val_path": str(tmp / "val.jsonl"),
                        "test_path": str(tmp / "test.jsonl"),
                        "taxonomy_path": str(DEFAULT_TAXONOMY_PATH),
                        "output_dir": str(tmp / "ckpt"),
                        "max_length": 16,
                        "batch_size": 4,
                        "eval_batch_size": 4,
                        "epochs": 2,
                        "patience": 2,
                        "encoder_lr": 1e-3,
                        "head_lr": 1e-3,
                        "class_weight_alpha": 0.25,
                    }
                ),
                encoding="utf-8",
            )

            res = train_finetuned_minilm(
                tcfg_path,
                encoder=_TinyEncoder(),
                tokenizer=_TinyTokenizer(),
            )
            self.assertGreaterEqual(res["best_epoch"], 1)
            self.assertTrue((tmp / "ckpt" / "best_model" / "model_state.pt").exists())
            self.assertTrue((tmp / "ckpt" / "finetune_results.json").exists())


if __name__ == "__main__":
    unittest.main()
