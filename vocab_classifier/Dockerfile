FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    VOCAB_CLASSIFIER_VERSION=1.0.0 \
    VOCAB_CLASSIFIER_REVIEW_DB=/tmp/review_workflow.db \
    VOCAB_CLASSIFIER_ALLOW_MISSING_DEFINITION=false

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY api/ ./api/
COPY src/ ./src/
COPY data/taxonomy/ ./data/taxonomy/
COPY releases/vocab-classifier-v1.0.0.manifest.json ./releases/vocab-classifier-v1.0.0.manifest.json
COPY releases/vocab-classifier-v1.0.0.zip.sha256 ./releases/vocab-classifier-v1.0.0.zip.sha256

# Restore and SHA-256 verify immutable final_model/ binaries into the container image
RUN python -m src.training.release_artifact restore \
    https://github.com/Noru-0/LINGUAFLOW/releases/download/vocab-classifier-v1.0.0/vocab-classifier-v1.0.0.zip \
    --manifest releases/vocab-classifier-v1.0.0.manifest.json \
    --overwrite

EXPOSE 8080
CMD ["sh", "-c", "uvicorn api.app:create_app --factory --host 0.0.0.0 --port ${PORT:-8080}"]
