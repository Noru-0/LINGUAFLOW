"""Multi-task hierarchical vocabulary classifier built on MiniLM (384-d encoder)."""

from __future__ import annotations

from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

import torch
import torch.nn as nn
import torch.nn.functional as F

from src.data.common import DEFAULT_TAXONOMY_PATH, PACKAGE_ROOT, load_json, load_taxonomy, save_json
from src.data.preprocess import build_model_text

DEFAULT_MODEL_CONFIG_PATH = PACKAGE_ROOT / "configs" / "model_config.json"


@dataclass
class ModelConfig:
    """Configuration for the multi-task hierarchical MiniLM classifier."""

    model_name: str = "sentence-transformers/all-MiniLM-L6-v2"
    embedding_dim: int = 384
    max_length: int = 192
    num_main_topics: int = 11
    num_subtopics: int = 45
    main_cond_dim: int = 64
    hidden_dropout: float = 0.2
    pooling: str = "mean"
    use_main_conditioning: bool = True
    mask_subtopic_loss: bool = True
    main_loss_weight: float = 1.0
    subtopic_loss_weight: float = 1.0
    taxonomy_path: str = "data/taxonomy/taxonomy.json"
    label_mapping_path: str = "data/processed/label_mapping.json"

    @classmethod
    def from_json(cls, path: Path | str = DEFAULT_MODEL_CONFIG_PATH) -> ModelConfig:
        """Load ModelConfig from a JSON file."""
        raw = load_json(path)
        valid_fields = {f for f in cls.__dataclass_fields__}
        filtered = {k: v for k, v in raw.items() if k in valid_fields}
        return cls(**filtered)

    def to_json(self, path: Path | str) -> Path:
        """Save ModelConfig to a JSON file."""
        return save_json(asdict(self), path)


def _import_transformers_auto() -> tuple[Any, Any]:
    """Import AutoModel and AutoTokenizer safely even if torchvision has a mismatch."""
    import transformers.utils.import_utils as import_utils

    if getattr(import_utils, "_torchvision_available", False):
        try:
            import torchvision  # noqa: F401
        except Exception:
            import_utils._torchvision_available = False

    from transformers import AutoModel, AutoTokenizer

    return AutoModel, AutoTokenizer


def load_encoder_and_tokenizer(
    model_name: str = "sentence-transformers/all-MiniLM-L6-v2",
) -> tuple[nn.Module, Any]:
    """Load pretrained transformer encoder and tokenizer (preferring local cache first)."""
    AutoModel, AutoTokenizer = _import_transformers_auto()
    try:
        tokenizer = AutoTokenizer.from_pretrained(model_name, local_files_only=True)
        encoder = AutoModel.from_pretrained(model_name, local_files_only=True)
    except OSError:
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        encoder = AutoModel.from_pretrained(model_name)
    return encoder, tokenizer


def build_hierarchy_mask(taxonomy: dict[str, Any]) -> torch.Tensor:
    """Build boolean adjacency matrix [num_main_topics, num_subtopics] from taxonomy."""
    label2id: dict[str, int] = taxonomy["label2id"]
    subtopic2id: dict[str, int] = taxonomy["subtopic2id"]
    valid_subtopics: dict[str, str] = taxonomy["valid_subtopics"]

    mask = torch.zeros((len(label2id), len(subtopic2id)), dtype=torch.bool)
    for sub_id, main_name in valid_subtopics.items():
        main_idx = label2id[main_name]
        sub_idx = subtopic2id[sub_id]
        mask[main_idx, sub_idx] = True

    if not torch.all(mask.sum(dim=0) == 1):
        raise ValueError("Invalid taxonomy hierarchy: each subtopic must have exactly one parent.")
    return mask


def apply_hierarchy_mask(
    subtopic_logits: torch.Tensor,
    main_indices: torch.Tensor,
    hierarchy_mask: torch.Tensor,
    mask_value: float = -1e9,
) -> torch.Tensor:
    """Mask out subtopic logits that do not belong to `main_indices`."""
    allowed = hierarchy_mask[main_indices]  # [B, num_subtopics]
    return subtopic_logits.masked_fill(~allowed, mask_value)


def pool_encoder_outputs(
    last_hidden_state: torch.Tensor,
    attention_mask: torch.Tensor,
    pooling: str = "mean",
) -> torch.Tensor:
    """Pool token representations into a fixed 384-d sentence embedding."""
    if pooling == "cls":
        return last_hidden_state[:, 0]
    if pooling != "mean":
        raise ValueError(f"Unsupported pooling '{pooling}'; expected 'mean' or 'cls'.")
    mask = attention_mask.unsqueeze(-1).expand(last_hidden_state.size()).float()
    summed = (last_hidden_state * mask).sum(dim=1)
    counts = mask.sum(dim=1).clamp(min=1e-9)
    return summed / counts


