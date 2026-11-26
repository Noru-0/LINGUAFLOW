"""FastAPI application factory for the vocab_classifier inference microservice."""

from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.dependencies import DEFAULT_MODEL_VERSION, ServiceState
from api.routes import create_classifier_router
from src.inference.final_predictor import DEFAULT_FINAL_MODEL_DIR
from src.review_store import DEFAULT_REVIEW_DB_PATH


def create_app(
    *,
    model_dir: Path | str = DEFAULT_FINAL_MODEL_DIR,
    model_version: str = DEFAULT_MODEL_VERSION,
    review_db_path: Path | str = DEFAULT_REVIEW_DB_PATH,
    allow_missing_definition: bool = False,
    preload: bool = True,
) -> FastAPI:
    """Create configured FastAPI app; if model is missing, health reports degraded cleanly."""
    app = FastAPI(
        title="LinguaFlow Vocab Classifier API",
        version=model_version,
        description="Hierarchical vocabulary sense classifier (Frozen MiniLM + Calibrated LogReg).",
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    state = ServiceState(
        model_dir=Path(model_dir),
        model_version=model_version,
        review_db_path=Path(review_db_path),
        allow_missing_definition=allow_missing_definition,
    )
    if preload:
        state.get_or_load()
    app.state.classifier_state = state

    app.include_router(create_classifier_router())
    return app


app = create_app(preload=False)
