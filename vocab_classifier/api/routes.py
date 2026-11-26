"""HTTP API routes for inference, health, model metadata, and human review workflow."""

from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, HTTPException, Query, Request

from src.preprocessing import InputValidationError, prepare_batch_records
from src.schemas import (
    BatchPredictRequest,
    BatchPredictResponse,
    HealthResponse,
    ModelInfoResponse,
    PredictionResponse,
    ReviewHistoryEntry,
    ReviewImportRequest,
    ReviewImportResponse,
    ReviewQueueItem,
    ReviewVerifyRequest,
    VocabularySenseRequest,
)


def create_classifier_router() -> APIRouter:
    """Create APIRouter exposing inference and human-review workflow endpoints."""
    router = APIRouter()

    def _require_service(request: Request):
        state = request.app.state.classifier_state
        service = state.get_or_load()
        if service is None:
            raise HTTPException(
                status_code=503,
                detail={
                    "message": "Vocab classifier model artifact is unavailable.",
                    "model_dir": str(state.model_dir),
                    "error": state.load_error,
                },
            )
        return service

    @router.get("/health", response_model=HealthResponse)
    def health(request: Request) -> HealthResponse:
        state = request.app.state.classifier_state
        service = state.get_or_load()
        if service is None:
            return HealthResponse(
                status="degraded",
                model_loaded=False,
                model_version=None,
                model_dir=str(state.model_dir),
                error=state.load_error,
            )
        return HealthResponse(
            status="ok",
            model_loaded=True,
            model_version=service.model_version,
            model_dir=str(service.model_dir),
            error=None,
        )

    @router.get("/model-info", response_model=ModelInfoResponse)
    def model_info(request: Request) -> ModelInfoResponse:
        service = _require_service(request)
        return service.get_model_info()

    @router.post("/predict", response_model=PredictionResponse)
    def predict(payload: VocabularySenseRequest, request: Request) -> PredictionResponse:
        service = _require_service(request)
        try:
            return service.predict_one(payload)
        except InputValidationError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc

    @router.post("/predict/batch", response_model=BatchPredictResponse)
    def predict_batch(payload: BatchPredictRequest, request: Request) -> BatchPredictResponse:
        service = _require_service(request)
        try:
            return service.predict_batch(payload.items)
        except InputValidationError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc

    @router.post("/review/import", response_model=ReviewImportResponse)
    def review_import(payload: ReviewImportRequest, request: Request) -> ReviewImportResponse:
        service = _require_service(request)
        store = request.app.state.classifier_state.get_review_store()
        try:
            prepared = prepare_batch_records(
                payload.items,
                pos_mapping=service.predictor.taxonomy.get("pos_mapping", {}),
                policy=service.validation_policy,
                preprocessing_cfg=service.predictor.preprocessing_cfg,
            )
            batch_res = service.predict_batch(payload.items)
        except InputValidationError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc

        stored = store.import_batch(prepared, batch_res.predictions)
        return ReviewImportResponse(
            imported_count=len(stored),
            accepted_count=batch_res.accepted_count,
            needs_review_count=batch_res.needs_review_count,
            model_version=batch_res.model_version,
            items=stored,
        )

    @router.get("/review/queue", response_model=list[ReviewQueueItem])
    def review_queue(
        request: Request,
        status: Literal["needs_review", "accepted", "all"] = Query("needs_review"),
        only_unverified: bool = Query(True),
        limit: int = Query(100, ge=1, le=1000),
    ) -> list[ReviewQueueItem]:
        store = request.app.state.classifier_state.get_review_store()
        return store.list_queue(status=status, only_unverified=only_unverified, limit=limit)

    @router.post("/review/{record_id}/verify", response_model=ReviewQueueItem)
    def review_verify(
        record_id: str,
        payload: ReviewVerifyRequest,
        request: Request,
    ) -> ReviewQueueItem:
        service = _require_service(request)
        store = request.app.state.classifier_state.get_review_store()
        try:
            return store.verify_record(
                record_id,
                verified_subtopic_id=payload.verified_subtopic_id,
                verified_main_topic_id=payload.verified_main_topic_id,
                taxonomy=service.predictor.taxonomy,
                reviewer=payload.reviewer,
                notes=payload.notes,
            )
        except KeyError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc

    @router.get("/review/{record_id}/history", response_model=list[ReviewHistoryEntry])
    def review_history(record_id: str, request: Request) -> list[ReviewHistoryEntry]:
        store = request.app.state.classifier_state.get_review_store()
        return store.get_history(record_id)

    @router.get("/review/export", response_model=list[ReviewQueueItem])
    def review_export(
        request: Request,
        include_unverified_accepted: bool = Query(True),
    ) -> list[ReviewQueueItem]:
        store = request.app.state.classifier_state.get_review_store()
        return store.export_records(include_unverified_accepted=include_unverified_accepted)

    return router
