# Hierarchical Vocabulary Classification for IELTS & General English Senses (`vocab-classifier-v1.0.0`)

**Experimental & Engineering Thesis Report**

---

## 1. Dataset Construction

- **Source Corpus:** Word Atlas bilingual English dictionary (`data/raw/word-atlas.json`), containing **7,298** lexical entries.
- **Sense-Level Explosion (`src/data/extract.py`):** Rather than collapsing polysemous lemmas into word-level bags, each meaning entry was exploded into an independent sense record with deterministic `sample_id = {word_id}_{sense_index + 1:03d}` (`13,733` raw sense records: `6,318` primary senses + `7,415` initially flagged `needs_review` for secondary senses and ambiguous topics).
- **Preprocessing (`src/data/preprocess.py`):** Unicode `NFKC` normalization, control-character stripping, bilingual suffix stripping for collocations/examples, POS canonicalization via `pos_mapping`, and deduplication of `(word_id, pos, definition)`.
- **Input Representation (`full`):**
  ```text
  Word: {word} ({pos})
  Definition: {definition}
  Collocations: {collocations}
  Examples: {examples}
  ```
- **Dataset Versioning (`v1.2.0`):** Fixed SHA-256 verified JSONL splits:
  - `train.jsonl`: `10,392` senses (`5,577` unique `word_id`s) — SHA-256 `b23e848a078e4a4cbc55ea42541c24a6107807d437a288aa217a670cdffb4b10`
  - `val.jsonl`: `1,296` senses (`697` unique `word_id`s) — SHA-256 `dec32da63681abf141f3372244e2d621c0915db3ba25d138d3b82aacc0d9db32`
  - `test.jsonl`: `1,295` senses (`697` unique `word_id`s) — SHA-256 `95e600bc7d66a98d1b2dced875db927c9a8faddb810940155b4737a954aa41f4`

---

## 2. Taxonomy Design (`v1.1.0`)

The classification space is structured as a strict two-level hierarchy (**11 Main Topics**, **45 Subtopics**; SHA-256 `2eedc1cf8f196e557c08f3ae4737d3e67757964f59c0f37e28847432a9ca8043`):

1. **Topical Branch (`topic_type: "topical"`, 10 IELTS Main Topics / 41 Subtopics):**
   `env` (5), `tech` (5), `biz` (5), `edu` (5, including `edu.discourse`), `health` (4), `soc` (4), `urban` (3), `travel` (3), `life` (4), `gov` (3).
2. **General Vocabulary Branch (`topic_type: "general"`, 1 Main Topic / 4 Subtopics):**
   `gen.function` (Function Words), `gen.linking` (Linking & Discourse), `gen.auxiliary` (Auxiliary & Modals), `gen.general` (General-purpose Vocabulary). Including `gen` prevents forced topical misassignment of domain-neutral and grammatical vocabulary.

---

## 3. Data Quality & Annotation

1. **General-Label Correction (`detect_general_vocabulary`):** An initial rule/heuristic bug misrouted domain-specific words into `General Vocabulary`. Semantic meaning-based correction restored ~**1,380** domain senses (e.g., `carbohydrate`, `maths`, `physical`, `invention`) back to `edu`, `health`, and `tech`.
2. **Polysemy & Leakage Control (`src/data/split.py`):** Splits are **group-stratified by `word_id`** (`80 / 10 / 10`, `seed = 42`), guaranteeing **0 `word_id` overlap** between `train`, `val`, and `test`.
3. **Human-Audited Clean Benchmark (`benchmark_test`):** Auditing secondary-sense label conflicts yielded a high-purity `965`-sample diagnostic subset alongside the full `1,295`-sample `test` set.

---

## 4. Baseline Experiments (Pre-E3 `v1.1` Split, `n = 1,327`)

To establish whether pretrained dense embeddings outperform lexical TF-IDF features before neural fine-tuning, three linear baselines were evaluated:

| Model | Main Acc | Main Macro F1 | General F1 | Sub E2E Macro F1 | Sub Oracle Macro F1 | Joint Acc |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| `TF-IDF + Logistic Regression` | `0.5795` | `0.5659` | `0.6309` | `0.3048` | `0.5222` | `0.3753` |
| `TF-IDF + Linear SVM` | `0.5901` | `0.5704` | **`0.6462`** | `0.3015` | `0.4965` | `0.3806` |
| **`Frozen MiniLM + Logistic Regression`** | **`0.6194`** | **`0.5975`** | `0.6442` | **`0.4442`** | **`0.7622`** | **`0.5207`** |

