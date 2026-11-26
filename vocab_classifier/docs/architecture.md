# Multi-Task Hierarchical Vocabulary Classifier Architecture

## 1. Problem Formulation

Given an English vocabulary sense formatted as structured text (`Word + POS + Definition + Context`), the classifier solves two coupled hierarchical tasks aligned with [`data/taxonomy/taxonomy.json`](../data/taxonomy/taxonomy.json):

| Task | Input | Output | Classes |
| :--- | :--- | :--- | :---: |
| **Task 1: Main Topic Classification** | Vocabulary sense (`Word + POS + Definition + Collocations + Examples`) | 1 of 11 Main Topics (10 IELTS topical domains + 1 `General Vocabulary` branch) | **11** |
| **Task 2: Subtopic Classification** | Vocabulary sense + Main Topic representation | Child Subtopic strictly belonging to the Main Topic | **45** (`41` topical + `4` general) |

### Example Input & Expected Output

Input:
```text
Word: biodiversity (noun)
Definition: The variety of plant and animal life in the world.
```

Expected Output:
```json
{
  "main_topic": "Environment & Nature",
  "main_topic_id": "env",
  "topic_type": "topical",
  "subtopic": "Biodiversity & Wildlife Conservation",
  "subtopic_id": "env.wildlife"
}
```

## 2. Model Architecture (`HierarchicalVocabClassifier`)

```text
Input Text (Word + POS + Definition + Context)
        │
        ▼
Pretrained Encoder: sentence-transformers/all-MiniLM-L6-v2
        │  (Attention-masked Mean Pooling)
        ▼
Sentence Embedding h ∈ R^384
        ├───────────────────────────────────────────┐
        ▼                                           │
Main Topic Head: Linear(384 -> 11)                  │
        │                                           │
        ├──► main_logits ∈ R^11                     │
        │                                           │
        ▼  Soft / Ground-Truth Conditioning         │
Main Conditioning Vector c ∈ R^64                   │
(main_probs @ E_main, E_main ∈ R^{11×64})           │
        │                                           │
        └──────────────► Concat [h; c] ∈ R^448 ◄────┘
                                │
                                ▼
                Subtopic Head: Linear(448 -> 45)
                                │
                                ▼
                   raw_subtopic_logits ∈ R^45
                                │
                                ▼  Apply Hierarchy Mask M[main_id, :] ∈ {0, 1}^45
                   masked_subtopic_logits ∈ R^45
```

### Key Design Choices
1. **Shared 384-d MiniLM Encoder**: Lightweight (22M parameters), fast CPU/GPU training and inference, outputs a 384-dimensional semantic embedding via attention-masked mean pooling.
2. **Main Topic Conditioning (`c ∈ R^64`)**:
   - During training, the subtopic head receives `[h; c]` where `c` is projected from either the ground-truth main topic (teacher forcing) or `softmax(main_logits)`.
   - During inference, if a `main_topic` is known/given, `c` uses that `main_topic`; otherwise it uses the predicted `main_topic` probability distribution.
3. **Hard Hierarchy Constraint Mask (`M ∈ {0, 1}^{11×45}`)**:
   - Constructed directly from `taxonomy.json` so every subtopic `j` has `sum_i M[i, j] == 1`.
   - Invalid child subtopics for the selected/predicted `main_topic` are masked to `-1e9` before `softmax`/`argmax`, guaranteeing 100% taxonomy consistency (e.g., if `main_topic == "General Vocabulary"`, only `gen.function`, `gen.linking`, `gen.auxiliary`, `gen.general` can be predicted).
4. **Multi-Task Loss**:
   $$\mathcal{L} = \lambda_{\text{main}} \, \text{CE}(\hat{y}_{\text{main}}, y_{\text{main}}) + \lambda_{\text{sub}} \, \text{CE}(\hat{y}_{\text{sub}}^{\text{masked}}, y_{\text{sub}})$$
   Masking invalid subtopics under the ground-truth `main_topic` during subtopic loss computation (`mask_subtopic_loss = true`) aligns training directly with hierarchical Task 2.
