"""Zero-shot Top-3 subtopic candidate generation for processed vocabulary senses."""

from __future__ import annotations

import argparse
import math
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Protocol

from src.data.common import (
    DEFAULT_FINAL_LABELED_PATH,
    DEFAULT_LABELED_PATH,
    DEFAULT_SUBTOPIC_CANDIDATES_PATH,
    DEFAULT_TAXONOMY_PATH,
    PROCESSED_DIR,
    load_records,
    load_taxonomy,
    normalize_whitespace,
    save_json,
    save_jsonl,
)

DEFAULT_SUBTOPIC_STATS_PATH = PROCESSED_DIR / "subtopic_candidates_stats.json"
DEFAULT_EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
DEFAULT_NLI_MODEL = "facebook/bart-large-mnli"

_TOKEN_RE = re.compile(r"[a-z0-9]+")


class ZeroShotSubtopicScorer(Protocol):
    """Protocol for zero-shot subtopic scoring backends."""

    backend_name: str
    model_name: str

    def score_batch(
        self,
        texts: list[str],
        candidates: list[dict[str, str]],
    ) -> list[list[float]]:
        """Return probability scores aligned with `candidates` for each input text."""


def _softmax(logits: list[float], temperature: float = 1.0) -> list[float]:
    """Compute numerically stable softmax probabilities."""
    if not logits:
        return []
    scaled = [x / max(temperature, 1e-6) for x in logits]
    max_val = max(scaled)
    exps = [math.exp(x - max_val) for x in scaled]
    total = sum(exps)
    return [e / total for e in exps]


def _build_candidate_prompt(subtopic: dict[str, Any]) -> str:
    """Build descriptive zero-shot label text for a taxonomy subtopic."""
    name_en = normalize_whitespace(subtopic.get("name_en"))
    description = normalize_whitespace(subtopic.get("description"))
    if description:
        return f"{name_en}: {description}"
    return name_en


def build_subtopic_catalog(
    taxonomy: dict[str, Any],
) -> tuple[dict[str, list[dict[str, str]]], list[dict[str, str]]]:
    """Extract candidate subtopic lists grouped by main_topic and as a flat catalog."""
    by_main_topic: dict[str, list[dict[str, str]]] = {}
    all_subtopics: list[dict[str, str]] = []

    for topic in taxonomy["main_topics"]:
        main_name = topic["name_en"]
        entries: list[dict[str, str]] = []
        for sub in topic.get("subtopics", []):
            entry = {
                "subtopic_id": sub["id"],
                "name_en": sub["name_en"],
                "name_vi": sub.get("name_vi", ""),
                "main_topic": main_name,
                "candidate_text": _build_candidate_prompt(sub),
            }
            entries.append(entry)
            all_subtopics.append(entry)
        by_main_topic[main_name] = entries

    return by_main_topic, all_subtopics


def _import_transformers_nlp() -> tuple[Any, Any, Any, Any]:
    """Import torch and HuggingFace NLP classes safely even if torchvision has a mismatch."""
    import torch
    import transformers.utils.import_utils as import_utils

    # NLP zero-shot models do not need torchvision; disable broken vision backends if present.
    if getattr(import_utils, "_torchvision_available", False):
        try:
            import torchvision  # noqa: F401
        except Exception:
            import_utils._torchvision_available = False

    from transformers import AutoModel, AutoTokenizer, pipeline

    return torch, AutoTokenizer, AutoModel, pipeline


