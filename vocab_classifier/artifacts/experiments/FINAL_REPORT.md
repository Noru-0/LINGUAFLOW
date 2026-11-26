# Vocab Classifier Research Report (Experiments E1–E6)

## Overview

End-to-end empirical evaluation across the 4-stage roadmap on the corrected 11-Main-Topic (10 IELTS domains + `General Vocabulary`) / 45-Subtopic dataset (`train=10,392`, `val=1,296`, `test=1,295`, zero `word_id` overlap). All deltas are reported in **percentage points (pp)**.

---

## E1: `class_weight` Ablation (`Frozen MiniLM + Logistic Regression`, `full` input)

| Weighting | Val Main Macro F1 | Test Main Acc | Test Main Macro F1 | Test General F1 | Test Sub E2E Macro F1 | Test Joint Acc |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| `balanced` | `0.5990` | `0.6054` | `0.5981` | `0.6274` | `0.4367` | `0.4981` |
| `power_0.75` | `0.6086` | `0.6216` | `0.6172` | `0.6435` | `0.4437` | `0.5097` |
| `power_0.50` | `0.6258` | `0.6371` | `0.6316` | `0.6596` | `0.4572` | `0.5274` |
| `power_0.25` | **`0.6291`** | `0.6417` | `0.6343` | `0.6598` | **`0.4650`** | `0.5398` |
| `none` | `0.6133` | **`0.6479`** | **`0.6404`** | **`0.6745`** | `0.4636` | **`0.5444`** |

**Conclusion (E1):** Full inverse-frequency weighting (`balanced`) hurts both accuracy and Macro F1 by over-predicting small classes. Removing weighting (`none`: `+4.25 pp` Acc / `+4.23 pp` Main Macro F1) or using mild smoothing (`power_0.25`: `+3.63 pp` Acc / `+3.62 pp` Main Macro F1 / `+2.83 pp` Sub E2E Macro F1) strictly improves performance.

---

## E2: Input Ablation (`Frozen MiniLM + LogReg`, `weighting=power_0.25`)

| Input Variant | Val Main Macro F1 | Test Main Acc | Test Main Macro F1 | Test Sub E2E Macro F1 | Test Sub Oracle Macro F1 | Test Joint Acc |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| `word_pos_def` | `0.5521` | `0.5846` | `0.5675` | `0.3986` | `0.6801` | `0.4672` |
| `word_pos_def_col` | `0.5897` | `0.6239` | `0.6058` | `0.4296` | `0.6816` | `0.5050` |
| `word_pos_def_ex` | `0.6184` | **`0.6479`** | **`0.6362`** | `0.4440` | `0.6801` | `0.5236` |
| `full` | **`0.6291`** | `0.6417` | `0.6343` | **`0.4650`** | **`0.7150`** | **`0.5398`** |

**Conclusion (E2):** Contextual `examples` + `collocations` (`full`) do not degrade frozen representations overall; `full` improves Test Main Macro F1 by `+6.68 pp` and Subtopic E2E Macro F1 by `+6.64 pp` over `word_pos_def`.

---

## E3: General-Label Correction (`v1.1` noisy vs `v1.2` corrected)

| Setting | Main Acc | Main Macro F1 | Sub E2E Macro F1 |
| :--- | ---: | ---: | ---: |
| `balanced` (`v1.1`) | `0.6194` | `0.5975` | `0.4442` |
| `balanced` (`v1.2` corrected) | `0.6054` (`-1.40 pp`) | `0.5981` (`+0.06 pp`) | `0.4367` |
| `none` (`v1.1`) | `0.6752` | `0.6411` | `0.4855` |
| `none` (`v1.2` corrected) | `0.6479` (`-2.73 pp`) | `0.6404` (`-0.07 pp`) | `0.4636` |

**Conclusion (E3):** Fixing `detect_general_vocabulary` returned ~1,380 stolen domain senses (`carbohydrate`, `maths`, `physical`, `invention`, etc.) from the large `gen` majority class back to their harder topical classes (`edu`, `health`, `tech`), reducing inflated majority-class accuracy while holding Main Macro F1 steady (`~0.640`) on a cleaner taxonomy.

