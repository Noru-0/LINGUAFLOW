# E9: Top-K Metric Validation

## Mathematical & Hierarchy Invariants (`test`)
- Hierarchy violations (`subtopic` parent != `main_topic`): `0`
- Joint probability mismatches: `0`
- Non-monotonic Main / Joint candidates: `0` / `0`

## Pure Main Topic Top-K Recall
- Top-1 Recall: `0.6811` | Top-2 Recall: `0.8625` | Top-3 Recall: `0.9359`

## Candidate Expansion Comparison (Single Main vs Joint MAP Top-K)

| Strategy | Main Acc | Main Macro F1 | Sub E2E Acc | Sub E2E Macro F1 | Joint Acc | Top-2 Sub Recall | Top-3 Sub Recall | K=1 Cascading Recovered (Top-1 / Top-3) |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `top_1_main` | 0.6811 | 0.6798 | 0.4772 | 0.4082 | 0.4772 | 0.5884 | 0.6471 | 0 / 0 |
| `top_2_main` | 0.6873 | 0.6855 | 0.4873 | 0.4208 | 0.4873 | 0.6440 | 0.7181 | 25 / 134 |
| `top_3_main` | 0.6873 | 0.6891 | 0.4880 | 0.4260 | 0.4880 | 0.6448 | 0.7189 | 26 / 139 |
