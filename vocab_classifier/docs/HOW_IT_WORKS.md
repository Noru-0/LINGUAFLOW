# Hướng Dẫn Toàn Diện: Từ Dữ Liệu Thô Đến Hệ Thống Phân Loại Từ Vựng Trên Web (`vocab-classifier v1.0.0`)

Tài liệu này giải thích chi tiết quy trình xây dựng, kiến trúc mô hình, các kỹ thuật cốt lõi, tiêu chí đánh giá và cách triển khai thực tế mô hình **Frozen MiniLM + Calibrated Logistic Regression (`vocab-classifier-v1.0.0`)** vào ứng dụng web **LinguaFlow**.

---

## Tổng Quan Luồng Hệ Thống Đầu-Cuối

```text
[1. Dữ liệu thô] ──► [2. Làm sạch & Taxonomy] ──► [3. Thử nghiệm & Chọn Kiến trúc]
                                                               │
[6. Web App (Vercel + Supabase)] ◄── [5. FastAPI trên Cloud Run] ◄── [4. Release v1.0.0 (.zip + SHA-256)]
```

---

## 1. Kiến Trúc Mô Hình (Model Architecture)

Trong quá trình nghiên cứu, nhóm thiết kế và đối chiếu **hai kiến trúc phân loại phân cấp 2 tầng** cùng giải quyết bài toán gán **1 trong 11 Main Topics** và **1 trong 45 Subtopics** hợp lệ:

### 1.1. Kiến trúc Production chính thức: `Frozen MiniLM + Hierarchical Logistic Regression` (`vocab-classifier-v1.0.0`)

```text
Input Text (Word + POS + Definition + Collocations + Examples)
        │
        ▼  Tokenize (max_length = 192)
Pretrained Encoder: sentence-transformers/all-MiniLM-L6-v2 (FROZEN)
        │  Attention-Masked Mean Pooling + L2 Normalization
        ▼
Dense Sentence Embedding h ∈ R^384
        │
        ├──────────────────────────────────────────────────────┐
        ▼                                                      ▼
Main Topic Classifier (11-class LogReg, C=2.0, power_0.25)     [Chọn Top-1 hoặc Top-3 Main Topic m]
        │  Log-probs -> Softmax(z / T_main), T_main = 0.8659   │
        ▼                                                      ▼
Main Probabilities P(m | x) ∈ R^11 ──────────────► Subtopic Classifier riêng của nhánh m
                                                   (1 trong 11 Subtopic LogReg độc lập, C=2.0, power_0.25)
                                                        │  Log-probs -> Softmax(z_sub / T_sub), T_sub = 0.4928
                                                        ▼
                                                   Conditional Subtopic P(s | x, m)
                                                        │
        ┌───────────────────────────────────────────────┘
        ▼
Joint Confidence Gate: P_joint = P(m* | x) * P(s* | x, m*)
   ├── P_main >= 0.60 AND P_joint >= 0.30  ──► status = "accepted" (tự động lưu)
   └── Ngược lại                           ──► status = "needs_review" + Top-3 gợi ý
```

**Vì sao thiết kế 11 bộ phân loại Subtopic tách riêng theo từng Main Topic?**
- Đảm bảo **ràng buộc phân cấp tuyệt đối ngay từ cấu trúc**: nhánh `env` chỉ huấn luyện và chấm điểm trên 5 subtopic `env.*`, không bao giờ dự đoán nhầm sang `tech.*` hay `biz.*` (`0` vi phạm hierarchy).
- Mỗi nhánh dùng bộ giải lồi (**convex optimization** qua `LogisticRegression`) trên không gian embedding `384` chiều nên hội tụ tối ưu toàn cục, nhanh (vài giây trên CPU) và không bị hiện tượng under-convergence ở các lớp hiếm như head neural 45 lớp.

### 1.2. Kiến trúc Neural End-to-End thử nghiệm đối chứng (`HierarchicalVocabClassifier`, `src/models/hierarchical_classifier.py`)

