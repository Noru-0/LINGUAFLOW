"""Pydantic schemas for vocab_classifier inference, batch classification, and human review."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class TopicScore(BaseModel):
    """Predicted main topic or subtopic with calibrated confidence."""

    id: str
    name: str
    confidence: float = Field(ge=0.0, le=1.0)


class PredictionPair(BaseModel):
    """Top-1 hierarchical Main Topic + Subtopic prediction."""

    main_topic: TopicScore
    subtopic: TopicScore


class MainCandidateItem(BaseModel):
    rank: int
    main_topic: str
    main_topic_id: str
    main_label_id: int
    probability: float


class SubtopicCandidateItem(BaseModel):
    rank: int
    subtopic: str
    subtopic_id: str
    subtopic_label_id: int
    probability: float


class ExpandedCandidateItem(BaseModel):
    rank: int
    main_topic: str
    main_topic_id: str
    main_label_id: int
    subtopic: str
    subtopic_id: str
    subtopic_label_id: int
    main_prob: float
    sub_prob_given_main: float
    joint_prob: float


class ReviewRecordPayload(BaseModel):
    """Non-destructive classification provenance for application persistence."""

    predicted_main_topic: str
    predicted_subtopic: str
    human_verified: bool = False
    verified_main_topic: str | None = None
    verified_subtopic: str | None = None
    prediction_status: Literal["accepted", "needs_review"]
    model_version: str


class VocabularySenseRequest(BaseModel):
    """Input vocabulary sense payload."""

    model_config = ConfigDict(extra="ignore")

    sense_id: str | None = None
    word: str
    pos: str | None = "unknown"
    definition: str | None = None
    examples: list[str] = Field(default_factory=list)
    collocations: list[str] = Field(default_factory=list)


class BatchPredictRequest(BaseModel):
    """Batch prediction payload containing one or more vocabulary senses."""

    items: list[VocabularySenseRequest] = Field(min_length=1)


class PredictionResponse(BaseModel):
    """Structured hierarchical classification response aligned with ProductionVocabPredictor."""

    sense_id: str | None = None
    word: str
    pos: str
    prediction: PredictionPair
    topic_type: Literal["topical", "general"]
    joint_confidence: float = Field(ge=0.0, le=1.0)
    status: Literal["accepted", "needs_review"]
    abstained: bool
    abstention_reasons: list[str] = Field(default_factory=list)
    top_k_main_candidates: list[MainCandidateItem] = Field(default_factory=list)
    top_k_subtopic_candidates: list[SubtopicCandidateItem] = Field(default_factory=list)
    top_k_expanded_candidates: list[ExpandedCandidateItem] = Field(default_factory=list)
    review_record: ReviewRecordPayload
    validation_warnings: list[str] = Field(default_factory=list)
    model_version: str


class BatchPredictResponse(BaseModel):
    """Aggregated response for batch vocabulary classification."""

    count: int
    accepted_count: int
    needs_review_count: int
    model_version: str
    predictions: list[PredictionResponse]


class HealthResponse(BaseModel):
    """Service readiness & loaded artifact status."""

    status: Literal["ok", "degraded"]
    model_loaded: bool
    model_version: str | None = None
    model_dir: str
    error: str | None = None


class ModelInfoResponse(BaseModel):
    """Model lineage, taxonomy, calibration, and production threshold metadata."""

    model_version: str
    dataset_version: str
    taxonomy_version: str
    encoder: dict
    classifier: dict
    calibration: dict
    inference: dict
    taxonomy_summary: dict


class ReviewImportRequest(BaseModel):
    """Import vocabulary senses through the classifier into the human-review queue."""

    items: list[VocabularySenseRequest] = Field(min_length=1)


class ReviewImportResponse(BaseModel):
    """Summary returned after importing classified senses into the review workflow."""

    imported_count: int
    accepted_count: int
    needs_review_count: int
    model_version: str
    items: list[ReviewQueueItem]


class ReviewVerifyRequest(BaseModel):
    """Human confirmation or correction of a predicted topic/subtopic pair."""

    verified_subtopic_id: str
    verified_main_topic_id: str | None = None
    reviewer: str = "human_reviewer"
    notes: str | None = None


class ReviewHistoryEntry(BaseModel):
    id: str
    record_id: str
    action: Literal["auto_classified", "human_verified", "human_corrected"]
    previous_subtopic: str | None = None
    new_subtopic: str
    actor: str
    notes: str | None = None
    created_at: str


class ReviewQueueItem(BaseModel):
    """Persisted vocabulary sense classification record with separate predicted vs verified fields."""

    record_id: str
    sense_id: str | None = None
    word: str
    pos: str
    definition: str
    predicted_main_topic: str
    predicted_subtopic: str
    predicted_joint_confidence: float
    prediction_status: Literal["accepted", "needs_review"]
    human_verified: bool
    verified_main_topic: str | None = None
    verified_subtopic: str | None = None
    active_main_topic: str
    active_subtopic: str
    model_version: str
    created_at: str
    updated_at: str
