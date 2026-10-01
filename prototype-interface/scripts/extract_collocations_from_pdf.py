import os
import sys
import json
import time
import re
import urllib.request
import urllib.error

# Ensure UTF-8 output on Windows terminal
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

import pypdf

# 1. Load .env.local
ENV_PATH = os.path.join(os.path.dirname(__file__), '..', '.env.local')
if os.path.exists(ENV_PATH):
    with open(ENV_PATH, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                k = k.strip()
                v = v.strip().strip('"').strip("'")
                if k not in os.environ:
                    os.environ[k] = v

GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
PDF_PATH = r'd:\5\EN_web\data\English Collocations in Use Intermediate.pdf'
OUTPUT_TS_PATH = os.path.join(os.path.dirname(__file__), '..', 'lib', 'db', 'initial_collocations.ts')

print(f"📖 Bắt đầu đọc file PDF từ: {PDF_PATH}")
if not os.path.exists(PDF_PATH):
    print(f"❌ Không tìm thấy file tại {PDF_PATH}")
    sys.exit(1)

reader = pypdf.PdfReader(PDF_PATH)
total_pages = len(reader.pages)
print(f"📄 Tổng số trang PDF: {total_pages}")

# Theory pages start around page 8 (Unit 1), page 10 (Unit 2)... up to page 126 (Unit 60)
# Even page indices: 8, 10, 12, 14, 16, 18, 20...
theory_pages = [p for p in range(8, 128, 2) if p < total_pages]
print(f"🎯 Số trang lý thuyết cần bóc tách: {len(theory_pages)} trang (tương ứng các Unit 1 -> 60)")

def call_gemini_extract(text, page_num):
    if not GEMINI_API_KEY:
        print("❌ GEMINI_API_KEY chưa được thiết lập trong .env.local")
        return []

    prompt = f"""
Bạn là chuyên gia ngôn ngữ học tiếng Anh & IELTS. Hãy đọc trang lý thuyết sau trích từ sách "English Collocations in Use (Intermediate)".
Nhiệm vụ: Trích xuất các collocations (cụm từ cố định) quan trọng nhất xuất hiện trong trang.

Với mỗi collocation, trả về cấu trúc JSON gồm:
- category: Tên bài học hoặc chủ đề (ví dụ: 'Everyday Verbs: Make/Do', 'Intensifying Adverbs', 'Topic: Weather', 'Topic: Travel', 'Topic: Work & Study')
- head_word: Từ chính (ví dụ: 'make', 'heavy', 'bitterly', 'take')
- tail_chunk: Cụm đi kèm (ví dụ: 'an effort', 'rain', 'disappointed', 'action')
- full_phrase: Cụm từ trọn vẹn (ví dụ: 'make an effort', 'heavy rain', 'bitterly disappointed')
- context_sentence: Câu ví dụ tiếng Anh tự nhiên, hoàn chỉnh (S + V + O) chứa cụm từ đó
- vietnamese_meaning: Nghĩa tiếng Việt chính xác, tự nhiên
- distractors: Mảng đúng 3 cụm từ sai/nhiễu điển hình mà học viên hay nhầm (ví dụ: cho 'make an effort' thì distractors là ['do an effort', 'take an effort', 'give an effort'])
- cefr_level: 'B1' | 'B2' | 'C1' | 'C2'
- ielts_topic: Chủ đề bài thi (ví dụ: 'Everyday Verbs', 'Environment', 'Academic Writing', 'Travel', 'Relationships')

Yêu cầu định dạng: Trả về DUY NHẤT một mảng JSON các object, không có markdown codeblock hay văn bản giải thích.
Ví dụ:
[
  {{
    "category": "Everyday Verbs: Make/Do",
    "head_word": "make",
    "tail_chunk": "an effort",
    "full_phrase": "make an effort",
    "context_sentence": "She made an effort to finish the assignment before midnight.",
    "vietnamese_meaning": "nỗ lực, cố gắng",
    "distractors": ["do an effort", "take an effort", "give an effort"],
    "cefr_level": "B1",
    "ielts_topic": "Everyday Verbs"
  }}
]

Nội dung trang {page_num}:
\"\"\"
{text}
\"\"\"
"""

    models = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-3.5-flash-lite']
    for model in models:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.1,
                    "responseMimeType": "application/json"
                }
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode('utf-8'),
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                resp_data = json.loads(resp.read().decode('utf-8'))
                cand_text = resp_data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '[]')
                cand_text = re.sub(r'^```json\s*', '', cand_text, flags=re.I)
                cand_text = re.sub(r'```\s*$', '', cand_text).strip()
                parsed = json.loads(cand_text)
                if isinstance(parsed, list):
                    return parsed
        except Exception as e:
            # Try next model
            continue

    return []

all_extracted_collocations = []
seen_phrases = set()

# Process first 25 key units for fast & rich coverage (e.g. Unit 1 to Unit 25)
# You can increase the range as needed
selected_pages = theory_pages[:25]

print(f"\n🚀 Bắt đầu trích xuất từ {len(selected_pages)} Units cốt lõi của sách...")

for idx, page_num in enumerate(selected_pages, 1):
    try:
        raw_text = reader.pages[page_num].extract_text()
        if not raw_text or len(raw_text.strip()) < 100:
            continue

        print(f"[{idx}/{len(selected_pages)}] 🔍 Đang bóc tách Trang {page_num} (Unit {idx})...", end="", flush=True)
        items = call_gemini_extract(raw_text, page_num)
        
        added_count = 0
        for it in items:
            phrase = (it.get('full_phrase') or '').strip().lower()
            if phrase and phrase not in seen_phrases:
                seen_phrases.add(phrase)
                it['id'] = f"colloc-cambridge-{len(all_extracted_collocations) + 1:03d}"
                all_extracted_collocations.append(it)
                added_count += 1

        print(f" -> Thu được {added_count} collocations mới (Tổng: {len(all_extracted_collocations)})")
        time.sleep(1.0) # avoid rate limit
    except Exception as e:
        print(f" -> ⚠️ Lỗi trang {page_num}: {e}")

print(f"\n✨ Hoàn tất bóc tách! Đã trích xuất thành công {len(all_extracted_collocations)} cụm từ từ sách.")

# Write to initial_collocations.ts
ts_content = f"""export interface InitialCollocation {{
  id: string
  category: string
  head_word: string
  tail_chunk: string
  full_phrase: string
  meaning_vi: string
  example_sentence: string
  distractors: string[]
  cefr_level: 'B1' | 'B2' | 'C1' | 'C2'
  ielts_topic: string
}}

export const INITIAL_COLLOCATIONS: InitialCollocation[] = {json.dumps(all_extracted_collocations, indent=2, ensure_ascii=False)}
"""

with open(OUTPUT_TS_PATH, 'w', encoding='utf-8') as f:
    f.write(ts_content)

print(f"💾 Đã lưu danh sách Collocations vào file: {OUTPUT_TS_PATH}")