class EmbeddingZeroShotScorer:
    """Zero-shot scorer using bi-encoder cosine similarity + calibrated softmax."""

    backend_name = "embedding"

    def __init__(
        self,
        model_name: str = DEFAULT_EMBEDDING_MODEL,
        *,
        batch_size: int = 64,
        temperature: float = 0.1,
        device: str | None = None,
    ) -> None:
        torch, AutoTokenizer, AutoModel, _ = _import_transformers_nlp()
        self._torch = torch
        self.model_name = model_name
        self.batch_size = batch_size
        self.temperature = temperature
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")

        try:
            self._tokenizer = AutoTokenizer.from_pretrained(model_name, local_files_only=True)
            self._model = AutoModel.from_pretrained(model_name, local_files_only=True)
        except OSError:
            self._tokenizer = AutoTokenizer.from_pretrained(model_name)
            self._model = AutoModel.from_pretrained(model_name)

        self._model.to(self.device)
        self._model.eval()
        self._candidate_cache: dict[str, Any] = {}

    def _encode_texts(self, texts: list[str]) -> Any:
        """Encode strings into L2-normalized dense embeddings via mean pooling."""
        torch = self._torch
        chunks: list[Any] = []
        with torch.no_grad():
            for start in range(0, len(texts), self.batch_size):
                batch = texts[start : start + self.batch_size]
                encoded = self._tokenizer(
                    batch,
                    padding=True,
                    truncation=True,
                    max_length=256,
                    return_tensors="pt",
                )
                encoded = {k: v.to(self.device) for k, v in encoded.items()}
                outputs = self._model(**encoded)
                mask = encoded["attention_mask"].unsqueeze(-1).expand(outputs.last_hidden_state.size()).float()
                pooled = (outputs.last_hidden_state * mask).sum(dim=1) / mask.sum(dim=1).clamp(min=1e-9)
                normalized = torch.nn.functional.normalize(pooled, p=2, dim=1)
                chunks.append(normalized.cpu())
        return torch.cat(chunks, dim=0) if chunks else torch.empty((0, 0))

    def _get_candidate_matrix(self, candidates: list[dict[str, str]]) -> Any:
        """Encode and cache candidate subtopic embeddings."""
        missing = [c["candidate_text"] for c in candidates if c["candidate_text"] not in self._candidate_cache]
        if missing:
            embeddings = self._encode_texts(missing)
            for text, vec in zip(missing, embeddings):
                self._candidate_cache[text] = vec
        return self._torch.stack([self._candidate_cache[c["candidate_text"]] for c in candidates])

    def score_batch(
        self,
        texts: list[str],
        candidates: list[dict[str, str]],
    ) -> list[list[float]]:
        if not texts or not candidates:
            return []
        text_vecs = self._encode_texts(texts)
        cand_matrix = self._get_candidate_matrix(candidates)
        sims = (text_vecs @ cand_matrix.T).tolist()
        return [_softmax(row, temperature=self.temperature) for row in sims]


class NLIZeroShotScorer:
    """Zero-shot scorer using a HuggingFace NLI sequence classification pipeline."""

    backend_name = "nli"

    def __init__(
        self,
        model_name: str = DEFAULT_NLI_MODEL,
        *,
        batch_size: int = 16,
        device: int | str | None = None,
    ) -> None:
        torch, _, _, pipeline = _import_transformers_nlp()
        self.model_name = model_name
        self.batch_size = batch_size
        resolved_device = device if device is not None else (0 if torch.cuda.is_available() else -1)
        self._pipe = pipeline(
            "zero-shot-classification",
            model=model_name,
            device=resolved_device,
        )

    def score_batch(
        self,
        texts: list[str],
        candidates: list[dict[str, str]],
    ) -> list[list[float]]:
        if not texts or not candidates:
            return []
        candidate_labels = [c["candidate_text"] for c in candidates]
        outputs = self._pipe(
            texts,
            candidate_labels=candidate_labels,
            hypothesis_template="This English vocabulary sense belongs to the topic: {}.",
            multi_label=False,
            batch_size=self.batch_size,
        )
        if isinstance(outputs, dict):
            outputs = [outputs]

        scores_matrix: list[list[float]] = []
        for out in outputs:
            score_map = dict(zip(out["labels"], out["scores"]))
            scores_matrix.append([float(score_map[label]) for label in candidate_labels])
        return scores_matrix


