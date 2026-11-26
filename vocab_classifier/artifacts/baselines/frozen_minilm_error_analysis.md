# Error Analysis: Primary Baseline (`Frozen MiniLM + Logistic Regression`)

Evaluated on `test` (`1327` samples).

## 1. Cascading Error Decomposition (Main Topic -> Subtopic)

| Outcome Category | Count | Share |
| :--- | ---: | ---: |
| Joint Correct (Main OK & Subtopic OK) | 691 | 52.07% |
| Subtopic-only Error (Main OK, Subtopic Wrong) | 131 | 9.87% |
| **Cascading Error (Main Wrong -> Subtopic Wrong)** | **505** | **38.06%** |

- **Share of all Subtopic errors caused by Main Topic errors:** `79.40%`
- **Cascading errors immediately fixed if Main Topic were Oracle:** `420 / 505` (`83.17%`)

## 2. Main Topic Confusion Matrix (11 x 11)

| True \ Pred | env | tech | biz | edu | health | soc | urban | travel | life | gov | gen |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **env** | 70 | 6 | 1 | 0 | 1 | 0 | 0 | 2 | 5 | 0 | 2 |
| **tech** | 0 | 51 | 2 | 0 | 1 | 2 | 2 | 0 | 5 | 0 | 2 |
| **biz** | 1 | 2 | 68 | 5 | 4 | 2 | 2 | 0 | 4 | 5 | 7 |
| **edu** | 0 | 5 | 4 | 22 | 3 | 4 | 0 | 0 | 0 | 0 | 5 |
| **health** | 0 | 0 | 0 | 2 | 47 | 1 | 0 | 1 | 8 | 0 | 0 |
| **soc** | 6 | 2 | 6 | 8 | 2 | 126 | 4 | 2 | 9 | 16 | 15 |
| **urban** | 0 | 0 | 1 | 0 | 1 | 1 | 18 | 0 | 1 | 0 | 0 |
| **travel** | 2 | 1 | 2 | 0 | 0 | 1 | 0 | 38 | 1 | 0 | 2 |
| **life** | 11 | 15 | 14 | 8 | 20 | 5 | 11 | 11 | 129 | 5 | 23 |
| **gov** | 0 | 0 | 2 | 2 | 0 | 2 | 0 | 0 | 0 | 24 | 2 |
| **gen** | 10 | 30 | 28 | 26 | 15 | 24 | 11 | 6 | 35 | 10 | 229 |

### Top Confused Main Topic Pairs

| True Main Topic | Predicted Main Topic | Errors | % of True Class |
| :--- | :--- | ---: | ---: |
| General Vocabulary (`gen`) | Daily Life & Personal Finance (`life`) | 35 | 8.2% |
| General Vocabulary (`gen`) | Science & Technology (`tech`) | 30 | 7.1% |
| General Vocabulary (`gen`) | Business, Work & Economy (`biz`) | 28 | 6.6% |
| General Vocabulary (`gen`) | Education & Academia (`edu`) | 26 | 6.1% |
| General Vocabulary (`gen`) | Society, Culture & Law (`soc`) | 24 | 5.7% |
| Daily Life & Personal Finance (`life`) | General Vocabulary (`gen`) | 23 | 9.1% |
| Daily Life & Personal Finance (`life`) | Health, Medicine & Wellness (`health`) | 20 | 7.9% |
| Society, Culture & Law (`soc`) | Global Politics & Humanitarian (`gov`) | 16 | 8.2% |
| Society, Culture & Law (`soc`) | General Vocabulary (`gen`) | 15 | 7.6% |
| Daily Life & Personal Finance (`life`) | Science & Technology (`tech`) | 15 | 5.9% |
| General Vocabulary (`gen`) | Health, Medicine & Wellness (`health`) | 15 | 3.5% |
| Daily Life & Personal Finance (`life`) | Business, Work & Economy (`biz`) | 14 | 5.6% |
| Daily Life & Personal Finance (`life`) | Environment & Nature (`env`) | 11 | 4.4% |
| Daily Life & Personal Finance (`life`) | Urbanization & Infrastructure (`urban`) | 11 | 4.4% |
| Daily Life & Personal Finance (`life`) | Travel & Hospitality (`travel`) | 11 | 4.4% |

## 3. Class Imbalance & Per-Class Performance

| Main Topic | Train Support | Test Support | Test Predicted | Precision | Recall | F1 |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| Urbanization & Infrastructure (`urban`) | 190 | 22 | 48 | 0.3750 | 0.8182 | 0.5143 |
| Global Politics & Humanitarian (`gov`) | 242 | 32 | 60 | 0.4000 | 0.7500 | 0.5217 |
| Education & Academia (`edu`) | 379 | 43 | 73 | 0.3014 | 0.5116 | 0.3793 |
| Travel & Hospitality (`travel`) | 379 | 47 | 60 | 0.6333 | 0.8085 | 0.7103 |
| Health, Medicine & Wellness (`health`) | 466 | 59 | 94 | 0.5000 | 0.7966 | 0.6144 |
| Science & Technology (`tech`) | 541 | 65 | 112 | 0.4554 | 0.7846 | 0.5763 |
| Environment & Nature (`env`) | 717 | 87 | 100 | 0.7000 | 0.8046 | 0.7487 |
| Business, Work & Economy (`biz`) | 818 | 100 | 128 | 0.5312 | 0.6800 | 0.5965 |
| Society, Culture & Law (`soc`) | 1417 | 196 | 168 | 0.7500 | 0.6429 | 0.6923 |
| Daily Life & Personal Finance (`life`) | 1984 | 252 | 197 | 0.6548 | 0.5119 | 0.5746 |
| General Vocabulary (`gen`) | 3373 | 424 | 287 | 0.7979 | 0.5401 | 0.6442 |

