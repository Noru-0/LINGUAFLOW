"""Unit tests for the Multi-task Hierarchical MiniLM classifier architecture."""

from __future__ import annotations

import sys
import unittest
from pathlib import Path
from types import SimpleNamespace

import torch
import torch.nn as nn

PACKAGE_ROOT = Path(__file__).resolve().parents[1]
if str(PACKAGE_ROOT) not in sys.path:
    sys.path.insert(0, str(PACKAGE_ROOT))

from src.data.common import DEFAULT_TAXONOMY_PATH, load_taxonomy
from src.models.hierarchical_classifier import (
    DEFAULT_MODEL_CONFIG_PATH,
    HierarchicalVocabClassifier,
    ModelConfig,
    apply_hierarchy_mask,
    build_hierarchy_mask,
    load_encoder_and_tokenizer,
)


class _DummyEncoder(nn.Module):
    """Lightweight deterministic 384-d encoder stub for fast offline tests."""

    def __init__(self, hidden_size: int = 384, vocab_size: int = 128) -> None:
        super().__init__()
        self.config = SimpleNamespace(hidden_size=hidden_size)
        self.emb = nn.Embedding(vocab_size, hidden_size)
        self.proj = nn.Linear(hidden_size, hidden_size)

    def forward(self, input_ids: torch.Tensor, attention_mask: torch.Tensor) -> SimpleNamespace:
        x = self.proj(self.emb(input_ids))
        return SimpleNamespace(last_hidden_state=x)


class _DummyTokenizer:
    """Minimal tokenizer returning fixed-length token tensors for unit tests."""

    def __call__(
        self,
        texts: list[str],
        *,
        padding: bool = True,
        truncation: bool = True,
        max_length: int = 192,
        return_tensors: str = "pt",
    ) -> dict[str, torch.Tensor]:
        batch_size = len(texts)
        seq_len = min(12, max_length)
        input_ids = torch.arange(seq_len).unsqueeze(0).repeat(batch_size, 1) % 100
        attention_mask = torch.ones((batch_size, seq_len), dtype=torch.long)
        return {"input_ids": input_ids, "attention_mask": attention_mask}


class TestModelArchitecture(unittest.TestCase):
    def setUp(self) -> None:
        self.taxonomy = load_taxonomy(DEFAULT_TAXONOMY_PATH)
        self.config = ModelConfig.from_json(DEFAULT_MODEL_CONFIG_PATH)

    def test_model_config_defaults(self) -> None:
        self.assertEqual(self.config.embedding_dim, 384)
        self.assertEqual(self.config.num_main_topics, 11)
        self.assertEqual(self.config.num_subtopics, 45)
        self.assertEqual(self.config.model_name, "sentence-transformers/all-MiniLM-L6-v2")

    def test_hierarchy_mask_structure(self) -> None:
        mask = build_hierarchy_mask(self.taxonomy)
        self.assertEqual(tuple(mask.shape), (11, 45))
        # Every subtopic belongs to exactly one parent main topic.
        self.assertTrue(torch.all(mask.sum(dim=0) == 1))

        env_idx = self.taxonomy["label2id"]["Environment & Nature"]
        gen_idx = self.taxonomy["label2id"]["General Vocabulary"]
        self.assertEqual(int(mask[env_idx].sum().item()), 5)
        self.assertEqual(int(mask[gen_idx].sum().item()), 4)

    def test_forward_shapes_loss_and_gradients(self) -> None:
        encoder = _DummyEncoder(hidden_size=self.config.embedding_dim)
        model = HierarchicalVocabClassifier.from_config(
            self.config,
            taxonomy_path=DEFAULT_TAXONOMY_PATH,
            encoder=encoder,
        )

        input_ids = torch.tensor([[1, 2, 3, 4], [5, 6, 7, 0]], dtype=torch.long)
        attention_mask = torch.tensor([[1, 1, 1, 1], [1, 1, 1, 0]], dtype=torch.long)
        main_labels = torch.tensor(
            [
                self.taxonomy["label2id"]["Environment & Nature"],
                self.taxonomy["label2id"]["General Vocabulary"],
            ],
            dtype=torch.long,
        )
        subtopic_labels = torch.tensor(
            [
                self.taxonomy["subtopic2id"]["env.wildlife"],
                self.taxonomy["subtopic2id"]["gen.function"],
            ],
            dtype=torch.long,
        )

        outputs = model(
            input_ids,
            attention_mask,
            main_labels=main_labels,
            subtopic_labels=subtopic_labels,
            teacher_forcing=True,
        )
        self.assertEqual(tuple(outputs["embeddings"].shape), (2, 384))
        self.assertEqual(tuple(outputs["main_logits"].shape), (2, 11))
        self.assertEqual(tuple(outputs["subtopic_logits"].shape), (2, 45))
        self.assertEqual(tuple(outputs["masked_subtopic_logits"].shape), (2, 45))
        self.assertIsNotNone(outputs["loss"])

        outputs["loss"].backward()
        self.assertIsNotNone(model.main_head.weight.grad)
        self.assertIsNotNone(model.subtopic_head.weight.grad)
        self.assertTrue(torch.isfinite(outputs["loss"]).item())

    def test_hierarchy_mask_enforces_valid_child_prediction(self) -> None:
        encoder = _DummyEncoder(hidden_size=self.config.embedding_dim)
        model = HierarchicalVocabClassifier.from_config(
            self.config,
            taxonomy_path=DEFAULT_TAXONOMY_PATH,
            encoder=encoder,
        )
        tokenizer = _DummyTokenizer()
        sample = [
            {
                "word": "biodiversity",
                "pos": "noun",
                "definition": "The variety of plant and animal life in the world.",
            }
        ]
        preds = model.predict_records(
            sample,
            tokenizer,
            self.taxonomy,
            given_main_topics=["Environment & Nature"],
        )
        self.assertEqual(len(preds), 1)
        self.assertEqual(preds[0]["main_topic"], "Environment & Nature")
        self.assertEqual(preds[0]["main_topic_id"], "env")
        self.assertTrue(preds[0]["subtopic_id"].startswith("env."))
        self.assertEqual(
            self.taxonomy["valid_subtopics"][preds[0]["subtopic_id"]],
            preds[0]["main_topic"],
        )

        # Direct mask test: invalid subtopics receive -1e9
        logits = torch.zeros((1, 45))
        gen_idx = torch.tensor([self.taxonomy["label2id"]["General Vocabulary"]])
        masked = apply_hierarchy_mask(logits, gen_idx, model.hierarchy_mask)
        allowed_count = int((masked[0] > -1e8).sum().item())
        self.assertEqual(allowed_count, 4)

    def test_real_minilm_encoder_dimension_and_forward(self) -> None:
        encoder, tokenizer = load_encoder_and_tokenizer(self.config.model_name)
        model = HierarchicalVocabClassifier.from_config(
            self.config,
            taxonomy_path=DEFAULT_TAXONOMY_PATH,
            encoder=encoder,
        )
        preds = model.predict_records(
            [
                {
                    "word": "biodiversity",
                    "pos": "noun",
                    "definition": "The variety of plant and animal life in the world.",
                }
            ],
            tokenizer,
            self.taxonomy,
        )
        self.assertEqual(len(preds), 1)
        self.assertIn(preds[0]["main_topic"], self.taxonomy["label2id"])
        self.assertEqual(
            self.taxonomy["valid_subtopics"][preds[0]["subtopic_id"]],
            preds[0]["main_topic"],
        )


if __name__ == "__main__":
    unittest.main()
