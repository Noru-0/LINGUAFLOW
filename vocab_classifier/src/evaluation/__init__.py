"""Evaluation metrics and error analysis utilities."""

from __future__ import annotations

import importlib
from typing import Any

_EXPORTS: dict[str, tuple[str, str]] = {
    "compute_classification_metrics": ("src.evaluation.metrics", "compute_classification_metrics"),
    "evaluate_hierarchical_predictions": (
        "src.evaluation.metrics",
        "evaluate_hierarchical_predictions",
    ),
    "format_benchmark_markdown": ("src.evaluation.metrics", "format_benchmark_markdown"),
    "analyze_hierarchical_errors": (
        "src.evaluation.error_analysis",
        "analyze_hierarchical_errors",
    ),
    "build_main_confusion_summary": (
        "src.evaluation.error_analysis",
        "build_main_confusion_summary",
    ),
    "format_error_analysis_markdown": (
        "src.evaluation.error_analysis",
        "format_error_analysis_markdown",
    ),
    "run_frozen_minilm_error_analysis": (
        "src.evaluation.error_analysis",
        "run_frozen_minilm_error_analysis",
    ),
}

__all__ = list(_EXPORTS.keys())


def __getattr__(name: str) -> Any:
    if name not in _EXPORTS:
        raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
    module_name, attr_name = _EXPORTS[name]
    module = importlib.import_module(module_name)
    return getattr(module, attr_name)
