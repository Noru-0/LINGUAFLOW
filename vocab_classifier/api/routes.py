"""HTTP API routes for single/batch classification, health, and model metadata."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request

from src.preprocessing import InputValidationError
from src.schemas import (
    BatchPredictRequest,
    BatchPredictResponse,
    HealthResponse,
    ModelInfoResponse,
    PredictionResponse,
    VocabularySenseRequest,
)


def create_classifier_router() -> APIRouter:
    """Create APIRouter exposing `/predict`, `/predict/batch`, `/health`, and `/model-info`."""
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

    return router