*Note: Table above reflects the initial `v1.1` baseline benchmark (`train=10,506`, `val=1,320`, `test=1,327`) prior to the E3 dataset correction.*

**Error Analysis (`frozen_minilm_error_analysis.md`):** On the primary baseline, **505 / 1,327** test predictions (**38.06%** of all samples; **79.40%** of all subtopic errors) were **cascading errors** caused by an incorrect Main Topic prediction; **420 / 505** (**83.17%**) become immediately correct if given the Oracle Main Topic. Error rate was higher on secondary senses (**41.52%**) than primary senses (**34.91%**).

---

## 5. Input & Weighting Ablation (`E1–E4` on Dataset `v1.2.0`, `n = 1,295`)

All percentage-point differences are expressed in **pp**.

### E1: `class_weight` Ablation (`Frozen MiniLM + LogReg`, `full` input)
| Weighting | Val Main Macro F1 | Test Main Acc | Test Main Macro F1 | Test General F1 | Test Sub E2E Macro F1 | Test Joint Acc |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| `balanced` | `0.5990` | `0.6054` | `0.5981` | `0.6274` | `0.4367` | `0.4981` |
| `power_0.75` | `0.6086` | `0.6216` | `0.6172` | `0.6435` | `0.4437` | `0.5097` |
| `power_0.50` | `0.6258` | `0.6371` | `0.6316` | `0.6596` | `0.4572` | `0.5274` |
| **`power_0.25`** | **`0.6291`** | `0.6417` | `0.6343` | `0.6598` | **`0.4650`** | `0.5398` |
| `none` | `0.6133` | **`0.6479`** | **`0.6404`** | **`0.6745`** | `0.4636` | **`0.5444`** |

**Finding (E1):** Aggressive inverse-frequency weighting (`balanced`) over-predicts minority classes and degrades all metrics. `power_0.25` maximizes Validation Main Macro F1 (`0.6291`, `+3.01 pp` over `balanced`) and Test Sub E2E Macro F1 (`0.4650`, `+2.83 pp`), improving Test Joint Accuracy by `+4.17 pp` (`0.4981 -> 0.5398`).

### E2: Input Representation Ablation (`weighting = power_0.25`)
| Input Variant | Val Main Macro F1 | Test Main Acc | Test Main Macro F1 | Test Sub E2E Macro F1 | Test Sub Oracle Macro F1 | Test Joint Acc |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| `word_pos_def` | `0.5521` | `0.5846` | `0.5675` | `0.3986` | `0.6801` | `0.4672` |
| `word_pos_def_col` | `0.5897` | `0.6239` | `0.6058` | `0.4296` | `0.6816` | `0.5050` |
| `word_pos_def_ex` | `0.6184` | **`0.6479`** | **`0.6362`** | `0.4440` | `0.6801` | `0.5236` |
| **`full`** | **`0.6291`** | `0.6417` | `0.6343` | **`0.4650`** | **`0.7150`** | **`0.5398`** |

**Finding (E2):** Contextual `examples` + `collocations` (`full`) do not harm frozen embeddings overall; `full` delivers **`+6.68 pp`** Main Macro F1, **`+6.64 pp`** Sub E2E Macro F1, and **`+7.26 pp`** Joint Accuracy over `word_pos_def`.

### E3 & E4: Label Correction & Polysemy Impact
- **E3:** Moving ~`1,380` domain words out of the majority `gen` class lowered inflated overall accuracy (`-1.40 pp` balanced, `-2.73 pp` none) while keeping Macro F1 stable (`0.6404`), reflecting a harder, cleaner benchmark.
- **E4:** On `power_0.25`, `secondary_only` (`n = 606`) trails `primary_only` (`n = 689`) by **`-8.64 pp`** Main Accuracy (`0.5957` vs `0.6821`) and **`-11.03 pp`** Main Macro F1 (`0.5721` vs `0.6824`). Auditing conflicts raises `audited_clean_benchmark` (`n = 965`) to `0.6850` Main Accuracy and `0.5855` Joint Accuracy.

---

## 6. Fine-Tuning Experiments (`E5, E7, E8` — Vast.ai NVIDIA RTX 3060)