---

## E4: Primary vs Secondary Sense Evaluation (Polysemy Impact)

| Test Subset | Samples | Main Acc | Main Macro F1 | Sub E2E Macro F1 | Joint Acc |
| :--- | ---: | ---: | ---: | ---: | ---: |
| `all_test` | `1,295` | `0.6417` | `0.6343` | `0.4650` | `0.5398` |
| `primary_only` (`sense_index=0`) | `689` | `0.6821` | `0.6824` | `0.5016` | `0.5747` |
| `secondary_only` (`sense_index>0`) | `606` | `0.5957` (`-8.64 pp`) | `0.5721` (`-11.03 pp`) | `0.4094` (`-9.22 pp`) | `0.5000` (`-7.47 pp`) |
| `audited_clean_benchmark` | `965` | **`0.6850`** | **`0.6797`** | **`0.5111`** | **`0.5855`** |

**Conclusion (E4):** Polysemy (`secondary_only`) causes a `-8.64 pp` drop in Main Accuracy and `-11.03 pp` drop in Main Macro F1 compared to `primary_only`. Removing secondary-sense conflicts in `audited_clean_benchmark` yields `0.6850` Main Accuracy.

---

## E5: Frozen vs Fine-tuned MiniLM (`best_epoch=3`, `mask_untrusted_subtopics=True`)

| Model / Subset | Samples | Main Acc | Main Macro F1 | General F1 | Sub E2E Macro F1 | Sub Oracle Macro F1 | Joint Acc |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Frozen MiniLM (`none`) | `1,295` | `0.6479` | `0.6404` | **`0.6745`** | `0.4636` | `0.6935` | **`0.5444`** |
| Frozen MiniLM (`power_0.25`) | `1,295` | `0.6417` | `0.6343` | `0.6598` | **`0.4650`** | **`0.7150`** | `0.5398` |
| **Fine-tuned MiniLM (`test`)** | `1,295` | **`0.6811`** (`+3.32 pp`) | **`0.6798`** (`+3.94 pp`) | `0.6667` | `0.4076` | `0.5760` | `0.4764` |
| Fine-tuned MiniLM (`primary_only`) | `689` | `0.7141` | `0.7109` | `0.6977` | `0.4297` | `0.5855` | `0.5065` |
| Fine-tuned MiniLM (`secondary_only`) | `606` | `0.6436` | `0.6409` | `0.6331` | `0.3778` | `0.5814` | `0.4422` |
| Fine-tuned MiniLM (`benchmark_test`) | `965` | **`0.7161`** | **`0.7141`** | **`0.7007`** | `0.4359` | `0.6023` | `0.5233` |

**Conclusion (E5):** Fine-tuning MiniLM boosts **Main Topic Accuracy by `+3.32 pp`** and **Main Macro F1 by `+3.94 pp`** over the best Frozen MiniLM (`none`), reaching **`0.7161` Acc / `0.7141` Macro F1** on `benchmark_test` (`+6.82 pp` / `+7.37 pp` over Frozen on full test, and `+3.11 pp` / `+3.44 pp` over Frozen on `benchmark_test`). Meanwhile, the 45-way linear subtopic head under-converged over 4 CPU epochs with 30% masked untrusted subtopic labels (`0.4076` vs `0.4650`), pointing cleanly to either higher subtopic head LR/epochs or pairing the fine-tuned Main Topic encoder with exact convex/frozen subtopic heads.

---

## E6: Single Main Topic (`K=1`) vs Top-K Expansion (`K=2, 3`), Calibration & Abstention

- **Temperature Scaling (Val):** Main `T = 1.1509` (Val ECE `0.0562 → 0.0267`), Subtopic `T = 1.0572` (Val ECE `0.0373 → 0.0332`).