class LexicalZeroShotScorer:
    """Zero-dependency TF-weighted token + character trigram zero-shot fallback scorer."""

    backend_name = "lexical"

    def __init__(self, model_name: str = "tfidf-char3-cosine", *, temperature: float = 0.2) -> None:
        self.model_name = model_name
        self.temperature = temperature

    @staticmethod
    def _featurize(text: str) -> Counter[str]:
        lowered = normalize_whitespace(text).lower()
        tokens = _TOKEN_RE.findall(lowered)
        feats: Counter[str] = Counter()
        for tok in tokens:
            feats[f"w:{tok}"] += 1.0
            if len(tok) >= 4:
                feats[f"p:{tok[:4]}"] += 0.5
        padded = f" {lowered} "
        for idx in range(max(0, len(padded) - 2)):
            tri = padded[idx : idx + 3]
            if tri.strip():
                feats[f"c:{tri}"] += 0.25
        norm = math.sqrt(sum(v * v for v in feats.values())) or 1.0
        for key in feats:
            feats[key] /= norm
        return feats

    def score_batch(
        self,
        texts: list[str],
        candidates: list[dict[str, str]],
    ) -> list[list[float]]:
        if not texts or not candidates:
            return []
        cand_vecs = [self._featurize(c["candidate_text"]) for c in candidates]
        results: list[list[float]] = []
        for text in texts:
            t_vec = self._featurize(text)
            sims = [
                sum(val * c_vec.get(key, 0.0) for key, val in t_vec.items())
                for c_vec in cand_vecs
            ]
            results.append(_softmax(sims, temperature=self.temperature))
        return results


def create_zero_shot_scorer(
    backend: str = "auto",
    model_name: str | None = None,
    *,
    batch_size: int = 64,
    temperature: float = 0.1,
) -> ZeroShotSubtopicScorer:
    """Instantiate the requested zero-shot scorer backend."""
    selected = backend.lower()
    if selected == "auto":
        try:
            _import_transformers_nlp()
            selected = "embedding"
        except Exception:
            selected = "lexical"

    if selected == "embedding":
        return EmbeddingZeroShotScorer(
            model_name=model_name or DEFAULT_EMBEDDING_MODEL,
            batch_size=batch_size,
            temperature=temperature,
        )
    if selected == "nli":
        return NLIZeroShotScorer(
            model_name=model_name or DEFAULT_NLI_MODEL,
            batch_size=min(batch_size, 16),
        )
    if selected == "lexical":
        return LexicalZeroShotScorer(
            model_name=model_name or "tfidf-char3-cosine",
        )
    raise ValueError(f"Unsupported zero-shot backend '{backend}'. Choose auto, embedding, nli, or lexical.")


def _format_record_query(record: dict[str, Any]) -> str:
    """Extract or construct clean query text from a processed vocabulary record."""
    if record.get("text"):
        return str(record["text"])
    parts = [f"Word: {record.get('word', '')} ({record.get('pos', '')})"]
    if record.get("definition"):
        parts.append(f"Definition: {record['definition']}")
    if record.get("collocations"):
        parts.append(f"Collocations: {', '.join(record['collocations'])}")
    if record.get("examples"):
        parts.append(f"Examples: {' | '.join(record['examples'])}")
    return "\n".join(parts)


