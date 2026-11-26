# Stage 4 & E6: Hierarchical Top-K Inference, Calibration & Abstention

## Temperature Calibration (Validation Set)
- Main Temperature: `1.1509` | Val NLL: `0.8143` -> `0.8031` | ECE: `0.0562` -> `0.0267`
- Subtopic Temperature: `1.0572` | Val ECE: `0.0373` -> `0.0332`

## E6: Single Main Topic (`K=1`) vs Top-K Expansion (`K=2, 3`) on Test Set

| Strategy | Main Acc | Main Macro F1 | Sub E2E Acc | Sub E2E Macro F1 | Joint Acc | Top-3 Sub Recall | Cascading Errors |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `top_1_main` | 0.6811 | 0.6798 | 0.4772 | 0.4082 | 0.4772 | 0.6471 | 413 |
| `top_2_main` | 0.6873 | 0.6855 | 0.4873 | 0.4208 | 0.4873 | 0.7181 | 405 |
| `top_3_main` | 0.6873 | 0.6891 | 0.4880 | 0.4260 | 0.4880 | 0.7189 | 405 |

## Abstention & `needs_review` Trade-off (`top_2_main`)

| Min Main Conf | Min Joint Conf | Coverage | Needs Review | Accepted Main Acc | Accepted Main Macro F1 | Accepted Sub Macro F1 |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0.00 | 0.00 | 100.00% | 0 | 0.6873 | 0.6855 | 0.4208 |
| 0.45 | 0.25 | 82.08% | 232 | 0.7413 | 0.7462 | 0.4584 |
| 0.60 | 0.35 | 59.38% | 526 | 0.8023 | 0.8127 | 0.5432 |
| 0.75 | 0.50 | 31.27% | 890 | 0.8864 | 0.8984 | 0.5999 |