| Strategy | Main Acc | Main Macro F1 | Sub E2E Macro F1 | Joint Acc | Top-3 Sub Recall | Cascading Errors |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| `top_1_main` | `0.6811` | `0.6798` | `0.4082` | `0.4772` | `0.6471` | `413` |
| `top_2_main` | **`0.6873`** (`+0.62 pp`) | `0.6855` (`+0.57 pp`) | `0.4208` (`+1.26 pp`) | `0.4873` (`+1.01 pp`) | `0.7181` (`+7.10 pp`) | `405` |
| `top_3_main` | **`0.6873`** (`+0.62 pp`) | **`0.6891`** (`+0.93 pp`) | **`0.4260`** (`+1.78 pp`) | **`0.4880`** (`+1.08 pp`) | **`0.7189`** (`+7.18 pp`) | **`405`** |

### Abstention & `needs_review` (`top_2_main`)

| Min Main Conf | Min Joint Conf | Coverage | Needs Review | Accepted Main Acc | Accepted Main Macro F1 | Accepted Sub Macro F1 |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `0.00` | `0.00` | `100.00%` | `0` | `0.6873` | `0.6855` | `0.4208` |
| `0.45` | `0.25` | `82.08%` | `232` | `0.7413` (`+5.40 pp`) | `0.7462` (`+6.07 pp`) | `0.4584` |
| `0.60` | `0.35` | `59.38%` | `526` | `0.8023` (`+11.50 pp`) | `0.8127` (`+12.72 pp`) | `0.5432` |
| `0.75` | `0.50` | `31.27%` | `890` | `0.8864` (`+19.91 pp`) | `0.8984` (`+21.29 pp`) | `0.5999` |

**Conclusion (E6):** Top-K Main Topic expansion reduces cascading errors (`413 → 405`), increases Main Macro F1 (`+0.93 pp`), Subtopic E2E Macro F1 (`+1.78 pp`), and jumps **Top-3 Subtopic Recall by `+7.18 pp` (`0.6471 → 0.7189`)**. Calibrated confidence abstention cleanly trades coverage for reliability, raising accepted Main Macro F1 to **`0.8127`** at ~`59%` auto-accept coverage (routing ambiguous items to `needs_review`).

---

## E7: Subtopic Head Recovery (Isolating Encoder Drift vs Head Convergence — Vast.ai RTX 3060)

| Model Variant | Test Main Acc | Test Main Macro F1 | Test Sub E2E Macro F1 | Test Sub Oracle Macro F1 | Test Joint Acc |
| :--- | ---: | ---: | ---: | ---: | ---: |
| Frozen MiniLM + LogReg (Stage 2 `power_0.25`) | `0.6417` | `0.6343` | **`0.4650`** | **`0.7150`** | **`0.5398`** |
| Joint Fine-tuned MiniLM (Stage 3, 4 ep) | `0.6811` | `0.6798` | `0.4076` | `0.5760` | `0.4764` |
| `finetuned_encoder_logreg` | `0.6927` | `0.6912` | `0.4493` (`+4.17 pp`) | `0.5992` (`+2.32 pp`) | `0.5012` (`+2.48 pp`) |
| **`finetuned_encoder_trainable_head`** (8 ep, `lr=1e-3`) | **`0.6942`** | **`0.6954`** | `0.4535` (`+4.59 pp`) | `0.6265` (`+5.05 pp`) | `0.4981` |
| `frozen_encoder_trainable_heads` (8 ep, `lr=1e-3`) | `0.6185` | `0.5981` | `0.3753` | `0.6166` | `0.4764` |

**Conclusion (E7):** Both factors contribute, and E7 cleanly separates them:
1. **Head under-convergence (`+4.59 pp` E2E / `+5.05 pp` Oracle recovery):** Training the linear Subtopic head further (`8 epochs, lr=1e-3`) or solving convex `LogisticRegression` on the fine-tuned encoder immediately recovers Subtopic E2E Macro F1 (`0.4076 → 0.4535`) and boosts Main Macro F1 (`0.6798 → 0.6954`).
2. **Encoder representation shift (`-8.85 pp` to `-11.58 pp` Oracle ceiling vs Frozen):** Even after head recovery, the fine-tuned encoder's Subtopic Oracle F1 (`0.5992–0.6265`) remains lower than the frozen MiniLM (`0.7150`), showing that joint fine-tuning compresses fine-grained within-Main-Topic subtopic distances while expanding 11-way Main Topic separability (`+6.11 pp` Main Macro F1 over Frozen `power_0.25`).

