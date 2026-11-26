# Baseline Models Benchmark Results

## Test Set Summary

| Model | Main Acc | Main Macro F1 | Main Weighted F1 | General F1 | Subtopic E2E Macro F1 | Subtopic Oracle Macro F1 | Joint Acc |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| TF-IDF + Logistic Regression (`tfidf_logreg`) | 0.5795 | 0.5659 | 0.5807 | 0.6309 | 0.3048 | 0.5222 | 0.3753 |
| TF-IDF + Linear SVM (`tfidf_svm`) | 0.5901 | 0.5704 | 0.5898 | 0.6462 | 0.3015 | 0.4965 | 0.3806 |
| Frozen MiniLM + Logistic Regression (`frozen_minilm_logreg`) | 0.6194 | 0.5975 | 0.6253 | 0.6442 | 0.4442 | 0.7622 | 0.5207 |

## Validation Set Summary

| Model | Main Acc | Main Macro F1 | Subtopic E2E Macro F1 | Subtopic Oracle Macro F1 | Fit Time (s) |
| :--- | ---: | ---: | ---: | ---: | ---: |
| TF-IDF + Logistic Regression (`tfidf_logreg`) | 0.5720 | 0.5758 | 0.3611 | 0.5880 | 8.52 |
| TF-IDF + Linear SVM (`tfidf_svm`) | 0.5674 | 0.5471 | 0.3354 | 0.5707 | 0.94 |
| Frozen MiniLM + Logistic Regression (`frozen_minilm_logreg`) | 0.5886 | 0.5729 | 0.4753 | 0.8047 | 1.00 |