def propose_subtopic_candidates(
    records: list[dict[str, Any]],
    taxonomy: dict[str, Any],
    scorer: ZeroShotSubtopicScorer,
    *,
    top_k: int = 3,
    restrict_to_main_topic: bool = True,
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    """Score candidate subtopics for each record and attach Top-K proposals for review."""
    if top_k < 1:
        raise ValueError(f"top_k must be >= 1, got {top_k}")

    by_main_topic, all_subtopics = build_subtopic_catalog(taxonomy)

    # Group record indices by candidate pool (typically 10 main_topic buckets) for fast batching.
    grouped_indices: dict[str, list[int]] = defaultdict(list)
    for idx, record in enumerate(records):
        main_topic = record.get("main_topic")
        pool_key = (
            main_topic
            if restrict_to_main_topic and main_topic in by_main_topic
            else "__ALL__"
        )
        grouped_indices[pool_key].append(idx)

    enriched: list[dict[str, Any] | None] = [None] * len(records)
    for pool_key, indices in grouped_indices.items():
        candidates = all_subtopics if pool_key == "__ALL__" else by_main_topic[pool_key]
        texts = [_format_record_query(records[i]) for i in indices]
        score_rows = scorer.score_batch(texts, candidates)

        for idx, scores in zip(indices, score_rows):
            record = dict(records[idx])
            ranked = sorted(
                zip(candidates, scores),
                key=lambda pair: (-pair[1], pair[0]["subtopic_id"]),
            )[:top_k]

            top_candidates = [
                {
                    "rank": rank,
                    "subtopic_id": cand["subtopic_id"],
                    "name_en": cand["name_en"],
                    "name_vi": cand["name_vi"],
                    "score": round(float(score), 4),
                }
                for rank, (cand, score) in enumerate(ranked, start=1)
            ]

            top1_score = top_candidates[0]["score"] if top_candidates else 0.0
            top2_score = top_candidates[1]["score"] if len(top_candidates) > 1 else 0.0
            margin = round(top1_score - top2_score, 4)

            record["subtopic"] = None
            record["recommended_subtopic"] = (
                top_candidates[0]["subtopic_id"] if top_candidates else None
            )
            record["recommended_subtopic_name"] = (
                top_candidates[0]["name_en"] if top_candidates else None
            )
            record["confidence"] = top1_score
            record["confidence_margin"] = margin
            record["subtopic_candidates"] = top_candidates
            record["review_status"] = "pending_review"
            record["candidate_model"] = f"{scorer.backend_name}:{scorer.model_name}"
            enriched[idx] = record

    output_records = [r for r in enriched if r is not None]
    confidences = [r["confidence"] for r in output_records]
    margins = [r["confidence_margin"] for r in output_records]
    stats = {
        "total_samples": len(output_records),
        "top_k": top_k,
        "restrict_to_main_topic": restrict_to_main_topic,
        "backend": scorer.backend_name,
        "model_name": scorer.model_name,
        "mean_top1_confidence": round(sum(confidences) / len(confidences), 4) if confidences else 0.0,
        "mean_confidence_margin": round(sum(margins) / len(margins), 4) if margins else 0.0,
        "low_margin_count_lt_0_05": sum(1 for m in margins if m < 0.05),
        "by_recommended_subtopic": dict(
            sorted(Counter(r["recommended_subtopic"] for r in output_records).items())
        ),
    }
    return output_records, stats


def select_top1_subtopics(
    candidate_records: list[dict[str, Any]],
    taxonomy: dict[str, Any],
    *,
    auto_label_status: str = "subtopic_auto_labeled",
) -> list[dict[str, Any]]:
    """Auto-select the highest-confidence subtopic candidate for each record."""
    subtopic2id: dict[str, int] = taxonomy["subtopic2id"]
    finalized: list[dict[str, Any]] = []

    for rec in candidate_records:
        item = dict(rec)
        candidates = item.get("subtopic_candidates") or []
        if candidates:
            top1 = max(candidates, key=lambda c: float(c.get("score", 0.0)))
            sub_id = top1["subtopic_id"]
            item["subtopic"] = sub_id
            item["subtopic_name"] = top1.get("name_en")
            item["subtopic_label_id"] = subtopic2id.get(sub_id)
            item["confidence"] = round(float(top1["score"]), 4)
            item["label_status"] = auto_label_status
            item["label_source"] = f"{item.get('label_source', 'word_atlas_mapping')}+zero_shot_top1"
            item["review_status"] = "auto_accepted"
        finalized.append(item)

    return finalized


def generate_subtopic_candidates(
    input_path: Path | str = DEFAULT_LABELED_PATH,
    output_path: Path | str = DEFAULT_SUBTOPIC_CANDIDATES_PATH,
    taxonomy_path: Path | str = DEFAULT_TAXONOMY_PATH,
    stats_path: Path | str | None = DEFAULT_SUBTOPIC_STATS_PATH,
    *,
    final_output_path: Path | str | None = None,
    auto_select: bool = False,
    backend: str = "auto",
    model_name: str | None = None,
    top_k: int = 3,
    batch_size: int = 64,
    temperature: float = 0.1,
    restrict_to_main_topic: bool = True,
    limit: int | None = None,
) -> dict[str, Any]:
    """Load processed_labeled records, run zero-shot Top-K subtopic proposals, and save JSONL."""
    records = load_records(input_path)
    if limit is not None:
        records = records[:limit]

    taxonomy = load_taxonomy(taxonomy_path)
    scorer = create_zero_shot_scorer(
        backend=backend,
        model_name=model_name,
        batch_size=batch_size,
        temperature=temperature,
    )
    candidates_records, stats = propose_subtopic_candidates(
        records,
        taxonomy,
        scorer,
        top_k=top_k,
        restrict_to_main_topic=restrict_to_main_topic,
    )
    save_jsonl(candidates_records, output_path)

    if auto_select:
        target_final = final_output_path or DEFAULT_FINAL_LABELED_PATH
        final_records = select_top1_subtopics(candidates_records, taxonomy)
        save_jsonl(final_records, target_final)
        stats["auto_selected"] = True
        stats["final_output_path"] = str(target_final)

    stats["input_path"] = str(input_path)
    stats["output_path"] = str(output_path)
    if stats_path is not None:
        save_json(stats, stats_path)
    return stats


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parse CLI arguments for zero-shot subtopic candidate labeling."""
    parser = argparse.ArgumentParser(
        description="Propose Top-3 candidate subtopics using a zero-shot model for review."
    )
    parser.add_argument("--input", type=Path, default=DEFAULT_LABELED_PATH)
    parser.add_argument("--output", type=Path, default=DEFAULT_SUBTOPIC_CANDIDATES_PATH)
    parser.add_argument("--final-output", type=Path, default=DEFAULT_FINAL_LABELED_PATH)
    parser.add_argument("--taxonomy", type=Path, default=DEFAULT_TAXONOMY_PATH)
    parser.add_argument("--stats", type=Path, default=DEFAULT_SUBTOPIC_STATS_PATH)
    parser.add_argument(
        "--auto-select",
        action="store_true",
        help="Automatically select the highest-confidence Top-1 subtopic and write --final-output.",
    )
    parser.add_argument(
        "--backend",
        choices=("auto", "embedding", "nli", "lexical"),
        default="auto",
        help="Zero-shot scoring backend.",
    )
    parser.add_argument(
        "--model-name",
        type=str,
        default=None,
        help="Optional HuggingFace model ID for embedding or nli backend.",
    )
    parser.add_argument("--top-k", type=int, default=3)
    parser.add_argument("--batch-size", type=int, default=64)
    parser.add_argument("--temperature", type=float, default=0.1)
    parser.add_argument(
        "--all-subtopics",
        action="store_true",
        help="Score against all 41 subtopics instead of restricting to each record's main_topic.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Optional max number of records to process.",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    """CLI entrypoint for zero-shot subtopic candidate generation."""
    args = parse_args(argv)
    stats = generate_subtopic_candidates(
        input_path=args.input,
        output_path=args.output,
        taxonomy_path=args.taxonomy,
        stats_path=args.stats,
        final_output_path=args.final_output,
        auto_select=args.auto_select,
        backend=args.backend,
        model_name=args.model_name,
        top_k=args.top_k,
        batch_size=args.batch_size,
        temperature=args.temperature,
        restrict_to_main_topic=not args.all_subtopics,
        limit=args.limit,
    )
    msg = (
        f"Generated Top-{stats['top_k']} subtopic candidates for {stats['total_samples']} samples "
        f"using {stats['backend']}:{stats['model_name']} -> {args.output}"
    )
    if args.auto_select:
        msg += f" | auto-selected Top-1 -> {args.final_output}"
    print(msg)


if __name__ == "__main__":
    main()