## 4. Label Quality & Polysemy Diagnostics

### By Sense Position (`sense_index`)
| Bucket | Samples | Main Errors | Main Error Rate |
| :--- | ---: | ---: | ---: |
| primary (sense_index=0) | 696 | 243 | 34.91% |
| secondary (sense_index>0) | 631 | 262 | 41.52% |

### By Label Source
| Label Source | Samples | Main Errors | Main Error Rate |
| :--- | ---: | ---: | ---: |
| `word_atlas_mapping` | 903 | 310 | 34.33% |
| `word_atlas_mapping+zero_shot_general` | 309 | 160 | 51.78% |
| `zero_shot_general` | 115 | 35 | 30.43% |

### By Raw `source_topic` (Top Error Rates)
| Source Topic | Samples | Main Errors | Main Error Rate |
| :--- | ---: | ---: | ---: |
| `media` | 12 | 9 | 75.00% |
| `sport` | 27 | 17 | 62.96% |
| `work` | 69 | 37 | 53.62% |
| `education` | 58 | 30 | 51.72% |
| `society` | 176 | 83 | 47.16% |
| `daily` | 396 | 175 | 44.19% |
| `emotion` | 26 | 10 | 38.46% |
| `government` | 39 | 14 | 35.90% |
| `technology` | 44 | 15 | 34.09% |
| `science` | 48 | 16 | 33.33% |
| `health` | 68 | 20 | 29.41% |
| `city` | 25 | 7 | 28.00% |

## 5. Sample Recoverable Cascading Errors (For Manual Inspection)

| Sample | POS | Sense | Source Topic | True Main -> Pred Main (Conf) | True Sub -> E2E / Oracle Sub | Definition |
| :--- | :--- | ---: | :--- | :--- | :--- | :--- |
| `sailing_002` | noun | 1 | `sport` | `life` -> `travel` (0.99) | `life.leisure` -> `travel.eco` / `life.leisure` | A scheduled journey or departure by a ship or ferry. |
| `sailing_001` | noun | 0 | `sport` | `life` -> `travel` (0.98) | `life.leisure` -> `travel.eco` / `life.leisure` | The activity of travelling in a boat powered by wind. |
| `physical_001` | adjective | 0 | `health` | `gen` -> `health` (0.97) | `gen.function` -> `health.diet` / `gen.function` | Relating to the body rather than the mind. |
| `spatial_001` | adjective | 0 | `science` | `gen` -> `urban` (0.97) | `gen.function` -> `urban.housing` / `gen.function` | relating to space and the positions of objects within it |
| `strait_002` | noun | 1 | `nature` | `env` -> `travel` (0.95) | `env.disaster` -> `travel.aviation` / `env.disaster` | a situation involving serious difficulty, especially lack of money |
| `tolerable_001` | adjective | 0 | `daily` | `life` -> `health` (0.94) | `life.family` -> `health.disease` / `life.family` | unpleasant but possible to endure |
| `propellent_002` | adjective | 1 | `technology` | `gen` -> `tech` (0.94) | `gen.auxiliary` -> `tech.cyber` / `gen.auxiliary` | Providing the force that moves something forward |
| `invention_002` | noun | 1 | `technology` | `gen` -> `tech` (0.93) | `gen.general` -> `tech.ai` / `gen.general` | the act of creating something that did not exist before |
| `maths_001` | noun | 0 | `education` | `gen` -> `edu` (0.93) | `gen.function` -> `edu.exams` / `gen.function` | The study of quantities, shapes, and relationships using logical rules |
| `carbohydrate_001` | noun | 0 | `health` | `gen` -> `health` (0.93) | `gen.general` -> `health.diet` / `gen.general` | A substance such as sugar or starch that provides energy. |
| `mathematical_001` | adjective | 0 | `education` | `gen` -> `tech` (0.93) | `gen.function` -> `tech.bio` / `gen.function` | relating to mathematics |
| `instructive_001` | adjective | 0 | `education` | `gen` -> `edu` (0.92) | `gen.general` -> `edu.pedagogy` / `gen.general` | providing useful knowledge or helping someone understand something |
| `strait_001` | noun | 0 | `nature` | `env` -> `travel` (0.91) | `env.disaster` -> `travel.aviation` / `env.disaster` | a narrow stretch of sea connecting two larger areas |
| `english_002` | adjective | 1 | `education` | `gen` -> `edu` (0.91) | `gen.function` -> `edu.discourse` / `gen.function` | relating to the English language, England or its people |
| `invention_001` | noun | 0 | `technology` | `gen` -> `tech` (0.90) | `gen.general` -> `tech.ai` / `gen.general` | something new that someone has designed or created |
