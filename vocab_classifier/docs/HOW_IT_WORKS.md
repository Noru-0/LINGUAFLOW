# Hướng Dẫn Toàn Diện: Từ Dữ Liệu Thô Đến Hệ Thống Phân Loại Từ Vựng Trên Web (`vocab-classifier v1.0.0`)

Tài liệu này tóm tắt toàn bộ quy trình xây dựng, thực nghiệm, đóng gói, triển khai (deploy) và tích hợp mô hình phân loại chủ đề từ vựng tiếng Anh **Frozen MiniLM + Calibrated Logistic Regression (`vocab-classifier-v1.0.0`)** vào ứng dụng **LinguaFlow**.

---

## Tổng Quan Kiến Trúc Đầu-Cuối

```text
[1. Dữ liệu thô] ──► [2. Làm sạch & Taxonomy] ──► [3. Thử nghiệm & Chọn Model]
                                                               │
[6. Web App (Vercel + Supabase)] ◄── [5. FastAPI trên Cloud Run] ◄── [4. Release v1.0.0 (.zip + SHA-256)]
```

---

## Bước 1: Định Nghĩa Bài Toán & Thiết Kế Taxonomy

### 1.1. Phân loại theo **từng nghĩa (Sense-level)** thay vì theo mặt chữ
Một từ tiếng Anh thường có nhiều nghĩa hoàn toàn khác nhau (**đa nghĩa / polysemy**). Ví dụ:
- `library` *(n.)*: *"A building with collections of books..."* → **Education & Academia (`edu.university`)**
- `library` *(n.)*: *"A collection of precompiled software routines..."* → **Science & Technology (`tech.digital` / `tech.ai`)**

Vì vậy, đơn vị đầu vào của mô hình không phải chỉ là từ đơn lẻ, mà là **1 vocabulary sense** gồm đầy đủ ngữ cảnh:
```text
Word: {word} ({pos})
Definition: {definition}
Collocations: {collocations}
Examples: {examples}
```

### 1.2. Hệ thống nhãn phân cấp 2 tầng (`taxonomy.json v1.1.0`)
- **Tầng 1 — 11 Chủ đề lớn (Main Topics):**
  - **10 chuyên ngành IELTS Academic (`topical`):** `env` (Môi trường), `tech` (Khoa học & Công nghệ), `biz` (Kinh doanh & Kinh tế), `edu` (Giáo dục & Học thuật), `health` (Sức khỏe & Y tế), `soc` (Xã hội, Văn hóa & Pháp luật), `urban` (Đô thị & Hạ tầng), `travel` (Du lịch & Hàng không), `life` (Đời sống & Tài chính cá nhân), `gov` (Chính trị toàn cầu & Nhân đạo).
  - **1 nhánh Từ vựng tổng quát (`general` — `gen`):** Giải quyết vấn đề *forced classification* (tránh ép các từ chức năng, liên từ, trợ động từ như `about`, `however`, `seem`, `significant` vào một chuyên ngành hẹp).
- **Tầng 2 — 45 Chủ đề nhỏ (Subtopics):** Gồm **41** nhánh chuyên ngành + **4** nhánh tổng quát (`gen.function`, `gen.linking`, `gen.auxiliary`, `gen.general`). Mọi dự đoán Subtopic bắt buộc phải thuộc đúng Main Topic cha.

---

## Bước 2: Xây Dựng & Làm Sạch Dữ Liệu (`Dataset v1.2.0`)

Pipeline xử lý nằm trong `vocab_classifier/src/data/`:

1. **Tách nghĩa (`extract.py`):** Đọc từ điển `data/raw/word-atlas.json` (`7,298` từ) → tách thành **`13,733` sense records** có `sample_id` định danh duy nhất; chuẩn hóa tag từ loại (`n.` → `noun`, `v.` → `verb`), loại bỏ phần chữ Trung dư trong ví dụ/collocations.
2. **Tiền xử lý (`preprocess.py`):** Chuẩn hóa Unicode (`NFKC`), khử trùng lặp `(word_id, pos, definition)`, gộp thành chuỗi `text` chuẩn.
3. **Sửa lỗi gán nhãn `General Vocabulary` (`subtopic_labeling.py`):** Phát hiện và sửa heuristic phân loại General theo ngữ nghĩa (không dựa máy móc vào từ loại), trả lại ~**1,380 từ chuyên ngành** (như `carbohydrate`, `maths`, `physical`, `invention`) từ nhóm `gen` về đúng các nhóm `edu`, `health`, `tech`.
4. **Chia tập chống rò rỉ dữ liệu (`split.py`):** Chia theo **`word_id` (group-stratified, `80 / 10 / 10`, `seed = 42`)**. Toàn bộ các nghĩa của cùng một từ bắt buộc nằm chung một tập, đảm bảo **0% chồng chéo `word_id`** giữa `train`, `val`, `test`:
   - `train.jsonl`: `10,392` senses (`5,577` từ)
   - `val.jsonl`: `1,296` senses (`697` từ)
   - `test.jsonl`: `1,295` senses (`697` từ)

---

## Bước 3: Thử Nghiệm So Sánh & Chọn Kiến Trúc Tối Ưu

Thay vì nhảy thẳng vào fine-tuning mô hình nặng, nhóm tiến hành chuỗi thí nghiệm có kiểm soát (xem số liệu chi tiết tại [`artifacts/experiments/THESIS_REPORT.md`](../artifacts/experiments/THESIS_REPORT.md)):

### 3.1. Vì sao chọn Pretrained Embedding (`all-MiniLM-L6-v2`) thay cho TF-IDF?
So sánh trên tập baseline ban đầu (`v1.1`):
- `TF-IDF + Logistic Regression` chỉ đạt `Joint Acc = 0.3753` (`Sub Oracle F1 = 0.5222`).
- `TF-IDF + Linear SVM` đạt `Joint Acc = 0.3806` (`Sub Oracle F1 = 0.4965`).
- **`Frozen MiniLM + Logistic Regression`** nhảy vọt lên `Joint Acc = 0.5207` (`Sub Oracle F1 = 0.7622`) nhờ biểu diễn ngữ nghĩa 384 chiều nắm bắt được đồng nghĩa và ngữ cảnh định nghĩa.

### 3.2. Tối ưu Baseline & Phân tích lỗi (E1–E4 trên Dataset `v1.2.0`)
- **Lỗi dây chuyền (Cascading Errors):** `79.40%` lỗi ở Subtopic bắt nguồn từ việc dự đoán sai Main Topic ở bước 1.
- **E1 (Class Weighting):** Dùng trọng số đầy đủ (`balanced`) làm giảm độ chính xác vì thiên vị lớp nhỏ; làm mượt nhẹ bằng **`power_0.25`** cân bằng tốt nhất giữa Main Macro F1 (`0.6343`) và Subtopic E2E Macro F1 (`0.4650`).
- **E2 (Input Ablation):** Dùng đầu vào đầy đủ **`full`** (`Word + POS + Definition + Collocations + Examples`) cho hiệu quả phân loại phân cấp cao nhất (`Joint Acc = 0.5398`, tăng `+7.26 pp` so với chỉ dùng `word_pos_def`).
- **E4 (Đa nghĩa):** Các nghĩa phụ (`secondary senses`) khó hơn nghĩa chính `-8.64 pp` Main Accuracy.

### 3.3. Phát hiện quan trọng khi Fine-tuning (E5, E7, E8 trên GPU Vast.ai RTX 3060)
Khi fine-tune toàn bộ encoder MiniLM với multi-task loss $L = L_{\text{main}} + \lambda L_{\text{sub}}$:

| Cấu hình | Main Accuracy | Main Macro F1 | Sub E2E Macro F1 | Sub Oracle Macro F1 | Joint Accuracy |
| :--- | ---: | ---: | ---: | ---: | ---: |
| **Frozen MiniLM + LogReg (`power_0.25`)** | `0.6417` | `0.6343` | **`0.4650`** | **`0.7150`** | **`0.5398`** |
| Fine-tuned Encoder + Trainable Head (E7) | **`0.6942`** | **`0.6954`** | `0.4535` | `0.6265` | `0.4981` |
| Multi-task Fine-tuned $\lambda=1.0$ (E8) | `0.6857` | `0.6846` | `0.4264` | `0.6066` | `0.4903` |