---

## E8: Multi-Task Loss Weight Ablation ($L = L_{\text{main}} + \lambda L_{\text{sub}}$ — Vast.ai RTX 3060)

| $\lambda$ | Best Epoch | Val Main F1 | Val Sub E2E F1 | Test Main Acc | Test Main Macro F1 | Test Sub E2E Macro F1 | Test Sub Oracle Macro F1 | Test Joint Acc |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `0.25` | `3` | **`0.7148`** | `0.3743` | `0.6896` | `0.6911` | `0.3697` | `0.5243` | `0.4548` |
| `0.50` | `4` | `0.7096` | `0.4212` | **`0.6919`** | **`0.6924`** | `0.3977` | `0.5586` | `0.4749` |
| **`1.00`** | `4` | `0.7100` | `0.4553` | `0.6857` | `0.6846` | **`0.4264`** | `0.6066` | **`0.4903`** |
| `2.00` | `4` | `0.7089` | **`0.4764`** | `0.6749` | `0.6758` | `0.4243` | **`0.6144`** | **`0.4903`** |

**Conclusion (E8):** Increasing $\lambda$ monotonically raises Subtopic Oracle Macro F1 (`0.5243 → 0.6144`, **`+9.01 pp`**) at a modest Main Topic trade-off (`0.6924 → 0.6758`, `-1.66 pp`). $\lambda = 1.00$ yields the best joint balance (`0.4903` Joint Acc, `0.4264` Sub E2E F1).

---

## E9: Top-K Metric Validation (`test`, `1,295` samples)

- **Invariants:** `0` hierarchy violations, `0` joint-probability mismatches, `0` non-monotonic candidate lists.
- **Pure Main Topic Top-K Recall:** Top-1 = `0.6811` | Top-2 = **`0.8625`** (`+18.14 pp`) | Top-3 = **`0.9359`** (`+25.48 pp`).
- **Joint MAP Expansion (`K=2, 3` vs `K=1`):** `top_2_main` recovers `25` cascading errors at Top-1 and **`134 / 413`** inside Top-3 (`Top-3 Sub Recall`: `0.6471 → 0.7181`); `top_3_main` recovers `26` at Top-1 and **`139 / 413`** inside Top-3 (`Top-3 Sub Recall`: `0.7189`, `Sub E2E Macro F1`: `0.4082 → 0.4260`).

---

## E10: Selective Prediction & Risk–Coverage (`val`-Selected Thresholds Evaluated on `test`)

- **AURC (Main / Joint):** Val `0.1728 / 0.2808` | Test `0.1746 / 0.3000`.

| Target Val Cov | Threshold (`main`, `joint`) | Val Cov | Test Cov | Needs Review | Test Main Acc | Test Main Macro F1 | Test Sub Macro F1 | Test Joint Acc | Error Capture |
| ---: | :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `90%` | `(0.35, 0.25)` | `90.97%` | `86.95%` | `169` | `0.7256` | `0.7276` | `0.4477` | `0.5275` | `19.88%` |
| `80%` | `(0.45, 0.30)` | `80.56%` | `76.53%` | `304` | `0.7508` | `0.7576` | `0.4759` | `0.5621` | `34.64%` |
| `70%` | `(0.60, 0.30)` | `70.37%` | `64.79%` | `456` | `0.7926` | `0.8036` | `0.4939` | `0.5948` | `48.80%` |
| `60%` | `(0.65, 0.35)` | `60.03%` | `54.21%` | `593` | `0.8234` | `0.8345` | `0.5487` | `0.6368` | `61.60%` |
| `50%` | `(0.70, 0.40)` | `50.93%` | `43.86%` | `727` | `0.8592` | `0.8677` | `0.5520` | `0.6796` | `72.59%` |