Dùng trong các thí nghiệm fine-tuning (**E5, E7, E8** trên GPU Vast.ai RTX 3060) để kiểm chứng xem fine-tuning encoder có tốt hơn giữ đóng băng không:

```text
Input Text ──► Trainable all-MiniLM-L6-v2 (Mean Pooling) ──► h ∈ R^384
                  │                                           │
                  ▼                                           │
        Main Head: Linear(384 -> 11) ──► main_probs           │
                  │                                           │
                  ▼  Main Conditioning Vector c ∈ R^64        │
             c = main_probs @ E_main (E_main ∈ R^{11 x 64})   │
                  │                                           │
                  └────────────────────► Concat [h; c] ∈ R^448
                                              │
                                              ▼
                                 Subtopic Head: Linear(448 -> 45)
                                              │
                                              ▼  Hierarchy Mask M[11 x 45] (gán -1e9 cho nhánh sai)
                                  Masked Subtopic Logits ∈ R^45
```

---

## 2. Các Kỹ Thuật Sử Dụng (Techniques & Design Decisions)

| Nhóm kỹ thuật | Kỹ thuật áp dụng | Mục đích & Hiệu quả thực tế |
| :--- | :--- | :--- |
| **Xử lý ngôn ngữ & Dữ liệu** | **Sense-level Explosion** (`extract.py`) | Tách mỗi từ đa nghĩa (`word-atlas.json`: `7,298` từ → `13,733` senses) thành bản ghi độc lập theo định nghĩa để `library` (thư viện sách vs thư viện code) không bị gộp chung một nhãn. |
| **Chống rò rỉ dữ liệu** | **Group-Stratified Split theo `word_id`** (`split.py`) | Toàn bộ các nghĩa của cùng một từ nằm chung 1 tập (`train` / `val` / `test` = `80/10/10`), **0% chồng chéo `word_id`**. |
| **Taxonomy & Chống ép nhãn** | **Nhánh `General Vocabulary` (`gen.*`)** | Bổ sung 4 subtopic chung (`gen.function`, `gen.linking`, `gen.auxiliary`, `gen.general`) và sửa heuristic phân loại theo ngữ nghĩa (khôi phục ~1,380 từ chuyên ngành bị gán nhầm về `edu`, `health`, `tech`). |
| **Biểu diễn ngữ nghĩa** | **Frozen Sentence Embedding (`all-MiniLM-L6-v2`) + `full` input** | Kết hợp `Word + POS + Definition + Collocations + Examples` (`max_length = 192`, Mean Pooling, L2-norm), tăng `+6.68 pp` Main Macro F1 và `+7.26 pp` Joint Acc so với chỉ dùng `word_pos_def`. |
| **Xử lý mất cân bằng lớp** | **Power Smoothing Class Weighting ($\alpha = 0.25$)** | Trọng số $w_c \propto (N / n_c)^{0.25}$ thay cho `balanced` ($\alpha = 1.0$), tránh dự đoán quá tay các lớp nhỏ (`urban`, `gov`) và nâng Test Joint Accuracy lên `0.5398` (`+4.17 pp` so với `balanced`). |
| **Huấn luyện đa nhiệm (E5/E8)** | **Masked Subtopic Loss** ($L = L_{\text{main}} + \lambda L_{\text{sub}}$) | Ẩn loss subtopic đối với các mẫu có nhãn phụ chưa đáng tin cậy để không làm nhiễu gradient khi fine-tuning encoder. |
| **Hiệu chỉnh xác suất** | **Temperature Scaling** (fit trên `val.jsonl`) | Chia logit cho nhiệt độ tối ưu ($T_{\text{main}} = 0.8659$, $T_{\text{sub}} = 0.4928$), giảm sai số hiệu chỉnh Subtopic `ECE` từ `0.1224` xuống **`0.0217`**. |
| **Suy luận chọn lọc** | **Top-K Candidate Expansion + Confidence Abstention** | Mặc định trả Top-1, đính kèm Top-3 mở rộng cho review/reranking; áp ngưỡng `Main >= 0.60` & `Joint >= 0.30` tách mẫu tự tin (`accepted`) khỏi mẫu mơ hồ (`needs_review`). |
| **Tối ưu hệ thống Web** | **Chunked Batch (`120` từ) + Batch SQL + Read-only DB Probe** | Tránh timeout 15s trên Cloud Run khi xử lý 426 câu dài (~14s) và loại bỏ ~1,278 query SQL / lock DDL `ACCESS EXCLUSIVE` khi cold-start Vercel + Supabase. |
| **Human-in-the-Loop** | **Non-destructive Verification (`predicted_*` vs `verified_*`)** | Khi người dùng chỉnh sửa chủ đề thẻ trên web, lưu riêng nhãn sửa + lịch sử review mà **không ghi đè mất dự đoán gốc** của model. |