### E5 vs E7: Explaining Main Topic Gains vs Subtopic Drops
| Model Variant | Test Main Acc | Test Main Macro F1 | Test Sub E2E Macro F1 | Test Sub Oracle Macro F1 | Test Joint Acc |
| :--- | ---: | ---: | ---: | ---: | ---: |
| **Frozen MiniLM + LogReg (`power_0.25`)** | `0.6417` | `0.6343` | **`0.4650`** | **`0.7150`** | **`0.5398`** |
| Joint Fine-tuned MiniLM (E5, 4 ep) | `0.6811` | `0.6798` | `0.4076` | `0.5760` | `0.4764` |
| `finetuned_encoder_logreg` (E7) | `0.6927` | `0.6912` | `0.4493` | `0.5992` | `0.5012` |
| `finetuned_encoder_trainable_head` (E7, 8 ep) | **`0.6942`** | **`0.6954`** | `0.4535` | `0.6265` | `0.4981` |
| `frozen_encoder_trainable_heads` (E7, 8 ep) | `0.6185` | `0.5981` | `0.3753` | `0.6166` | `0.4764` |

### E8: Multi-Task Loss Ablation ($L = L_{\text{main}} + \lambda L_{\text{sub}}$)
| $\lambda$ | Best Epoch | Val Main F1 | Test Main Acc | Test Main Macro F1 | Test Sub E2E Macro F1 | Test Sub Oracle Macro F1 | Test Joint Acc |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `0.25` | `3` | **`0.7148`** | `0.6896` | `0.6911` | `0.3697` | `0.5243` | `0.4548` |
| `0.50` | `4` | `0.7096` | **`0.6919`** | **`0.6924`** | `0.3977` | `0.5586` | `0.4749` |
| **`1.00`** | `4` | `0.7100` | `0.6857` | `0.6846` | **`0.4264`** | `0.6066` | **`0.4903`** |
| `2.00` | `4` | `0.7089` | `0.6749` | `0.6758` | `0.4243` | **`0.6144`** | **`0.4903`** |

**Trade-off Finding (B):** Fine-tuning MiniLM expands 11-way Main Topic separation (**`+5.25 pp`** Acc / **`+6.11 pp`** Main Macro F1 in E7 `finetuned_encoder_trainable_head` over Frozen `power_0.25`). However, even after recovering head convergence (`+4.59 pp` E2E), the fine-tuned encoder suffers **`-8.85 pp`** to **`-11.58 pp`** Oracle Subtopic Macro F1 loss (`0.5992–0.6265` vs Frozen `0.7150`) because coarse Main Topic supervision compresses fine-grained intra-topic semantic distinctions needed to separate 45 subtopics.

---

## 7. Inference & Reliability (`E6, E9, E10` vs Final Artifact Inference)

> **Configuration Scope Notice:** E6, E9, and E10 ablation studies below were measured on the **Stage-3 Fine-tuned MiniLM checkpoint**, whereas the production artifact **`vocab-classifier-v1.0.0`** evaluates **Frozen MiniLM + LogReg (`power_0.25`)** with independent `val`-fitted temperature scaling (`T_main = 0.8659`, `T_sub = 0.4928`). The two metric series are kept strictly separated below and must never be blended.

### 7.1 E9 & E10 Reference Series (Fine-Tuned Checkpoint)
- **E9 Invariants & Top-K:** `0` hierarchy violations, `0` joint-prob mismatches. Pure Main Top-1 = `0.6811`, Top-3 = `0.9359`. Top-3 Joint MAP recovers `26` cascading errors at Top-1 (`0.4772 -> 0.4880` Joint Acc) and jumps Top-3 Sub Recall by `+7.18 pp` (`0.6471 -> 0.7189`).
- **E10 Risk–Coverage (Val-fixed `(0.60, 0.30)`):** Val Cov = `70.37%`, Test Cov = `64.79%` (`456` review), Accepted Main F1 = `0.8036`, Accepted Sub F1 = `0.4939`, Accepted Joint Acc = `0.5948`.

---

## 8. Final Model Selection (`vocab-classifier-v1.0.0`)

**Selected Official Model:** **Frozen `all-MiniLM-L6-v2` + Hierarchical `LogisticRegression` (`power_0.25`, `C=2.0`)**, Top-1 default prediction + Top-3 candidate expansion + validation-calibrated temperature scaling + `(0.60, 0.30)` abstention.

