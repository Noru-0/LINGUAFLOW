# E8: Multi-Task Loss Weight Ablation ($L = L_{main} + \lambda L_{sub}$)

| $\lambda$ | Best Epoch | Val Main F1 | Val Sub E2E F1 | Test Main Acc | Test Main Macro F1 | Test Sub E2E Macro F1 | Test Sub Oracle Macro F1 | Test Joint Acc |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0.25 | 3 | 0.7148 | 0.3743 | 0.6896 | 0.6911 | 0.3697 | 0.5243 | 0.4548 |
| 0.50 | 4 | 0.7096 | 0.4212 | 0.6919 | 0.6924 | 0.3977 | 0.5586 | 0.4749 |
| 1.00 | 4 | 0.7100 | 0.4553 | 0.6857 | 0.6846 | 0.4264 | 0.6066 | 0.4903 |
| 2.00 | 4 | 0.7089 | 0.4764 | 0.6749 | 0.6758 | 0.4243 | 0.6144 | 0.4903 |