---

## 3. Tiêu Chí Đánh Giá (Evaluation Metrics)

Hệ thống không chỉ đánh giá bằng Accuracy đơn thuần (dễ bị ảo do mất cân bằng lớp khi `gen` chiếm `297/1,295` mẫu còn `urban` chỉ có `23`), mà tách rõ **4 nhóm tiêu chí** trong `src/evaluation/metrics.py` và `final_model/evaluation/test_metrics.json`:

### 3.1. Nhóm tiêu chí Tầng 1 — Main Topic (11 lớp)
- **`Main Accuracy`:** Tỷ lệ dự đoán đúng Main Topic trên toàn tập.
- **`Main Macro F1` (Tiêu chí chính cho Tầng 1):** Trung bình cộng không trọng số của $F_1$ trên cả 11 Main Topics:
  $$\text{Macro F1} = \frac{1}{11} \sum_{c=1}^{11} F_{1,c}$$
  Giúp đảm bảo mô hình không bỏ rơi các chủ đề ít mẫu như `urban`, `gov`, `edu`.
- **`General vs Topical F1`:** Đo riêng $F_1$ nhị phân cho lớp `General Vocabulary` so với 10 chuyên ngành IELTS để kiểm soát ranh giới từ phổ thông vs từ học thuật.

### 3.2. Nhóm tiêu chí Phân cấp & Toàn hệ thống (45 lớp)
- **`Subtopic End-to-End (E2E) Macro F1`:** Điểm $F_1$ trung bình của cả 45 subtopic trong điều kiện chạy thật (nếu Main Topic bước 1 đoán sai thì Subtopic bước 2 chắc chắn sai — phản ánh trực tiếp ảnh hưởng của lỗi dây chuyền).
- **`Subtopic Oracle Main Macro F1`:** Điểm $F_1$ trung bình của 45 subtopic **khi giả định Main Topic đầu vào là đúng 100%**. Đây là thước đo trần năng lực phân tách chi tiết của không gian embedding và bộ phân loại subtopic.
- **`Joint Exact Match Accuracy` (Tiêu chí cốt lõi toàn hệ thống):** Tỷ lệ mẫu mà mô hình đoán đúng **đồng thời cả Main Topic lẫn Subtopic**:
  $$\text{Joint Acc} = \frac{1}{N} \sum_{i=1}^{N} \mathbb{I}(\hat{m}_i = m_i \land \hat{s}_i = s_i)$$
- **`Top-K Main Recall` & `Top-K Subtopic Recall` ($K=3$):** Tỷ lệ mẫu có đáp án đúng nằm trong 3 ứng viên đầu tiên do mô hình mở rộng (đánh giá khả năng hỗ trợ con người chọn nhanh khi review).

