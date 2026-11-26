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
│       ├── label_mapping.json        # label2id / id2label / topic_id mappings
│       └── *_stats.json              # Summary counts for extract, preprocess, and split
├── src/
│   └── data/
│       ├── common.py                 # Shared I/O, paths, taxonomy loader, text normalization
│       ├── extract.py                # Word-level -> sense-level extraction
│       ├── preprocess.py             # Cleaning, deduplication, model text formatting, filtering
│       ├── split.py                  # Deterministic group-stratified split by word_id
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

## Quick Start

Requires Python 3.10+ (standard library only; no external packages needed for `src/data`).

```bash
cd vocab_classifier

# Run unit tests
python -m unittest discover -s tests -v

# Run the full pipeline (extract -> preprocess -> split)
python -m src.data.pipeline

# Or run individual stages
python -m src.data.extract
python -m src.data.preprocess
python -m src.data.split
```

## Current Dataset Summary (Default Run)

| Stage / Split | Records | Notes |
| --- | ---: | --- |
| Raw words | 7,298 | Source: `word-atlas.json` |
| Extracted senses | 13,733 | 6,318 `main_topic_reviewed`, 7,415 `needs_review` |
| Labeled dataset | 6,318 | 10 `main_topic` classes, 0 dropped |
| Train / Val / Test | 5,054 / 633 / 631 | 80% / 10% / 10%, 0 `word_id` overlap |
