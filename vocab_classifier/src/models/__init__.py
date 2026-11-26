"""Model definitions for multi-task hierarchical vocabulary classification."""

from __future__ import annotations

import importlib
from typing import Any

_EXPORTS: dict[str, tuple[str, str]] = {
    "HierarchicalVocabClassifier": (
        "src.models.hierarchical_classifier",
        "HierarchicalVocabClassifier",
    ),
    "ModelConfig": ("src.models.hierarchical_classifier", "ModelConfig"),
    "apply_hierarchy_mask": ("src.models.hierarchical_classifier", "apply_hierarchy_mask"),
    "build_hierarchy_mask": ("src.models.hierarchical_classifier", "build_hierarchy_mask"),
    "load_encoder_and_tokenizer": (
        "src.models.hierarchical_classifier",
        "load_encoder_and_tokenizer",
    ),
    "HierarchicalLinearBaseline": ("src.models.baselines", "HierarchicalLinearBaseline"),
}

__all__ = list(_EXPORTS.keys())


def __getattr__(name: str) -> Any:
    if name not in _EXPORTS:
        raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
    module_name, attr_name = _EXPORTS[name]
    module = importlib.import_module(module_name)
    return getattr(module, attr_name)
