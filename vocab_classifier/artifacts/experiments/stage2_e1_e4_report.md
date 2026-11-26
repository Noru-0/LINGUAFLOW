# Stage 2 Experiments (E1–E4): Frozen MiniLM + Logistic Regression

## E1: Class Weight Ablation (`full` input)

| Weighting | Val Main Macro F1 | Test Main Acc | Test Main Macro F1 | Test General F1 | Test Sub E2E Macro F1 | Test Joint Acc |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| `balanced` | 0.5990 | 0.6054 | 0.5981 | 0.6274 | 0.4367 | 0.4981 |
| `power_0.75` | 0.6086 | 0.6216 | 0.6172 | 0.6435 | 0.4437 | 0.5097 |
| `power_0.50` | 0.6258 | 0.6371 | 0.6316 | 0.6596 | 0.4572 | 0.5274 |
| `power_0.25` | 0.6291 | 0.6417 | 0.6343 | 0.6598 | 0.4650 | 0.5398 |
| `none` | 0.6133 | 0.6479 | 0.6404 | 0.6745 | 0.4636 | 0.5444 |

## E2: Input Ablation (`weighting=power_0.25`)

| Input Variant | Val Main Macro F1 | Test Main Acc | Test Main Macro F1 | Test Sub E2E Macro F1 | Test Sub Oracle Macro F1 | Test Joint Acc |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| `full` | 0.6291 | 0.6417 | 0.6343 | 0.4650 | 0.7150 | 0.5398 |
| `word_pos_def_col` | 0.5897 | 0.6239 | 0.6058 | 0.4296 | 0.6816 | 0.5050 |
| `word_pos_def_ex` | 0.6184 | 0.6479 | 0.6362 | 0.4440 | 0.6801 | 0.5236 |
| `word_pos_def` | 0.5521 | 0.5846 | 0.5675 | 0.3986 | 0.6801 | 0.4672 |

## E3: General-Label Correction (`v1.1` vs `v1.2` corrected)

| Setting | Main Acc | Main Macro F1 | Sub E2E Macro F1 |
| :--- | ---: | ---: | ---: |
| `balanced` (v1.1 pre-correction) | 0.6194 | 0.5975 | 0.4442 |
| `balanced` (v1.2 corrected) | 0.6054 (-1.40 pp) | 0.5981 (+0.06 pp) | 0.4367 |
| `none` (v1.1 pre-correction) | 0.6752 | 0.6411 | 0.4855 |
| `none` (v1.2 corrected) | 0.6479 (-2.73 pp) | 0.6404 (-0.07 pp) | 0.4636 |

## E4: Primary vs Secondary Sense Evaluation (`power_0.25` + `full`)

| Test Subset | Samples | Main Acc | Main Macro F1 | Sub E2E Macro F1 | Sub Oracle Macro F1 | Joint Acc |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| `all_test` | 1295 | 0.6417 | 0.6343 | 0.4650 | 0.7150 | 0.5398 |
| `primary_only` | 689 | 0.6821 | 0.6824 | 0.5016 | 0.7320 | 0.5747 |
| `secondary_only` | 606 | 0.5957 | 0.5721 | 0.4094 | 0.6957 | 0.5000 |
| `audited_clean_benchmark` | 965 | 0.6850 | 0.6797 | 0.5111 | 0.7409 | 0.5855 |