class HierarchicalVocabClassifier(nn.Module):
    """Multi-task hierarchical classifier for 11 Main Topics and 45 Subtopics.

    Architecture:
        Input Text (Word + POS + Definition + Context)
            -> MiniLM Encoder (384-d pooled embedding)
            -> Main Topic Head (384 -> 11)
            -> Main Conditioning + Subtopic Head (384 [+ 64] -> 45)
            -> Hierarchy Constraint Mask [11 x 45]
    """

    def __init__(
        self,
        config: ModelConfig,
        hierarchy_mask: torch.Tensor,
        encoder: nn.Module | None = None,
    ) -> None:
        super().__init__()
        self.config = config

        if hierarchy_mask.shape != (config.num_main_topics, config.num_subtopics):
            raise ValueError(
                f"Expected hierarchy_mask shape {(config.num_main_topics, config.num_subtopics)}, "
                f"got {tuple(hierarchy_mask.shape)}"
            )
        self.register_buffer("hierarchy_mask", hierarchy_mask.bool())

        if encoder is None:
            encoder, _ = load_encoder_and_tokenizer(config.model_name)
        self.encoder = encoder

        encoder_dim = getattr(getattr(self.encoder, "config", None), "hidden_size", config.embedding_dim)
        if encoder_dim != config.embedding_dim:
            raise ValueError(
                f"Encoder hidden_size ({encoder_dim}) != config.embedding_dim ({config.embedding_dim})."
            )

        self.dropout = nn.Dropout(config.hidden_dropout)
        self.main_head = nn.Linear(config.embedding_dim, config.num_main_topics)

        subtopic_in_dim = config.embedding_dim
        if config.use_main_conditioning:
            self.main_cond_proj = nn.Linear(
                config.num_main_topics, config.main_cond_dim, bias=False
            )
            subtopic_in_dim += config.main_cond_dim
        else:
            self.main_cond_proj = None

        self.subtopic_head = nn.Linear(subtopic_in_dim, config.num_subtopics)

    @classmethod
    def from_config(
        cls,
        config: ModelConfig | None = None,
        taxonomy_path: Path | str = DEFAULT_TAXONOMY_PATH,
        encoder: nn.Module | None = None,
    ) -> HierarchicalVocabClassifier:
        """Build model and hierarchy mask from ModelConfig and taxonomy.json."""
        cfg = config or ModelConfig.from_json()
        taxonomy = load_taxonomy(taxonomy_path)
        if len(taxonomy["label2id"]) != cfg.num_main_topics:
            raise ValueError(
                f"Taxonomy has {len(taxonomy['label2id'])} main topics, config expects {cfg.num_main_topics}"
            )
        if len(taxonomy["subtopic2id"]) != cfg.num_subtopics:
            raise ValueError(
                f"Taxonomy has {len(taxonomy['subtopic2id'])} subtopics, config expects {cfg.num_subtopics}"
            )
        hierarchy_mask = build_hierarchy_mask(taxonomy)
        return cls(cfg, hierarchy_mask=hierarchy_mask, encoder=encoder)

    def encode(
        self,
        input_ids: torch.Tensor,
        attention_mask: torch.Tensor,
    ) -> torch.Tensor:
        """Encode token IDs into pooled sentence embeddings [B, 384]."""
        outputs = self.encoder(input_ids=input_ids, attention_mask=attention_mask)
        return pool_encoder_outputs(
            outputs.last_hidden_state,
            attention_mask,
            pooling=self.config.pooling,
        )

    def forward(
        self,
        input_ids: torch.Tensor,
        attention_mask: torch.Tensor,
        *,
        main_labels: torch.Tensor | None = None,
        subtopic_labels: torch.Tensor | None = None,
        given_main_labels: torch.Tensor | None = None,
        teacher_forcing: bool = False,
    ) -> dict[str, torch.Tensor | None]:
        """Run multi-task forward pass and optional hierarchical loss computation."""
        embeddings = self.encode(input_ids, attention_mask)
        features = self.dropout(embeddings)

        main_logits = self.main_head(features)

        if given_main_labels is not None:
            cond_source = F.one_hot(
                given_main_labels.long(), num_classes=self.config.num_main_topics
            ).float()
            active_main_idx = given_main_labels.long()
        elif teacher_forcing and main_labels is not None:
            cond_source = F.one_hot(
                main_labels.long(), num_classes=self.config.num_main_topics
            ).float()
            active_main_idx = main_labels.long()
        else:
            cond_source = F.softmax(main_logits, dim=-1)
            active_main_idx = main_logits.argmax(dim=-1)

        if self.main_cond_proj is not None:
            main_cond = self.main_cond_proj(cond_source)
            subtopic_features = torch.cat([features, main_cond], dim=-1)
        else:
            subtopic_features = features

        raw_subtopic_logits = self.subtopic_head(subtopic_features)
        masked_subtopic_logits = apply_hierarchy_mask(
            raw_subtopic_logits, active_main_idx, self.hierarchy_mask
        )

        main_loss: torch.Tensor | None = None
        subtopic_loss: torch.Tensor | None = None
        total_loss: torch.Tensor | None = None

        if main_labels is not None:
            main_loss = F.cross_entropy(main_logits, main_labels.long())
            total_loss = self.config.main_loss_weight * main_loss

        if subtopic_labels is not None:
            if self.config.mask_subtopic_loss and main_labels is not None:
                loss_logits = apply_hierarchy_mask(
                    raw_subtopic_logits, main_labels.long(), self.hierarchy_mask
                )
            else:
                loss_logits = raw_subtopic_logits
            subtopic_loss = F.cross_entropy(loss_logits, subtopic_labels.long())
            weighted_sub = self.config.subtopic_loss_weight * subtopic_loss
            total_loss = weighted_sub if total_loss is None else total_loss + weighted_sub

        return {
            "loss": total_loss,
            "main_loss": main_loss,
            "subtopic_loss": subtopic_loss,
            "embeddings": embeddings,
            "main_logits": main_logits,
            "subtopic_logits": raw_subtopic_logits,
            "masked_subtopic_logits": masked_subtopic_logits,
        }

    @torch.no_grad()
    def predict_records(
        self,
        records: list[dict[str, Any]],
        tokenizer: Any,
        taxonomy: dict[str, Any],
        *,
        given_main_topics: list[str] | None = None,
        device: str | torch.device = "cpu",
    ) -> list[dict[str, Any]]:
        """Predict main_topic and constrained child subtopic for vocabulary sense dicts."""
        if not records:
            return []

        was_training = self.training
        self.eval()

        texts = [
            r["text"] if r.get("text") else build_model_text(r)
            for r in records
        ]
        encoded = tokenizer(
            texts,
            padding=True,
            truncation=True,
            max_length=self.config.max_length,
            return_tensors="pt",
        )
        encoded = {k: v.to(device) for k, v in encoded.items()}

        label2id: dict[str, int] = taxonomy["label2id"]
        id2label: dict[int, str] = taxonomy["id2label"]
        name_to_id: dict[str, str] = taxonomy["name_to_id"]
        topic_type_map: dict[str, str] = taxonomy["topic_type_map"]
        id2subtopic: dict[int, str] = taxonomy["id2subtopic"]
        subtopic_id_to_name: dict[str, str] = taxonomy["subtopic_id_to_name"]

        given_tensor: torch.Tensor | None = None
        if given_main_topics is not None:
            given_indices = [label2id[name] for name in given_main_topics]
            given_tensor = torch.tensor(given_indices, dtype=torch.long, device=device)

        outputs = self.forward(
            encoded["input_ids"],
            encoded["attention_mask"],
            given_main_labels=given_tensor,
        )
        main_probs = F.softmax(outputs["main_logits"], dim=-1)
        sub_probs = F.softmax(outputs["masked_subtopic_logits"], dim=-1)

        if given_tensor is not None:
            pred_main_ids = given_tensor
            main_confs = torch.ones(len(records), device=device)
        else:
            main_confs, pred_main_ids = main_probs.max(dim=-1)

        sub_confs, pred_sub_ids = sub_probs.max(dim=-1)

        predictions: list[dict[str, Any]] = []
        for idx in range(len(records)):
            m_idx = int(pred_main_ids[idx].item())
            s_idx = int(pred_sub_ids[idx].item())
            main_name = id2label[m_idx]
            sub_id = id2subtopic[s_idx]
            predictions.append(
                {
                    "main_topic": main_name,
                    "main_topic_id": name_to_id[main_name],
                    "topic_type": topic_type_map[main_name],
                    "main_topic_confidence": round(float(main_confs[idx].item()), 4),
                    "subtopic": subtopic_id_to_name[sub_id],
                    "subtopic_id": sub_id,
                    "subtopic_confidence": round(float(sub_confs[idx].item()), 4),
                }
            )

        if was_training:
            self.train()
        return predictions

    def save_checkpoint(self, output_dir: Path | str) -> Path:
        """Persist model config and weights to `output_dir`."""
        target = Path(output_dir)
        target.mkdir(parents=True, exist_ok=True)
        self.config.to_json(target / "model_config.json")
        torch.save(self.state_dict(), target / "model_state.pt")
        return target

    @classmethod
    def load_checkpoint(
        cls,
        checkpoint_dir: Path | str,
        taxonomy_path: Path | str = DEFAULT_TAXONOMY_PATH,
        map_location: str | torch.device = "cpu",
    ) -> HierarchicalVocabClassifier:
        """Restore HierarchicalVocabClassifier from a saved checkpoint directory."""
        ckpt = Path(checkpoint_dir)
        cfg = ModelConfig.from_json(ckpt / "model_config.json")
        model = cls.from_config(cfg, taxonomy_path=taxonomy_path)
        state = torch.load(ckpt / "model_state.pt", map_location=map_location, weights_only=True)
        model.load_state_dict(state)
        return model