**Kết luận nghiên cứu:** Fine-tuning giúp phân tách 11 Main Topics tốt hơn (`+6.11 pp` Main Macro F1), **nhưng lại kéo tụt trần phân tách Subtopic (`Sub Oracle F1` giảm `-8.85 pp` từ `0.7150` xuống `0.6265`)** vì giám sát ở cấp Main Topic làm co cụm khoảng cách ngữ nghĩa giữa các subtopic con trong cùng một ngành. Vì mục tiêu của hệ thống là phân loại chính xác **cả cặp (Main + Subtopic)**, **Frozen MiniLM + Hierarchical Logistic Regression (`power_0.25`)** được chốt làm mô hình chính thức.

---

## Bước 4: Tối Ưu Suy Luận & Độ Tin Cậy (Inference Pipeline)

Để mô hình chạy ổn định khi đưa vào sản phẩm thật (`src/inference/final_predictor.py`):

1. **Ràng buộc phân cấp cứng (Hierarchy Constraint):** Dùng **1 bộ phân loại Main Topic (11 lớp)** kết hợp với **11 bộ phân loại Subtopic chuyên biệt theo từng Main Topic** (chỉ xét các subtopic con hợp lệ → `0` lỗi râu ông nọ cắm cằm bà kia).
2. **Hiệu chỉnh xác suất (Temperature Scaling):** Fit trên tập `val.jsonl` (`T_main = 0.8659`, `T_sub = 0.4928`), giúp sai số cân chỉnh xác suất (ECE) của Subtopic giảm từ `0.1224` xuống **`0.0217`**.
3. **Top-1 mặc định + Top-3 gợi ý + Ngưỡng từ chối (`Abstention`):**
   - Áp dụng ngưỡng cố định từ validation: **`Main >= 0.60` và `Joint >= 0.30`** → `accepted`; ngược lại đánh dấu **`needs_review`** để con người kiểm tra hoặc fallback/review.
   - **Kết quả đánh giá cuối cùng (`final_model/evaluation/test_metrics.json`, `n = 1,295`):**
     - **Full Test (100% coverage):** `Main Acc = 0.6417`, `Main Macro F1 = 0.6343`, `Sub E2E F1 = 0.4650`, `Joint Acc = 0.5398`, `Top-3 Main Recall = 0.9259`, `Top-3 Sub Recall = 0.8193`.
     - **Tập tự động chấp nhận (`57.76%` = `748/1,295` mẫu):** **`Main Acc = 0.7901`**, **`Main Macro F1 = 0.7815`**, **`Sub E2E Macro F1 = 0.5728`**, **`Joint Acc = 0.6725`** (bắt được `58.89%` tổng số lỗi vào hàng đợi `needs_review`).

---

## Bước 5: Đóng Gói Bất Biến & Microservice FastAPI

### 5.1. Quản lý Artifact nhị phân (`vocab-classifier-v1.0.0`)
Do các file weight nặng (`all-MiniLM-L6-v2` ~87 MB, các file `.joblib`) bị `.gitignore` loại khỏi Git:
- `src/training/finalize_model.py` xuất toàn bộ model + config + calibration + metrics vào `final_model/` kèm SHA-256 dataset/taxonomy.
- `src/training/release_artifact.py` đóng gói thành file bất biến **`vocab-classifier-v1.0.0.zip`** (`83.7 MB`) lưu trên GitHub Releases kèm file checksum `.sha256` và `manifest.json`, giúp bất kỳ máy/server nào cũng tải lại và xác thực được model chỉ bằng 1 dòng lệnh mà không cần train lại.

### 5.2. Tách lớp API Service (`vocab_classifier/api/` + `src/`)
- `src/preprocessing.py`: Chuẩn hóa input, áp dụng policy kiểm tra `word`/`definition` rỗng, xử lý độc lập từng sense trong batch.
- `src/postprocessing.py`: Kiểm tra invariant phân cấp và đóng gói schema trả về kèm `review_record`.
- `api/routes.py`: Cung cấp `/health`, `/model-info`, `/predict`, `/predict/batch`, và cụm `/review/*` (`SQLite ReviewWorkflowStore`), được kiểm chứng bằng **37 unit & integration tests** (`tests/test_api_and_integration.py`).

---

## Bước 6: Deploy Model Lên Google Cloud Run

