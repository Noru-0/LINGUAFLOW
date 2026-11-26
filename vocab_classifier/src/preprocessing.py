"""Input validation, normalization, and policy enforcement for inference requests."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from src.data.common import normalize_whitespace
from src.data.extract import normalize_pos
from src.data.preprocess import build_model_text, dedupe_preserve_order
from src.schemas import VocabularySenseRequest


class InputValidationError(ValueError):
    """Raised when an inference payload violates the input validation policy."""


@dataclass(frozen=True)
class InputValidationPolicy:
    """Policy governing required fields and fallbacks for incoming vocabulary senses."""

    allow_missing_definition: bool = False
    fallback_definition_placeholder: str = "Definition not provided; classify from context."


def prepare_sense_record(
    item: VocabularySenseRequest | dict[str, Any],
    *,
    pos_mapping: dict[str, str] | None = None,
    policy: InputValidationPolicy | None = None,
    preprocessing_cfg: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Validate and normalize one vocabulary sense independently of any other sense."""
    req = item if isinstance(item, VocabularySenseRequest) else VocabularySenseRequest.model_validate(item)
    active_policy = policy or InputValidationPolicy()
    cfg = preprocessing_cfg or {}

    word = normalize_whitespace(req.word)
    if not word:
        raise InputValidationError("Empty input: 'word' must be a non-empty string.")

    pos = normalize_pos(req.pos, pos_mapping or {})
    examples = dedupe_preserve_order(req.examples)
    collocations = dedupe_preserve_order(req.collocations)
    definition = normalize_whitespace(req.definition)
    warnings: list[str] = []

    if not definition:
        if not active_policy.allow_missing_definition:
            raise InputValidationError(
                "Missing 'definition': strict input validation policy requires a non-empty definition."
            )
        if not examples and not collocations:
            raise InputValidationError(
                "Missing 'definition' without examples or collocations cannot be classified."
            )
        definition = active_policy.fallback_definition_placeholder
        warnings.append("missing_definition_fallback")

    record: dict[str, Any] = {
        "sense_id": req.sense_id,
        "word": word,
        "pos": pos,
        "definition": definition,
        "examples": examples,
        "collocations": collocations,
        "validation_warnings": warnings,
    }
    record["text"] = build_model_text(
        record,
        include_examples=bool(cfg.get("include_examples", True)),
        include_collocations=bool(cfg.get("include_collocations", True)),
    )
    return record


def prepare_batch_records(
    items: list[VocabularySenseRequest | dict[str, Any]],
    *,
    pos_mapping: dict[str, str] | None = None,
    policy: InputValidationPolicy | None = None,
    preprocessing_cfg: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    """Validate and normalize a batch of senses with strict per-sense isolation."""
    if not items:
        raise InputValidationError("Empty batch: 'items' must contain at least one vocabulary sense.")
    return [
        prepare_sense_record(
            item,
            pos_mapping=pos_mapping,
            policy=policy,
            preprocessing_cfg=preprocessing_cfg,
        )
        for item in items
    ]
