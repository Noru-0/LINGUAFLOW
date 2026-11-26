# Final Production Model Package (`vocab_classifier`)

Official hierarchical vocabulary classifier selected from experiments E1–E10:
- **Encoder:** `sentence-transformers/all-MiniLM-L6-v2` (frozen 384-d mean-pooled L2-normalized embeddings)
- **Main Topic Classifier:** `LogisticRegression` (11 classes: 10 IELTS topical domains + `General Vocabulary`, `C=2.0`, `power_0.25` class weighting)
- **Subtopic Classifiers:** Per-`main_topic` `LogisticRegression` (45 subtopics total, `C=2.0`, `power_0.25` class weighting, strict hierarchy constraint)
- **Inference:** Top-1 default prediction, Top-3 candidate expansion for review/reranking, temperature scaling (`T_main=0.8659`, `T_sub=0.4928`), selective abstention (`Main >= 0.60`, `Joint >= 0.30`)

## Evaluation Summary (`test`, `n=1295`)

### Full Test Set (100% Coverage)
| Metric | Score |
| :--- | ---: |
| Main Accuracy | `0.6417` |
| Main Macro F1 | `0.6343` |
| General vs Topical F1 | `0.6598` |
| Subtopic E2E Macro F1 | `0.4650` |
| Subtopic Oracle Macro F1 | `0.7150` |
| Joint Exact Match Accuracy | `0.5398` |
| Top-3 Main Recall | `0.9259` |
| Top-3 Subtopic Recall (via Top-3 Main) | `0.8193` |

### Selective Prediction (`Main >= 0.60, Joint >= 0.30`, Fixed from Validation)
| Profile | Coverage | Needs Review | Main Acc | Main Macro F1 | Sub E2E Macro F1 | Joint Acc |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| **Default Production (`70%` target)** | `57.76%` | `547` | `0.7901` | `0.7815` | `0.5728` | `0.6725` |
| High-Precision Reference (`0.65, 0.35`) | `50.12%` | `646` | `0.8197` | `0.8097` | `0.5888` | `0.6934` |

## Reproducibility Metadata

- **Dataset Version:** `1.2.0` (`seed=42`, group-stratified 80/10/10 split by `word_id`)
- **Python / Libraries:** Python `3.12.7`, torch `2.7.1+cpu`, transformers `4.46.3`, scikit-learn `1.5.1`, numpy `1.26.4`, joblib `1.5.1`
- **Checksums (SHA-256):**
  - `taxonomy.json`: `2eedc1cf8f196e557c08f3ae4737d3e67757964f59c0f37e28847432a9ca8043`
  - `train.jsonl`: `b23e848a078e4a4cbc55ea42541c24a6107807d437a288aa217a670cdffb4b10`
  - `val.jsonl`: `dec32da63681abf141f3372244e2d621c0915db3ba25d138d3b82aacc0d9db32`
  - `test.jsonl`: `95e600bc7d66a98d1b2dced875db927c9a8faddb810940155b4737a954aa41f4`

## Usage

```python
from src.inference.final_predictor import ProductionVocabPredictor

predictor = ProductionVocabPredictor.from_dir("final_model")
results = predictor.predict([
    {
        "word": "biodiversity",
        "pos": "noun",
        "definition": "The variety of plant and animal life in the world.",
        "collocations": ["marine biodiversity", "protect biodiversity"],
        "examples": ["Deforestation threatens global biodiversity."],
    }
])
print(results[0])
```