Vì web frontend Next.js deploy trên Vercel (môi trường serverless Node.js, giới hạn bundle không phù hợp nhúng PyTorch + Transformers), mô hình Python được chạy như một **microservice độc lập trên Google Cloud Run**:

1. **`vocab_classifier/requirements.txt`:** Dùng `--extra-index-url https://download.pytorch.org/whl/cpu` và ghim đúng phiên bản (`torch==2.7.1`, `transformers==4.46.3`, `scikit-learn==1.5.1`, `numpy==1.26.4`, `joblib==1.5.1`) để tương thích tuyệt đối với file `.joblib` đã đóng gói.
2. **`vocab_classifier/Dockerfile`:** Build từ `python:3.12-slim`, tự chạy `release_artifact restore` để tải + kiểm tra SHA-256 cho `vocab-classifier-v1.0.0.zip` ngay vào container image, rồi khởi chạy `uvicorn api.app:create_app --factory --host 0.0.0.0 --port ${PORT:-8080}` (preload model khi container bật).
3. **Cấu hình Cloud Run (`asia-southeast1`):** `2 GiB RAM`, `2 vCPU`, timeout `120s`, service URL:
   `https://vocab-classifier-745665682684.asia-southeast1.run.app`

---

## Bước 7: Tích Hợp Vào Ứng Dụng Web (Next.js + Vercel + Supabase)

Luồng hoạt động thực tế trên ứng dụng **LinguaFlow** (`prototype-interface/`):

```text
Người dùng thêm thẻ mới (POST /api/decks/[id]/cards)
   └─► Chỉ lưu thẻ + enrich nghĩa/IPA/ví dụ/ảnh/audio (chưa gán topic)
         │
         ▼
Người dùng vào trang /topics
   └─► Nếu còn thẻ chưa có nhãn (totalUnclassifiedCards > 0):
         Nút "⚡ Phân Loại X Từ Mới (Model)" mở
         Nếu hết thẻ chưa phân loại (0 từ mới): Nút tự khóa
         │
         ▼ (Bấm phân loại)
POST /api/topics/auto-cluster
   ├─► Lọc đúng các thẻ chưa có trong card_topics
   ├─► Gọi Cloud Run /predict/batch theo từng chunk 120 thẻ (timeout 45s)
   │      └─► Nếu Cloud Run offline/lỗi → tự động fallback sang Gemini LLM / keyword
   └─► Lưu kết quả hàng loạt (batch SQL) vào card_topics + card_topic_review_history
       (ghi riêng predicted_main_topic, predicted_subtopic, prediction_status, model_version)
```

### Các điểm kỹ thuật quan trọng khi đưa lên Web thật
1. **Chia batch nhỏ & Batch SQL:** Thử nghiệm thực tế cho thấy Cloud Run xử lý 426 câu dài mất ~14 giây (vượt timeout 15s cũ) và SQLite/Postgres insert từng dòng tốn ~1,278 round-trips. Sau khi chia nhỏ request thành các **chunk 120 thẻ** (~3–4s/chunk, timeout 45s) và gộp thành **batch SQL insert**, quá trình phân loại toàn bộ 426 thẻ trên Vercel Production hoàn tất nhanh chóng với **`engine: "vocab_classifier_v1"`**.
2. **Bảo toàn nhãn dự đoán gốc cho Human Review:** Khi người dùng tự chỉnh lại chủ đề cho một thẻ (`PATCH /api/cards/[id]/topics`), hệ thống chỉ cập nhật nhãn hiển thị (`topicId`) và bật `human_verified = true`, **không ghi đè mất `predicted_main_topic` và `predicted_subtopic`** ban đầu của model để phục vụ thu thập dữ liệu huấn luyện cho các phiên bản sau.
3. **Kết quả chạy thực tế trên dữ liệu web (`426` từ):**
   - `249` từ auto-accepted (`58.45%`) và `177` từ `needs_review` (`41.55%`) — khớp sát tỷ lệ đánh giá `57.76% / 42.24%` trên tập test nghiên cứu.
   - Đã tách riêng được **88 từ vựng tổng quát/chức năng** vào nhánh `General Vocabulary` (`gen.*`) và phân bổ phần còn lại vào **39 subtopics** chuyên biệt trên giao diện `/topics` (`11 Chủ đề lớn • 45 Chủ đề nhỏ`).
