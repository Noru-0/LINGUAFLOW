"""High-level production classifier service wrapping final_model/ artifacts."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from src.data.common import load_json
from src.inference.final_predictor import DEFAULT_FINAL_MODEL_DIR, ProductionVocabPredictor
from src.postprocessing import format_prediction_response
from src.preprocessing import InputValidationPolicy, prepare_batch_records, prepare_sense_record
from src.schemas import (
    BatchPredictResponse,
    ModelInfoResponse,
    PredictionResponse,
    VocabularySenseRequest,
)


class ModelArtifactNotFoundError(FileNotFoundError):
    """Raised when required finalized model artifacts are missing or incomplete."""


def verify_model_dir(model_dir: Path | str) -> Path:
    """Ensure required `final_model/` files exist before loading the predictor."""
    root = Path(model_dir)
    if not root.exists():
        raise ModelArtifactNotFoundError(
            f"Model directory '{root}' does not exist. "
            "Restore release artifact with `python -m src.training.release_artifact restore ...` "
            "or run `python -m src.training.finalize_model`."
        )

    required = [
        root / "config" / "preprocessing.json",
        root / "config" / "inference.json",
        root / "config" / "taxonomy.json",
        root / "calibration" / "temperatures.json",
        root / "main_classifier" / "model.joblib",
        root / "subtopic_classifiers" / "index.json",
    ]
    missing = [str(p) for p in required if not p.exists()]
    if missing:
        raise ModelArtifactNotFoundError(
            f"Model artifacts in '{root}' are incomplete. Missing:\n  - "
            + "\n  - ".join(missing)
            + "\nRestore `vocab-classifier-v1.0.0.zip` before starting inference."
        )

    sub_index = load_json(root / "subtopic_classifiers" / "index.json")
    for rel_file in sub_index.get("by_main_label_id", {}).values():
        sub_path = root / "subtopic_classifiers" / rel_file
        if not sub_path.exists():
            raise ModelArtifactNotFoundError(
                f"Missing subtopic classifier artifact: '{sub_path}'. "
                "Restore `vocab-classifier-v1.0.0.zip` or re-run `finalize_model`."
            )
    return root


class VocabClassifierService:
    """Application-facing hierarchical vocabulary classifier service."""

    def __init__(
        self,
        *,
        predictor: ProductionVocabPredictor,
        model_dir: Path,
        model_version: str = "1.0.0",
        validation_policy: InputValidationPolicy | None = None,
    ) -> None:
        self.predictor = predictor
        self.model_dir = Path(model_dir)
        self.model_version = model_version
        self.validation_policy = validation_policy or InputValidationPolicy()

    @classmethod
    def from_dir(
        cls,
        model_dir: Path | str = DEFAULT_FINAL_MODEL_DIR,
        *,
        model_version: str = "1.0.0",
        device: str | None = None,
        validation_policy: InputValidationPolicy | None = None,
    ) -> VocabClassifierService:
        """Validate `model_dir` and instantiate a ready-to-serve classifier."""
        verified = verify_model_dir(model_dir)
        predictor = ProductionVocabPredictor.from_dir(verified, device=device)
        return cls(
            predictor=predictor,
            model_dir=verified,
            model_version=model_version,
            validation_policy=validation_policy,
        )

    def predict_one(
        self,
        item: VocabularySenseRequest | dict[str, Any],
        *,
        main_threshold: float | None = None,
        joint_threshold: float | None = None,
    ) -> PredictionResponse:
        """Validate, encode, predict, and post-process a single vocabulary sense."""
        prepared = prepare_sense_record(
            item,
            pos_mapping=self.predictor.taxonomy.get("pos_mapping", {}),
            policy=self.validation_policy,
            preprocessing_cfg=self.predictor.preprocessing_cfg,
        )
        raw = self.predictor.predict(
            [prepared],
            main_threshold=main_threshold,
            joint_threshold=joint_threshold,
        )[0]
        return format_prediction_response(
            raw,
            prepared_record=prepared,
            taxonomy=self.predictor.taxonomy,
            model_version=self.model_version,
        )

    def predict_batch(
        self,
        items: list[VocabularySenseRequest | dict[str, Any]],
        *,
        main_threshold: float | None = None,
        joint_threshold: float | None = None,
    ) -> BatchPredictResponse:
        """Classify multiple senses independently in one batched MiniLM forward pass."""
        prepared = prepare_batch_records(
            items,
            pos_mapping=self.predictor.taxonomy.get("pos_mapping", {}),
            policy=self.validation_policy,
            preprocessing_cfg=self.predictor.preprocessing_cfg,
        )
        raw_preds = self.predictor.predict(
            prepared,
            main_threshold=main_threshold,
            joint_threshold=joint_threshold,
        )
        formatted = [
            format_prediction_response(
                raw,
                prepared_record=rec,
                taxonomy=self.predictor.taxonomy,
                model_version=self.model_version,
            )
            for rec, raw in zip(prepared, raw_preds)
        ]
        accepted = sum(1 for p in formatted if p.status == "accepted")
        return BatchPredictResponse(
            count=len(formatted),
            accepted_count=accepted,
            needs_review_count=len(formatted) - accepted,
            model_version=self.model_version,
            predictions=formatted,
        )

    def get_model_info(self) -> ModelInfoResponse:
        """Return model lineage, calibration, threshold, and taxonomy summary metadata."""
        pre_cfg = self.predictor.preprocessing_cfg
        data_int = pre_cfg.get("data_integrity", {})
        tax = self.predictor.taxonomy
        return ModelInfoResponse(
            model_version=self.model_version,
            dataset_version=str(data_int.get("dataset_version", "1.2.0")),
            taxonomy_version=str(data_int.get("taxonomy_version", "1.1.0")),
            encoder=dict(pre_cfg.get("encoder", {})),
            classifier=dict(pre_cfg.get("training_hyperparameters", {})),
            calibration=dict(self.predictor.temperatures),
            inference=dict(self.predictor.inference_cfg),
            taxonomy_summary={
                "main_topics_count": len(tax.get("label2id", {})),
                "subtopics_count": len(tax.get("subtopic2id", {})),
                "main_topics": [
                    {
                        "id": t["id"],
                        "name_en": t["name_en"],
                        "topic_type": t.get("topic_type", "topical"),
                        "subtopics": [
                            {"id": s["id"], "name_en": s["name_en"]}
                            for s in t.get("subtopics", [])
                        ],
                    }
                    for t in tax.get("main_topics", [])
                ],
            },
        )
