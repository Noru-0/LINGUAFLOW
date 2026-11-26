"""Hierarchical Top-K inference, temperature calibration, and abstention."""

from __future__ import annotations

import importlib
from typing import Any

_EXPORTS: dict[str, tuple[str, str]] = {
    "CalibrationParams": ("src.inference.hierarchical_inference", "CalibrationParams"),
    "HierarchicalPredictor": ("src.inference.hierarchical_inference", "HierarchicalPredictor"),
    "evaluate_topk_and_abstention": (
        "src.inference.hierarchical_inference",
        "evaluate_topk_and_abstention",
    ),
    "fit_temperature_scaling": (
        "src.inference.hierarchical_inference",
        "fit_temperature_scaling",
    ),
    "ProductionVocabPredictor": (
        "src.inference.final_predictor",
        "ProductionVocabPredictor",
    ),
}

__all__ = list(_EXPORTS.keys())


def __getattr__(name: str) -> Any:
    if name not in _EXPORTS:
        raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
    module_name, attr_name = _EXPORTS[name]
    module = importlib.import_module(module_name)
    return getattr(module, attr_name)
