"""Zero-shot General Vocabulary detection (Task A) and Top-3 hierarchical subtopic labeling (Task B)."""

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
    DEFAULT_REVIEW_PATH,
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
GENERAL_TOPIC_NAME = "General Vocabulary"
GENERAL_TOPIC_ID = "gen"

_TOKEN_RE = re.compile(r"[a-z0-9]+")


class ZeroShotSubtopicScorer(Protocol):
    """Protocol for zero-shot subtopic scoring backends."""

    backend_name: str
    model_name: str

    def raw_score_batch(
        self,
        texts: list[str],
        candidates: list[dict[str, str]],
    ) -> list[list[float]]:
        """Return unnormalized semantic similarity/entailment scores per candidate."""

    def score_batch(
        self,
        texts: list[str],
        candidates: list[dict[str, str]],
    ) -> list[list[float]]:
        """Return calibrated probability scores aligned with `candidates` for each input text."""


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
        topic_type = topic.get("topic_type", "topical")
        entries: list[dict[str, str]] = []
        for sub in topic.get("subtopics", []):
            entry = {
                "subtopic_id": sub["id"],
                "name_en": sub["name_en"],
                "name_vi": sub.get("name_vi", ""),
                "main_topic": main_name,
                "topic_type": topic_type,
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
                mask = (
                    encoded["attention_mask"]
                    .unsqueeze(-1)
                    .expand(outputs.last_hidden_state.size())
                    .float()
                )
                pooled = (outputs.last_hidden_state * mask).sum(dim=1) / mask.sum(dim=1).clamp(
                    min=1e-9
                )
                normalized = torch.nn.functional.normalize(pooled, p=2, dim=1)
                chunks.append(normalized.cpu())
        return torch.cat(chunks, dim=0) if chunks else torch.empty((0, 0))

    def _get_candidate_matrix(self, candidates: list[dict[str, str]]) -> Any:
        """Encode and cache candidate subtopic embeddings."""
        missing = [
            c["candidate_text"]
            for c in candidates
            if c["candidate_text"] not in self._candidate_cache
        ]
        if missing:
            embeddings = self._encode_texts(missing)
            for text, vec in zip(missing, embeddings):
                self._candidate_cache[text] = vec
        return self._torch.stack([self._candidate_cache[c["candidate_text"]] for c in candidates])

    def raw_score_batch(
        self,
        texts: list[str],
        candidates: list[dict[str, str]],
    ) -> list[list[float]]:
        if not texts or not candidates:
            return []
        text_vecs = self._encode_texts(texts)
        cand_matrix = self._get_candidate_matrix(candidates)
        return (text_vecs @ cand_matrix.T).tolist()

    def score_batch(
        self,
        texts: list[str],
        candidates: list[dict[str, str]],
    ) -> list[list[float]]:
        sims = self.raw_score_batch(texts, candidates)
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

    def raw_score_batch(
        self,
        texts: list[str],
        candidates: list[dict[str, str]],
    ) -> list[list[float]]:
        return self.score_batch(texts, candidates)

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

    def raw_score_batch(
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
            results.append(
                [
                    sum(val * c_vec.get(key, 0.0) for key, val in t_vec.items())
                    for c_vec in cand_vecs
                ]
            )
        return results

    def score_batch(
        self,
        texts: list[str],
        candidates: list[dict[str, str]],
    ) -> list[list[float]]:
        sims = self.raw_score_batch(texts, candidates)
        return [_softmax(row, temperature=self.temperature) for row in sims]


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
    raise ValueError(
        f"Unsupported zero-shot backend '{backend}'. Choose auto, embedding, nli, or lexical."
    )


def _format_sense_meaning_query(record: dict[str, Any]) -> str:
    """Build sense-meaning query from word, POS, and definition (excluding noisy examples)."""
    return f"Word: {record.get('word', '')} ({record.get('pos', '')})\nDefinition: {record.get('definition', '')}"


def _format_record_query(record: dict[str, Any]) -> str:
    """Extract or construct clean full query text from a processed vocabulary record."""
    if record.get("text"):
        return str(record["text"])
    parts = [_format_sense_meaning_query(record)]
    if record.get("collocations"):
        parts.append(f"Collocations: {', '.join(record['collocations'])}")
    if record.get("examples"):
        parts.append(f"Examples: {' | '.join(record['examples'])}")
    return "\n".join(parts)


def detect_general_vocabulary(
    records: list[dict[str, Any]],
    taxonomy: dict[str, Any],
    scorer: ZeroShotSubtopicScorer,
    *,
    mapped_margin: float = 0.14,
    broad_margin: float = 0.05,
    unmapped_margin: float = 0.02,
    broad_sources: tuple[str, ...] = ("daily",),
) -> tuple[list[dict[str, Any]], list[dict[str, Any]], dict[str, int]]:
    """Classify General Vocabulary senses by sense meaning rather than naive POS rules.

    Task A: Compares each sense's core meaning (word + POS + definition) against the
    General Vocabulary subtopics (`gen.*`) versus the 10 IELTS topical categories.
    Uses a stricter override margin (`mapped_margin`) for domain-specific `source_topic`s
    (e.g. health, education, technology) than for catch-all `broad_sources` (`daily`)
    or unmapped sources (`thinking`, `emotion`, `media`).
    """
    _, all_subtopics = build_subtopic_catalog(taxonomy)
    topical_cands = [c for c in all_subtopics if c["topic_type"] != "general"]
    general_cands = [c for c in all_subtopics if c["topic_type"] == "general"]
    if not general_cands:
        raise ValueError("Taxonomy has no 'general' branch subtopics configured.")

    combined_cands = topical_cands + general_cands
    n_topical = len(topical_cands)

    queries = [_format_sense_meaning_query(r) for r in records]
    raw_scores = scorer.raw_score_batch(queries, combined_cands)

    label2id: dict[str, int] = taxonomy["label2id"]
    topic_type_map: dict[str, str] = taxonomy["topic_type_map"]
    gen_label_id = label2id[GENERAL_TOPIC_NAME]
    broad_set = set(broad_sources)

    classified: list[dict[str, Any]] = []
    still_unmapped: list[dict[str, Any]] = []
    stats = {
        "evaluated": len(records),
        "reclassified_from_domain_to_general": 0,
        "reclassified_from_broad_to_general": 0,
        "reclassified_from_topical_to_general": 0,
        "rescued_from_unmapped_to_general": 0,
        "kept_topical": 0,
        "remained_unmapped": 0,
    }

    for rec, row in zip(records, raw_scores):
        item = dict(rec)
        max_topical = max(row[:n_topical]) if n_topical else 0.0
        max_general = max(row[n_topical:])
        diff = max_general - max_topical

        had_main_topic = bool(item.get("main_topic")) and item["main_topic"] in label2id
        src_topic = str(item.get("source_topic") or "")
        if not had_main_topic:
            threshold = unmapped_margin
        elif src_topic in broad_set:
            threshold = broad_margin
        else:
            threshold = mapped_margin

        if diff >= threshold:
            prev_source = item.get("label_source") or "word_atlas_mapping"
            item["main_topic"] = GENERAL_TOPIC_NAME
            item["main_topic_id"] = GENERAL_TOPIC_ID
            item["topic_type"] = "general"
            item["label_id"] = gen_label_id
            item["label_status"] = "main_topic_reviewed"
            if "zero_shot_general" not in prev_source:
                item["label_source"] = (
                    f"{prev_source}+zero_shot_general" if had_main_topic else "zero_shot_general"
                )
            classified.append(item)
            if had_main_topic:
                stats["reclassified_from_topical_to_general"] += 1
                if src_topic in broad_set:
                    stats["reclassified_from_broad_to_general"] += 1
                else:
                    stats["reclassified_from_domain_to_general"] += 1
            else:
                stats["rescued_from_unmapped_to_general"] += 1
        elif had_main_topic:
            item["topic_type"] = topic_type_map.get(item["main_topic"], "topical")
            classified.append(item)
            stats["kept_topical"] += 1
        else:
            still_unmapped.append(item)
            stats["remained_unmapped"] += 1

    return classified, still_unmapped, stats


def propose_subtopic_candidates(
    records: list[dict[str, Any]],
    taxonomy: dict[str, Any],
    scorer: ZeroShotSubtopicScorer,
    *,
    top_k: int = 3,
    restrict_to_main_topic: bool = True,
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    """Task B: Score candidate subtopics within each record's main_topic and attach Top-K proposals."""
    if top_k < 1:
        raise ValueError(f"top_k must be >= 1, got {top_k}")

    by_main_topic, all_subtopics = build_subtopic_catalog(taxonomy)
    name_to_id: dict[str, str] = taxonomy["name_to_id"]
    topic_type_map: dict[str, str] = taxonomy["topic_type_map"]

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

            main_topic = record.get("main_topic")
            if main_topic in name_to_id:
                record["main_topic_id"] = name_to_id[main_topic]
                record["topic_type"] = topic_type_map.get(main_topic, "topical")

            record["subtopic"] = None
            record["subtopic_id"] = None
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
        "by_topic_type": dict(
            sorted(Counter(r.get("topic_type") or "unknown" for r in output_records).items())
        ),
        "by_main_topic": dict(
            sorted(Counter(r.get("main_topic") or "<unmapped>" for r in output_records).items())
        ),
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
            item["subtopic"] = top1.get("name_en")
            item["subtopic_id"] = sub_id
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
    review_input_path: Path | str | None = None,
    review_output_path: Path | str | None = None,
    final_output_path: Path | str | None = None,
    auto_select: bool = False,
    detect_general: bool = True,
    general_margin: float = 0.14,
    broad_general_margin: float = 0.05,
    unmapped_general_margin: float = 0.02,
    backend: str = "auto",
    model_name: str | None = None,
    top_k: int = 3,
    batch_size: int = 64,
    temperature: float = 0.1,
    restrict_to_main_topic: bool = True,
    limit: int | None = None,
) -> dict[str, Any]:
    """Run Task A (optional General detection) + Task B (Top-K subtopics), and save JSONL."""
    records = load_records(input_path)
    if review_input_path is not None and Path(review_input_path).exists():
        records.extend(load_records(review_input_path))
    if limit is not None:
        records = records[:limit]

    taxonomy = load_taxonomy(taxonomy_path)
    scorer = create_zero_shot_scorer(
        backend=backend,
        model_name=model_name,
        batch_size=batch_size,
        temperature=temperature,
    )

    general_stats: dict[str, int] | None = None
    still_unmapped: list[dict[str, Any]] = []
    if detect_general:
        records, still_unmapped, general_stats = detect_general_vocabulary(
            records,
            taxonomy,
            scorer,
            mapped_margin=general_margin,
            broad_margin=broad_general_margin,
            unmapped_margin=unmapped_general_margin,
        )
        if review_output_path is not None:
            save_jsonl(still_unmapped, review_output_path)

    candidates_records, stats = propose_subtopic_candidates(
        records,
        taxonomy,
        scorer,
        top_k=top_k,
        restrict_to_main_topic=restrict_to_main_topic,
    )
    save_jsonl(candidates_records, output_path)

    if general_stats is not None:
        stats["general_detection"] = general_stats

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
        description="Detect General Vocabulary senses (Task A) and propose Top-3 subtopics (Task B)."
    )
    parser.add_argument("--input", type=Path, default=DEFAULT_LABELED_PATH)
    parser.add_argument(
        "--review-input",
        type=Path,
        default=None,
        help="Optional needs_review.jsonl to rescue unmapped General Vocabulary senses.",
    )
    parser.add_argument(
        "--review-output",
        type=Path,
        default=None,
        help="Optional path to rewrite remaining unmapped records after General detection.",
    )
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
        "--no-detect-general",
        action="store_true",
        help="Disable Task A semantic General Vocabulary detection.",
    )
    parser.add_argument(
        "--general-margin",
        type=float,
        default=0.14,
        help="Margin (max_gen - max_topical) required to reclassify a domain topical sense to gen.",
    )
    parser.add_argument(
        "--broad-general-margin",
        type=float,
        default=0.05,
        help="Margin (max_gen - max_topical) required to reclassify a catch-all ('daily') sense to gen.",
    )
    parser.add_argument(
        "--unmapped-general-margin",
        type=float,
        default=0.02,
        help="Margin (max_gen - max_topical) required to rescue an unmapped sense to gen.",
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
        help="Score against all subtopics instead of restricting to each record's main_topic.",
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
    review_in = args.review_input
    review_out = args.review_output or (DEFAULT_REVIEW_PATH if review_in is not None else None)
    stats = generate_subtopic_candidates(
        input_path=args.input,
        output_path=args.output,
        taxonomy_path=args.taxonomy,
        stats_path=args.stats,
        review_input_path=review_in,
        review_output_path=review_out,
        final_output_path=args.final_output,
        auto_select=args.auto_select,
        detect_general=not args.no_detect_general,
        general_margin=args.general_margin,
        broad_general_margin=args.broad_general_margin,
        unmapped_general_margin=args.unmapped_general_margin,
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
