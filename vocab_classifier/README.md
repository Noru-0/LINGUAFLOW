# Vocab Classifier (`vocab_classifier`)

Data processing and topic classification pipeline for LinguaFlow English vocabulary senses, aligned with the 10-domain / 41-subtopic academic taxonomy in [`documents/topic.md`](../documents/topic.md).

## Directory Structure

```text
vocab_classifier/
├── data/
│   ├── raw/
│   │   ├── schema.md                 # Sense-level output schema specification
│   │   ├── word-atlas.json           # Raw Word Atlas dictionary (7,298 words)
│   │   └── word-atlas_process.json   # Reference extracted sample ("library")
│   ├── taxonomy/
│   │   └── taxonomy.json             # Canonical 10 main topics, 41 subtopics, source & POS maps
│   └── processed/
│       ├── extracted_senses.jsonl    # All 13,733 extracted word senses
│       ├── processed_labeled.jsonl   # Cleaned primary senses with reviewed main_topic labels
│       ├── needs_review.jsonl        # Secondary senses & unmapped source topics
│       ├── train.jsonl               # Group-stratified training split (80%)
│       ├── val.jsonl                 # Group-stratified validation split (10%)
│       ├── test.jsonl                # Group-stratified test split (10%)
│       ├── subtopic_candidates.jsonl # Zero-shot Top-3 subtopic proposals for review
│       ├── final_labeled.jsonl       # Full labeled dataset with auto-selected Top-1 subtopics
│       ├── label_mapping.json        # label2id / id2label / subtopic2id mappings
│       └── *_stats.json              # Summary counts for extract, preprocess, split, subtopics
├── src/
│   └── data/
│       ├── common.py                 # Shared I/O, paths, taxonomy loader, text normalization
│       ├── extract.py                # Word-level -> sense-level extraction
│       ├── preprocess.py             # Cleaning, deduplication, model text formatting, filtering
│       ├── split.py                  # Deterministic group-stratified split by word_id
│       ├── subtopic_labeling.py      # Zero-shot Top-3 subtopic candidate proposer
│       └── pipeline.py               # End-to-end runner (extract -> preprocess -> split)
└── tests/
    └── test_data_pipeline.py         # Unit tests (stdlib unittest)
```

## Pipeline Stages

### 1. Extract (`src/data/extract.py`)
Explodes each word entry in `data/raw/word-atlas.json` into sense-level records matching `data/raw/schema.md`:
- Generates deterministic `sample_id` as `{word_id}_{sense_index + 1:03d}`.
- Normalizes abbreviated POS tags (e.g., `n.` → `noun`, `v.` → `verb`).
- Strips bilingual Chinese suffixes from `examples` and `collocations` (keeping English text only).
- Maps `source_topic` to the 10 canonical `main_topic` labels using `data/taxonomy/taxonomy.json`:
  - Mapped primary senses (`sense_index == 0`) receive `label_status = "main_topic_reviewed"`.
  - Secondary senses (`sense_index > 0`) and ambiguous/unmapped topics (`emotion`, `thinking`, `media`) receive `label_status = "needs_review"`.

### 2. Preprocess (`src/data/preprocess.py`)
Prepares extracted senses for model training and evaluation:
- Applies Unicode `NFKC` normalization, control-character stripping, and whitespace collapsing.
- Deduplicates identical `(word_id, pos, definition)` senses and case-insensitive duplicate `examples` / `collocations`.
- Formats a structured `text` field combining `word`, `pos`, `definition`, `collocations`, and `examples`.
- Separates clean labeled samples (`processed_labeled.jsonl`) from `needs_review.jsonl`, and writes `label_mapping.json`.
  - Pass `--include-needs-review` to include secondary senses that have a non-null `main_topic`.

### 3. Split (`src/data/split.py`)
Splits `processed_labeled.jsonl` into `train.jsonl`, `val.jsonl`, and `test.jsonl` (default `0.8 / 0.1 / 0.1`, `seed = 42`):
- Uses **group-stratified splitting** by `word_id` and stratified by `main_topic` so all senses of the same word stay in the same split (preventing intra-word example/collocation leakage).

### 4. Zero-Shot Subtopic Candidate Labeling (`src/data/subtopic_labeling.py`)
Reads `data/processed/processed_labeled.jsonl`, retrieves candidate subtopics for each sample's `main_topic` from `data/taxonomy/taxonomy.json`, scores them with a zero-shot model, and outputs Top-3 proposals to `data/processed/subtopic_candidates.jsonl` for human review:
- Supports `embedding` (`sentence-transformers/all-MiniLM-L6-v2` bi-encoder cosine similarity + calibrated softmax), `nli` (HuggingFace `zero-shot-classification` pipeline, e.g. `facebook/bart-large-mnli`), and `lexical` (zero-dependency TF-weighted fallback).
- Outputs `recommended_subtopic`, `confidence`, `confidence_margin` (top1 - top2 for prioritizing uncertain items during review), and `subtopic_candidates` (Top-3).

## Quick Start

Requires Python 3.10+ (standard library only for `extract`/`preprocess`/`split`; `torch` + `transformers` for neural zero-shot subtopic labeling).

```bash
cd vocab_classifier

# Run unit tests
python -m unittest discover -s tests -v

# Run the full pipeline (promote mapped needs_review -> Top-3 subtopics -> auto-select Top-1 -> split)
python -m src.data.pipeline --promote-mapped --auto-subtopic --subtopic-backend embedding

# Or run subtopic labeling standalone
python -m src.data.subtopic_labeling --backend embedding --auto-select
```

## Current Dataset Summary (Default Run)

| Stage / Split | Records | Notes |
| --- | ---: | --- |
| Raw words | 7,298 | Source: `word-atlas.json` |
| Extracted senses | 13,733 | 6,318 primary + 7,415 `needs_review` |
| Promoted & labeled (`processed_labeled.jsonl`) | 11,986 | 5,668 mapped senses promoted (`main_topic != null`); 1,747 unmapped remain in `needs_review.jsonl` |
| Subtopic auto-labeled (`final_labeled.jsonl`) | 11,986 | Top-1 selected from zero-shot Top-3 (`all-MiniLM-L6-v2`) |
| Train / Val / Test | 9,608 / 1,202 / 1,176 | 5,054 / 633 / 631 unique `word_id`s, 0 `word_id` overlap |
