# Vocab Classifier (`vocab_classifier`)

Data processing and topic classification pipeline for LinguaFlow English vocabulary senses, aligned with the 2-branch taxonomy in [`documents/topic.md`](../documents/topic.md):
- **Topical Vocabulary (`topic_type: "topical"`)**: 10 IELTS Academic Main Topics / 41 Subtopics (`env`..`gov`).
- **General Vocabulary (`topic_type: "general"`)**: Non-topical branch (`gen`) with 4 Subtopics (`gen.function`, `gen.linking`, `gen.auxiliary`, `gen.general`) to prevent forced classification of grammatical and domain-neutral words.

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

### 4. General Vocabulary Detection & Zero-Shot Subtopics (`src/data/subtopic_labeling.py`)
Implements hierarchical two-stage labeling:
- **Task A (Topical vs General Vocabulary)**: Evaluates each sense's core meaning (`Word + POS + Definition`) semantically — never by naive POS rules — against `General Vocabulary` (`gen.*`) vs the 10 IELTS topical categories (`41` topical subtopics), reclassifying domain-neutral/functional senses and rescuing unmapped `needs_review` senses (e.g. `although`, `however`, `therefore`, `seem`, `significant`).
- **Task B (Hierarchical Top-3 Subtopics)**: Scores only the subtopics under each sample's assigned `main_topic` (`gen.*` for `General Vocabulary`, or the corresponding topical subtopics), outputting Top-3 proposals to `data/processed/subtopic_candidates.jsonl`. Passing `--auto-select` chooses the highest-confidence Top-1 subtopic (`subtopic` name + `subtopic_id`) into `data/processed/final_labeled.jsonl`.

## Quick Start

Requires Python 3.10+ (standard library only for `extract`/`preprocess`/`split`; `torch` + `transformers` for neural zero-shot subtopic labeling).

```bash
cd vocab_classifier

# Run unit tests
python -m unittest discover -s tests -v

# Run the full pipeline (promote mapped needs_review -> Top-3 subtopics -> auto-select Top-1 -> split)
python -m src.data.pipeline --promote-mapped --auto-subtopic --subtopic-backend embedding

# Generate Top-3 zero-shot subtopic candidates + auto-select Top-1
python -m src.data.subtopic_labeling --backend embedding --auto-select

# Run baseline benchmark (TF-IDF+LogReg, TF-IDF+LinearSVM, Frozen MiniLM+LogReg)
python -m src.training.train_baselines

# Run error analysis on primary baseline (Frozen MiniLM + Logistic Regression)
python -m src.evaluation.error_analysis --split test

# Run Stage 2 experiments (E1-E4)
python -m src.evaluation.experiments

# Fine-tune Multi-task Hierarchical MiniLM (Stage 3, E5)
python -m src.training.train_minilm

# Calibrate & run Stage 4 Top-K hierarchical inference (E6)
python -m src.inference.hierarchical_inference

# Validate Top-K metrics (E9) & Selective Prediction (E10) locally
python -m src.evaluation.research_e7_e10 --experiments E9 E10

# Run GPU-only training ablations E7 (Subtopic Head Recovery) & E8 (Loss Weight Lambda) on Vast.ai
python -m src.evaluation.research_e7_e10 --experiments E7 E8

# Package final official production model (Frozen MiniLM + Logistic Regression power_0.25) -> final_model/
python -m src.training.finalize_model

# Freeze and package immutable binary release zip + SHA-256 + manifest
python -m src.training.release_artifact package --version 1.0.0

# Start standalone FastAPI inference & human-review microservice
uvicorn api.app:create_app --factory --host 127.0.0.1 --port 8000
```

See [`artifacts/experiments/FINAL_REPORT.md`](artifacts/experiments/FINAL_REPORT.md) for E1–E10 ablation tables and [`artifacts/experiments/THESIS_REPORT.md`](artifacts/experiments/THESIS_REPORT.md) for the complete thesis experimental chapter.

## Release Artifact & Model Restoration (`vocab-classifier-v1.0.0`)

Because binary weights (`final_model/encoder/`, `*.joblib`) are excluded from Git, a separate immutable release archive is published under tag `vocab-classifier-v1.0.0` (Dataset `v1.2.0`, Taxonomy `v1.1.0`, Encoder `all-MiniLM-L6-v2`, Classifier `LogisticRegression` with `power_0.25`, temperature scaling, Top-1 + Top-3 + abstention):

```bash
cd vocab_classifier

# Option A: Restore directly from the GitHub Release URL with SHA-256 verification
python -m src.training.release_artifact restore \
  https://github.com/Noru-0/LINGUAFLOW/releases/download/vocab-classifier-v1.0.0/vocab-classifier-v1.0.0.zip \
  --manifest releases/vocab-classifier-v1.0.0.manifest.json \
  --overwrite

# Option B: Verify & restore from a downloaded local zip
python -m src.training.release_artifact verify releases/vocab-classifier-v1.0.0.zip \
  --sha256-file releases/vocab-classifier-v1.0.0.zip.sha256
python -m src.training.release_artifact restore releases/vocab-classifier-v1.0.0.zip --overwrite
```

Never overwrite a published release version tag or archive; bump `--version` for any future release.

## Current Dataset Summary (Default Run)

| Stage / Split | Records | Notes |
| --- | ---: | --- |
| Raw words | 7,298 | Source: `word-atlas.json` |
| Extracted senses | 13,733 | 6,318 primary + 7,415 `needs_review` |
| Promoted & mapped (`processed_labeled.jsonl`) | 11,986 | `main_topic != null` before General Vocabulary detection |
| Final labeled (`final_labeled.jsonl`) | 13,153 | **8,927** `topical` (10 domains) + **4,226** `general` (`gen`); 580 unmapped remain in `needs_review.jsonl` |
| Train / Val / Test | 10,506 / 1,320 / 1,327 | 5,640 / 706 / 704 unique `word_id`s, 0 `word_id` overlap |