### 3.3. Nhóm tiêu chí Độ tin cậy & Selective Prediction (tách riêng khỏi Full Test)
- **`ECE` (Expected Calibration Error) & `NLL` (Negative Log-Likelihood):** Đo độ khớp giữa xác suất mô hình tự tin (confidence) và xác suất đúng thực tế (được tối ưu trên tập validation trước khi chốt ngưỡng).
- **`Coverage`:** Tỷ lệ mẫu vượt qua ngưỡng tin cậy (`Main >= 0.60` và `Joint >= 0.30`) để hệ thống **tự động chấp nhận (`accepted`)**. Phần còn lại (`1 - Coverage`) được chuyển sang **`needs_review`**.
- **`Accepted Main Macro F1 / Sub E2E Macro F1 / Joint Acc`:** Chất lượng thực tế đạt được trên nhóm mẫu tự động chấp nhận.
- **`Joint Error Capture Rate`:** Tỷ lệ lỗi sai của mô hình đã bị cơ chế `needs_review` **chặn lại thành công** trước khi lưu tự động.

> **Quy ước báo cáo khoa học:** Luôn báo cáo **Full Test (`100%` coverage)** và **Accepted Subset** thành hai bảng riêng biệt; mọi chênh lệch hiệu năng được ghi bằng **điểm phần trăm (`pp` — percentage points)** chứ không dùng `%` tương đối.

---

## 4. Kết Quả Thực Nghiệm & Quyết Định Chốt Mô Hình

### 4.1. So sánh tiến hóa mô hình (Baseline → Fine-tuning → Final Model)

1. **Baseline (`v1.1`):** `Frozen MiniLM + LogReg` (`Joint Acc = 0.5207`) vượt xa `TF-IDF + LogReg` (`0.3753`) và `TF-IDF + Linear SVM` (`0.3806`). Phân tích lỗi cho thấy `79.40%` lỗi subtopic là lỗi dây chuyền từ Main Topic.
2. **Trade-off của Fine-tuning (`v1.2.0`, `n = 1,295`):**
   - Fine-tuning toàn bộ MiniLM (E7) nâng `Main Macro F1` từ `0.6343` lên `0.6954` (**`+6.11 pp`**),
   - **Nhưng** làm `Sub Oracle Macro F1` giảm từ `0.7150` xuống `0.6265` (**`-8.85 pp`**) và `Joint Accuracy` giảm từ `0.5398` xuống `0.4981` (**`-4.17 pp`**).
   - Vì vậy, **Frozen MiniLM + Logistic Regression (`power_0.25`)** được chọn cho phiên bản production `v1.0.0` vì tối ưu toàn bộ chuỗi phân cấp.

### 4.2. Hiệu năng chính thức của `vocab-classifier-v1.0.0` (`test`, `n = 1,295`)

| Chế độ đánh giá | Coverage | Needs Review | Main Acc | Main Macro F1 | Sub E2E Macro F1 | Sub Oracle F1 | Joint Acc | Error Capture |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **Full Test Set (100%)** | `100.00%` (`1,295`) | `0` | `0.6417` | `0.6343` | `0.4650` | `0.7150` | `0.5398` | — |
| **Accepted Subset (`0.60 / 0.30`)** | `57.76%` (`748`) | `547` (`42.24%`) | **`0.7901`** | **`0.7815`** | **`0.5728`** | — | **`0.6725`** | **`58.89%`** |
| **High-Precision Ref (`0.65 / 0.35`)** | `50.12%` (`649`) | `646` (`49.88%`) | `0.8197` | `0.8097` | `0.5888` | — | `0.6934` | `66.61%` |

- `Top-3 Main Recall`: **`0.9259`** | `Top-3 Subtopic Recall`: **`0.8193`** | `General vs Topical F1`: **`0.6598`**.

---

## 5. Quy Trình Đóng Gói, Deploy & Tích Hợp Vào Web LinguaFlow