**Rationale:** Although fine-tuned heads lead on standalone Main Topic Macro F1 (`0.6954` vs `0.6343`), Frozen MiniLM + LogReg strictly outperforms every fine-tuned configuration across **all three hierarchical metrics**:
- **Subtopic E2E Macro F1:** **`0.4650`** (vs `0.4535` best fine-tuned, `+1.15 pp`)
- **Subtopic Oracle Macro F1:** **`0.7150`** (vs `0.6265`, `+8.85 pp`)
- **Joint Exact Match Accuracy:** **`0.5398`** (vs `0.4981`, `+4.17 pp`)

### Final Production Results (`final_model/evaluation/test_metrics.json`, `n = 1,295`)

#### A. Full Test Set Performance (100% Coverage — Unfiltered)
| Metric | Score |
| :--- | ---: |
| Main Accuracy | `0.6417` |
| Main Macro F1 | `0.6343` |
| General vs Topical F1 | `0.6598` |
| Subtopic End-to-End Macro F1 | `0.4650` |
| Subtopic Oracle Main Macro F1 | `0.7150` |
| Joint Exact Match Accuracy | `0.5398` |
| Top-3 Main Recall | `0.9259` |
| Top-3 Subtopic Recall (via Top-3 Main) | `0.8193` |

#### C. Selective Prediction on Production Artifact (Separated from Full Test)
Validation-calibrated temperatures: `T_main = 0.8659` (`val_main_nll: 0.9634 -> 0.9527`), `T_sub = 0.4928` (`val_sub_ece: 0.1224 -> 0.0217`).

| Operating Point (Fixed from Validation) | Test Coverage | Auto-Accepted | Needs Review | Accepted Main Acc | Accepted Main Macro F1 | Accepted Sub E2E Macro F1 | Accepted Joint Acc | Joint Error Capture |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **Default Production (`Main >= 0.60, Joint >= 0.30`)** | `57.76%` | `748 / 1,295` | `547` (`42.24%`) | `0.7901` (`+14.84 pp`) | `0.7815` (`+14.72 pp`) | `0.5728` (`+10.78 pp`) | `0.6725` (`+13.27 pp`) | `58.89%` |
| High-Precision Reference (`Main >= 0.65, Joint >= 0.35`) | `50.12%` | `649 / 1,295` | `646` (`49.88%`) | `0.8197` | `0.8097` | `0.5888` | `0.6934` | `66.61%` |

Under the default operating point (`Main >= 0.60, Joint >= 0.30`), **57.76%** of incoming senses (`748 / 1,295`) are auto-accepted at **`0.6725` Joint Accuracy**, while **547 / 1,295** uncertain senses are routed to human verification—capturing **58.89%** of all joint errors.

---

## 9. Production Packaging, API Integration & Limitations

- **Immutable Release Artifact:** [`vocab-classifier-v1.0.0`](https://github.com/Noru-0/LINGUAFLOW/releases/tag/vocab-classifier-v1.0.0) (`vocab-classifier-v1.0.0.zip`, `83,697,489` bytes, SHA-256 `388ae49c309a9bd0c70aaa89fd83537e4947477aad458050bde6b2550c25648f`) with automated verification and restore CLI (`src/training/release_artifact.py`).
- **Modular Inference & FastAPI Service:** Separated `src/preprocessing.py`, `src/predictor.py`, `src/postprocessing.py`, `src/schemas.py`, `api/routes.py` (`/predict`, `/predict/batch`, `/health`, `/model-info`, `/review/*`), backed by SQLite `ReviewWorkflowStore` and Next.js `/api/topics/auto-cluster` + `/api/cards/[id]/topics` non-destructive verification (`predicted_main_topic` & `predicted_subtopic` preserved alongside `human_verified` overrides).
- **Known Limitations:**
  1. Per-class zero-support / low-frequency tail subtopics (`gov.globalization`, `tech.cyber`, `env.climate` with small test supports `1–8` and noisy zero-shot origin) depress macro-averaged subtopic F1.
  2. Secondary senses (`sense_index > 0`) remain intrinsically harder (`-8.64 pp` Main Acc vs primary senses), motivating ongoing human verification of the `needs_review` queue (`42.24%` of imported items) to expand clean multi-sense training data for `v1.1.0` / `v2.0.0`.
