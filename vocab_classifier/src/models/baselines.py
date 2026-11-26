"""Baseline models for hierarchical vocabulary classification:
1. TF-IDF + Logistic Regression
2. TF-IDF + Linear SVM
3. Frozen MiniLM + Logistic Regression
"""

from __future__ import annotations

from collections import Counter, defaultdict
from functools import partial
from typing import Any, Callable

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC


class _ConstantLabelModel:
    """Fallback classifier when a parent main_topic has only a single child subtopic in train."""

    def __init__(self, label: int) -> None:
        self.label = int(label)
        self.classes_ = np.array([self.label])

    def predict(self, X: Any) -> np.ndarray:
        return np.full(X.shape[0], self.label, dtype=int)


class HierarchicalLinearBaseline:
    """Two-stage hierarchical baseline using linear classifiers (LogReg or LinearSVC).

    Task 1 (`main_clf`): predicts one of 11 Main Topics.
    Task 2 (`sub_clfs[main_id]`): predicts a child Subtopic constrained to `main_id`.
    """

    def __init__(self, estimator_factory: Callable[[], Any]) -> None:
        self.estimator_factory = estimator_factory
        self.main_clf: Any = None
        self.sub_clfs: dict[int, Any] = {}

    def fit(
        self,
        X: Any,
        y_main: list[int] | np.ndarray,
        y_sub: list[int] | np.ndarray,
    ) -> HierarchicalLinearBaseline:
        """Fit Task 1 main-topic classifier and per-topic Task 2 subtopic classifiers."""
        y_main_arr = np.asarray(y_main, dtype=int)
        y_sub_arr = np.asarray(y_sub, dtype=int)

        self.main_clf = self.estimator_factory()
        self.main_clf.fit(X, y_main_arr)

        indices_by_main: dict[int, list[int]] = defaultdict(list)
        for idx, main_id in enumerate(y_main_arr.tolist()):
            indices_by_main[main_id].append(idx)

        self.sub_clfs = {}
        for main_id, row_indices in sorted(indices_by_main.items()):
            sub_targets = y_sub_arr[row_indices]
            unique_subs = np.unique(sub_targets)
            if len(unique_subs) == 1:
                self.sub_clfs[main_id] = _ConstantLabelModel(int(unique_subs[0]))
            else:
                clf = self.estimator_factory()
                clf.fit(X[row_indices], sub_targets)
                self.sub_clfs[main_id] = clf
        return self

    def predict_main(self, X: Any) -> list[int]:
        """Predict Main Topic IDs for feature matrix X."""
        return [int(v) for v in self.main_clf.predict(X).tolist()]

    def predict_subtopics_given_main(
        self,
        X: Any,
        main_ids: list[int],
    ) -> list[int]:
        """Predict child Subtopic IDs conditioned on `main_ids`."""
        preds = [0] * len(main_ids)
        rows_by_main: dict[int, list[int]] = defaultdict(list)
        for idx, main_id in enumerate(main_ids):
            rows_by_main[int(main_id)].append(idx)

        for main_id, row_indices in rows_by_main.items():
            clf = self.sub_clfs[main_id]
            sub_preds = clf.predict(X[row_indices]).tolist()
            for row_idx, pred in zip(row_indices, sub_preds):
                preds[row_idx] = int(pred)
        return preds

    def predict(
        self,
        X: Any,
        *,
        given_main_ids: list[int] | None = None,
    ) -> tuple[list[int], list[int]]:
        """Predict (main_ids, subtopic_ids) hierarchically."""
        main_ids = list(given_main_ids) if given_main_ids is not None else self.predict_main(X)
        sub_ids = self.predict_subtopics_given_main(X, main_ids)
        return main_ids, sub_ids


def build_tfidf_vectorizer(tfidf_cfg: dict[str, Any]) -> TfidfVectorizer:
    """Create TF-IDF vectorizer from baseline config."""
    ngram = tuple(tfidf_cfg.get("ngram_range", (1, 2)))
    return TfidfVectorizer(
        ngram_range=ngram,
        max_features=tfidf_cfg.get("max_features", 30000),
        min_df=tfidf_cfg.get("min_df", 2),
        sublinear_tf=tfidf_cfg.get("sublinear_tf", True),
    )


def compute_power_class_weights(
    y: list[int] | np.ndarray,
    alpha: float = 0.5,
) -> dict[int, float]:
    """Compute power-smoothed inverse-frequency class weights: w_c ~ (N / n_c)^alpha."""
    counts = Counter(int(v) for v in y)
    if not counts:
        return {}
    total = sum(counts.values())
    num_classes = len(counts)
    raw = {c: (total / (num_classes * n)) ** alpha for c, n in counts.items()}
    mean_w = sum(raw.values()) / len(raw)
    return {c: round(w / mean_w, 6) for c, w in raw.items()}


def make_logreg_factory(params: dict[str, Any], seed: int = 42) -> Callable[[], LogisticRegression]:
    """Create a picklable LogisticRegression factory for linear baselines."""
    return partial(
        LogisticRegression,
        C=float(params.get("C", 1.0)),
        max_iter=int(params.get("max_iter", 1000)),
        class_weight=params.get("class_weight"),
        random_state=seed,
    )


def make_svm_factory(params: dict[str, Any], seed: int = 42) -> Callable[[], LinearSVC]:
    """Create a picklable LinearSVC factory for linear SVM baseline."""
    return partial(
        LinearSVC,
        C=float(params.get("C", 1.0)),
        max_iter=int(params.get("max_iter", 2000)),
        class_weight=params.get("class_weight"),
        random_state=seed,
    )


def encode_frozen_minilm(
    texts: list[str],
    *,
    model_name: str = "sentence-transformers/all-MiniLM-L6-v2",
    max_length: int = 192,
    batch_size: int = 64,
    pooling: str = "mean",
    normalize: bool = True,
    device: str | None = None,
    encoder: Any | None = None,
    tokenizer: Any | None = None,
) -> np.ndarray:
    """Extract frozen 384-d MiniLM embeddings as a NumPy array [N, 384]."""
    import torch
    from src.models.hierarchical_classifier import load_encoder_and_tokenizer, pool_encoder_outputs

    resolved_device = device or ("cuda" if torch.cuda.is_available() else "cpu")
    if encoder is None or tokenizer is None:
        encoder, tokenizer = load_encoder_and_tokenizer(model_name)
    encoder.to(resolved_device)
    encoder.eval()

    chunks: list[np.ndarray] = []
    with torch.no_grad():
        for start in range(0, len(texts), batch_size):
            batch = texts[start : start + batch_size]
            encoded = tokenizer(
                batch,
                padding=True,
                truncation=True,
                max_length=max_length,
                return_tensors="pt",
            )
            encoded = {k: v.to(resolved_device) for k, v in encoded.items()}
            outputs = encoder(
                input_ids=encoded["input_ids"],
                attention_mask=encoded["attention_mask"],
            )
            pooled = pool_encoder_outputs(
                outputs.last_hidden_state,
                encoded["attention_mask"],
                pooling=pooling,
            )
            if normalize:
                pooled = torch.nn.functional.normalize(pooled, p=2, dim=1)
            chunks.append(pooled.cpu().numpy())

    return np.vstack(chunks) if chunks else np.empty((0, 384), dtype=np.float32)