### Bước A — Đóng gói bất biến (`vocab-classifier-v1.0.0`)
1. `python -m src.training.finalize_model` huấn luyện Frozen MiniLM + 12 LogReg classifiers (`1 Main + 11 Sub`), fit Temperature Scaling trên `val.jsonl`, chạy đánh giá đúng 1 lần trên `test.jsonl` và xuất vào `final_model/`.
2. `python -m src.training.release_artifact package --version 1.0.0` nén toàn bộ binary + config thành **`vocab-classifier-v1.0.0.zip`** (`83.7 MB`) kèm mã SHA-256 và `manifest.json`, phát hành tại GitHub Release `vocab-classifier-v1.0.0` (không đẩy binary nặng vào Git).

### Bước B — Đóng gói FastAPI Microservice & Deploy lên Google Cloud Run
1. Chuẩn hóa 4 module trong `vocab_classifier/`: `src/schemas.py`, `src/preprocessing.py` (chặn input rỗng / policy thiếu definition / xử lý độc lập từng sense), `src/postprocessing.py` (kiểm tra hierarchy invariant), `src/predictor.py`, và `api/routes.py` (`/health`, `/model-info`, `/predict`, `/predict/batch`, `/review/*`).
2. Kiểm chứng toàn diện bằng **37 unit & integration tests** (`tests/test_api_and_integration.py`) bao phủ từ đa nghĩa, batch, reload, thiếu artifact, ngưỡng abstention và luồng human review.
3. Build bằng `vocab_classifier/Dockerfile` (`python:3.12-slim` + PyTorch CPU + tự động tải & kiểm tra SHA-256 `v1.0.0.zip`) và deploy lên **Google Cloud Run** (`asia-southeast1`, `2 GiB RAM`, `2 vCPU`):
   `https://vocab-classifier-745665682684.asia-southeast1.run.app`

### Bước C — Tích hợp vào Web App (Next.js 16 + Vercel + Supabase)
1. **Thêm / import thẻ mới (`POST /api/decks/[id]/cards`):** Chỉ lưu từ vựng + enrich nghĩa/IPA/ví dụ/ảnh/audio, giữ thẻ ở trạng thái chưa phân loại để người dùng chủ động gom nhóm.
2. **Phân loại trên trang `/topics` (`POST /api/topics/auto-cluster` + `TopicExplorer.tsx`):**
   - Hiển thị đủ **11 Chủ đề lớn (`10 IELTS + General Vocabulary`)** và **45 Chủ đề nhỏ**.
   - Nút duy nhất **`⚡ Phân Loại X Từ Mới (Model)`** chỉ kích hoạt khi còn từ chưa có trong `card_topics` (tự động khóa lại khi `0` từ mới).
   - Chia nhỏ các từ chưa phân loại thành **chunk `120` từ** (timeout `45s`) gửi tới Cloud Run `/predict/batch`; nếu Cloud Run offline sẽ tự fallback sang Gemini LLM / keyword.
   - Ghi kết quả hàng loạt (batch SQL) vào `card_topics` (`predicted_main_topic`, `predicted_subtopic`, `prediction_status`, `model_version`) và `card_topic_review_history`.
3. **Human Review (`PATCH /api/cards/[id]/topics`):** Khi người dùng tự chỉnh lại chủ đề cho thẻ, giữ nguyên nhãn dự đoán gốc của model (`predicted_*`) và bật `human_verified = true` kèm lịch sử chỉnh sửa.
4. **Kết quả chạy thật trên dữ liệu người dùng (`426` từ):**
   - Chạy thành công trên Vercel Production + Cloud Run với **`engine: "vocab_classifier_v1"`**, **`mlError: null`**.
   - **`249/426`** từ tự động chấp nhận (**`58.45%`**) và **`177/426`** từ gắn cờ `needs_review` (**`41.55%`**) — sát với tỷ lệ `57.76% / 42.24%` trên tập test; tách riêng **88 từ** vào `General Vocabulary` và phân bổ vào **39 subtopics** chuyên biệt.
