"""Data extraction, preprocessing, subtopic labeling, and splitting utilities."""

from __future__ import annotations

import importlib
from typing import Any

_EXPORTS: dict[str, tuple[str, str]] = {
    "extract_dataset": ("src.data.extract", "extract_dataset"),
    "extract_word_senses": ("src.data.extract", "extract_word_senses"),
    "preprocess_dataset": ("src.data.preprocess", "preprocess_dataset"),
    "preprocess_records": ("src.data.preprocess", "preprocess_records"),
    "group_stratified_split": ("src.data.split", "group_stratified_split"),
    "split_dataset": ("src.data.split", "split_dataset"),
    "generate_subtopic_candidates": ("src.data.subtopic_labeling", "generate_subtopic_candidates"),
    "propose_subtopic_candidates": ("src.data.subtopic_labeling", "propose_subtopic_candidates"),
    "select_top1_subtopics": ("src.data.subtopic_labeling", "select_top1_subtopics"),
}

__all__ = list(_EXPORTS.keys())


def __getattr__(name: str) -> Any:
    if name not in _EXPORTS:
        raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
    module_name, attr_name = _EXPORTS[name]
    module = importlib.import_module(module_name)
    return getattr(module, attr_name)
