"""Dependency providers and lifecycle state for the vocab_classifier API."""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

from src.inference.final_predictor import DEFAULT_FINAL_MODEL_DIR
from src.predictor import VocabClassifierService
from src.preprocessing import InputValidationPolicy

DEFAULT_MODEL_VERSION = os.environ.get("VOCAB_CLASSIFIER_VERSION", "1.0.0")


@dataclass
class ServiceState:
    """Holds the loaded classifier singleton and any initialization failure details."""

    model_dir: Path = field(
        default_factory=lambda: Path(os.environ.get("VOCAB_CLASSIFIER_MODEL_DIR", str(DEFAULT_FINAL_MODEL_DIR)))
    )
    model_version: str = DEFAULT_MODEL_VERSION
    allow_missing_definition: bool = field(
        default_factory=lambda: os.environ.get("VOCAB_CLASSIFIER_ALLOW_MISSING_DEFINITION", "false").lower() == "true"
    )
    service: VocabClassifierService | None = None
    load_error: str | None = None

    def get_or_load(self) -> VocabClassifierService | None:
        if self.service is not None:
            return self.service
        try:
            self.service = VocabClassifierService.from_dir(
                self.model_dir,
                model_version=self.model_version,
                validation_policy=InputValidationPolicy(
                    allow_missing_definition=self.allow_missing_definition
                ),
            )
            self.load_error = None
        except Exception as exc:
            self.load_error = f"{type(exc).__name__}: {exc}"
            self.service = None
        return self.service
