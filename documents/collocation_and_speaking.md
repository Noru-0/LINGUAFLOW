# Tài Liệu Kỹ Thuật: Triển Khai Tính Năng Ghép Cụm Từ Học Thuật (SRS Collocations) & Luyện Nói Speaking Có Phản Hồi AI

Tài liệu này hướng dẫn chi tiết cách hiện thực hai tính năng bổ trợ IELTS:

1. **Academic Collocation & Phrasal Chunks Matching**: Bài tập ghép cụm từ học thuật C1/C2 gắn trực tiếp vào thuật toán DSR/SRS sẵn có.
2. **IELTS Speaking Simulation & Voice Feedback**: Thu âm bằng Web Speech API trình duyệt (chi phí $0), chấm phản hồi ngữ pháp và độ mạch lạc bằng Gemini Flash.

---

## 1. Tính Năng 1: Academic Collocation & Phrasal Chunks Matching

Thay vì học các từ riêng lẻ (dễ bị ghép từ theo kiểu dịch từng chữ tiếng Việt - Word-by-word), người học luyện tập theo các cụm cố định (_phrasal chunks_) thường gặp trong IELTS Writing & Speaking.

### 1.1 Cơ Chế Hoạt Động (Gameplay & SRS Loop)

- **Dạng 1: Ghép cặp (Drag & Drop / Click Match)**: Cung cấp 4–6 động từ/tính từ ở cột trái và danh từ/giới từ ở cột phải (ví dụ: `exert` $\leftrightarrow$ `a profound impact on`).
- **Dạng 2: Điền phần khuyết của Chunk**: Cho câu chứa ngữ cảnh, người học chọn hoặc điền nửa còn lại của collocation.

**Tích Hợp Thuật Toán DSR:**

- Mỗi collocation là một bản ghi độc lập có trạng thái DSR riêng (`difficulty`, `stability`, `due_date`).
- **Nếu ghép đúng ngay lần đầu**: Tính là Good (Rating 3).
- **Nếu ghép sai hoặc bấm xem gợi ý**: Tính là Again (Rating 1), đưa cụm từ vào hàng đợi lặp lại trong phiên và giảm điểm `stability`.

### 1.2 Database Schema (Supabase PostgreSQL)

```sql
-- Bảng lưu trữ danh mục các cụm từ học thuật
CREATE TABLE IF NOT EXISTS collocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  head_word VARCHAR(100) NOT NULL, -- e.g., "exert", "address", "bridge"
  tail_chunk VARCHAR(200) NOT NULL, -- e.g., "a profound impact on", "the root causes of"
  full_phrase VARCHAR(300) NOT NULL, -- e.g., "exert a profound impact on"
  meaning_vi TEXT NOT NULL, -- e.g., "tác động sâu sắc lên..."
  example_sentence TEXT NOT NULL, -- "Social media exerts a profound impact on adolescent mental health."
  cefr_level VARCHAR(10) DEFAULT 'C1', -- 'B2', 'C1', 'C2'
  ielts_topic VARCHAR(100) NOT NULL, -- 'Technology & Society', 'Education', etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tận dụng bảng card_dsr_state sẵn có thông qua trường đa hình hoặc bảng riêng
CREATE TABLE IF NOT EXISTS collocation_dsr_state (
  collocation_id UUID PRIMARY KEY REFERENCES collocations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  difficulty FLOAT NOT NULL DEFAULT 5.0,
  stability FLOAT NOT NULL DEFAULT 0.0,
  reps INT NOT NULL DEFAULT 0,
  lapses INT NOT NULL DEFAULT 0,
  last_reviewed TIMESTAMPTZ,
  due_date TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_colloc_due ON collocation_dsr_state(user_id, due_date ASC);
```

### 1.3 React Matching Component (Tailwind UI)

```tsx
// components/collocation-matcher.tsx
import React, { useState, useEffect } from "react";

interface CollocationItem {
  id: string;
  head: string;
  tail: string;
}

export function CollocationMatcher({
  items,
  onComplete,
}: {
  items: CollocationItem[];
  onComplete: (results: { id: string; correct: boolean }[]) => void;
}) {
  const [heads, setHeads] = useState<string[]>([]);
  const [tails, setTails] = useState<string[]>([]);
  const [selectedHead, setSelectedHead] = useState<string | null>(null);
  const [selectedTail, setSelectedTail] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [attempts, setAttempts] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Trộn ngẫu nhiên các vế
    setHeads([...items.map((i) => i.head)].sort(() => Math.random() - 0.5));
    setTails([...items.map((i) => i.tail)].sort(() => Math.random() - 0.5));
  }, [items]);

  const handleSelectHead = (h: string) => setSelectedHead(h);
  const handleSelectTail = (t: string) => setSelectedTail(t);

  useEffect(() => {
    if (selectedHead && selectedTail) {
      const match = items.find(
        (i) => i.head === selectedHead && i.tail === selectedTail,
      );
      if (match) {
        setMatchedIds((prev) => [...prev, match.id]);
        setAttempts((prev) => ({
          ...prev,
          [match.id]: prev[match.id] !== false,
        }));
      } else {
        // Sai: ghi nhận để đánh giá SRS mức Again
        const related = items.find((i) => i.head === selectedHead);
        if (related) setAttempts((prev) => ({ ...prev, [related.id]: false }));
      }
      setSelectedHead(null);
      setSelectedTail(null);
    }
  }, [selectedHead, selectedTail, items]);

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl border border-slate-200">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
        Match the Academic Collocations
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {/* Cột Đầu (Heads) */}
        <div className="space-y-2">
          {heads.map((h) => {
            const isMatched = matchedIds.some(
              (id) => items.find((i) => i.id === id)?.head === h,
            );
            return (
              <button
                key={h}
                disabled={isMatched}
                onClick={() => handleSelectHead(h)}
                className={`w-full p-3 text-left font-medium rounded-xl border transition ${
                  isMatched
                    ? "opacity-30 border-slate-100 bg-slate-50 line-through"
                    : selectedHead === h
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                {h}
              </button>
            );
          })}
        </div>

        {/* Cột Đuôi (Tails) */}
        <div className="space-y-2">
          {tails.map((t) => {
            const isMatched = matchedIds.some(
              (id) => items.find((i) => i.id === id)?.tail === t,
            );
            return (
              <button
                key={t}
                disabled={isMatched}
                onClick={() => handleSelectTail(t)}
                className={`w-full p-3 text-left text-sm rounded-xl border transition ${
                  isMatched
                    ? "opacity-30 border-slate-100 bg-slate-50 line-through"
                    : selectedTail === t
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

---

## 2. Tính Năng 2: IELTS Speaking Simulation & Voice Feedback

Tính năng này rèn phản xạ nói cho IELTS Speaking Part 2 & Part 3 mà không mất phí dịch vụ phiên âm (Audio Transcription APIs) bằng cách tận dụng trực tiếp bộ engine **Web Speech API** tích hợp sẵn trên Chrome, Edge và Safari.

### 2.1 Luồng Xử Lý Kỹ Thuật

1. **Hiển thị Cue Card / Câu hỏi**: Đưa ra chủ đề IELTS Speaking Part 2 (có 1 phút chuẩn bị, 2 phút nói) hoặc câu hỏi Part 3 thảo luận sâu.
2. **Thu âm & Nhận diện văn bản cục bộ**: Sử dụng `webkitSpeechRecognition` trên trình duyệt để ghi nhận giọng nói theo thời gian thực và xuất ra chuỗi transcript.
3. **Đánh giá qua Gemini API**: Gửi đoạn transcript về backend kèm theo câu hỏi để Gemini chấm điểm dựa trên 3 tiêu chí IELTS Speaking:
   - **Fluency & Coherence**: Mức độ liên kết, việc sử dụng các từ nối (_discourse markers_), mạch lạc logic.
   - **Lexical Resource**: Có dùng được từ vựng học thuật hoặc idioms tự nhiên hay không.
   - **Grammatical Range & Accuracy**: Các lỗi ngữ pháp tự phát (quên chia thì quá khứ, mạo từ, đảo lộn trật tự từ).

### 2.2 Database Schema (Lưu Trữ Bài Nói)

```sql
CREATE TABLE IF NOT EXISTS speaking_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part INT NOT NULL CHECK (part IN (1, 2, 3)),
  topic VARCHAR(100) NOT NULL,
  question_prompt TEXT NOT NULL, -- Câu hỏi chính
  cue_points JSONB, -- Mảng các cue bullet points (nếu là Part 2)
  model_response TEXT, -- Bài nói mẫu tham khảo Band 8.0
  suggested_vocabulary JSONB, -- Các cụm từ vựng nên áp dụng
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS speaking_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  prompt_id UUID REFERENCES speaking_prompts(id) ON DELETE CASCADE,
  transcribed_text TEXT NOT NULL, -- Văn bản thu âm được
  estimated_band FLOAT, -- 5.5, 6.0, 6.5, 7.0...
  coherence_feedback TEXT,
  lexical_feedback TEXT,
  grammar_feedback TEXT,
  improved_version TEXT, -- Phiên bản nói được viết lại tự nhiên hơn
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.3 Client Hook Thu Âm: `useSpeechRecognition.ts`

```typescript
// hooks/useSpeechRecognition.ts
import { useState, useEffect, useRef } from "react";

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let currentText = "";
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);
      };

      recognition.onerror = (err: any) => {
        console.error("[SpeechRecognition Error]:", err);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return { transcript, isListening, startListening, stopListening };
}
```

### 2.4 Service Đánh Giá Bài Nói (Gemini Backend)

Tạo file `services/gemini-speaking-evaluator.ts`:

```typescript
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function evaluateSpeakingSubmission(
  question: string,
  userTranscript: string,
  part: number,
) {
  const evaluationSchema = {
    type: Type.OBJECT,
    properties: {
      estimatedBand: { type: Type.NUMBER },
      overallImpression: { type: Type.STRING },
      coherenceAndFluency: { type: Type.STRING },
      grammarCorrection: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            spokenPhrase: { type: Type.STRING },
            correctedPhrase: { type: Type.STRING },
            reason: { type: Type.STRING },
          },
          required: ["spokenPhrase", "correctedPhrase", "reason"],
        },
      },
      lexicalUpgrade: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            simpleWord: { type: Type.STRING },
            band8Alternative: { type: Type.STRING },
          },
          required: ["simpleWord", "band8Alternative"],
        },
      },
      improvedAnswer: { type: Type.STRING },
    },
    required: [
      "estimatedBand",
      "overallImpression",
      "coherenceAndFluency",
      "grammarCorrection",
      "lexicalUpgrade",
      "improvedAnswer",
    ],
  };

  const prompt = `
You are a certified IELTS Speaking Examiner.
Evaluate the following spoken transcript for IELTS Speaking Part ${part}.

- Question/Cue Card: "${question}"
- Spoken Transcript (via Speech-to-Text): "${userTranscript}"

Assessment Criteria:

1. Identify spoken grammatical errors (tenses, subject-verb agreement, omissions).
2. Assess Discourse Markers & Coherence (logical flow, transitions).
3. Suggest Lexical Upgrades (convert B1/B2 spoken words into C1 academic/idiomatic phrasing).
4. Provide a rewritten, authentic Band 8.0+ spoken response based on the learner's original ideas.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: evaluationSchema,
      temperature: 0.3,
    },
  });

  return JSON.parse(response.text || "{}");
}
```

---

## 3. Tích Hợp Vào Bảng Điều Khiển Tổng (Dashboard Integration)

- **Thẻ Thống Kê Collocations**: Thêm một widget vào phần "At a glance" hiển thị số cụm từ học thuật C1 đã làm chủ.
- **Biểu Đồ Luyện Nói**: Theo dõi số phút luyện nói và điểm band ước tính qua các tuần.

1. Nguồn Dữ Liệu Cho Academic Collocation
   Từ điển Collocation Mở & Chuyên Dụng:

Oxford Collocations Dictionary (Online / Scraping nhẹ): Nguồn chuẩn mực nhất phân loại collocation theo cặp cú pháp: Verb + Noun, Adjective + Noun, Verb + Preposition.

English Profile / Cambridge Academic Word List (AWL): Danh mục từ vựng học thuật chuẩn CEFR (B2–C1). Bạn có thể lọc ra các cụm từ đi kèm các từ cốt lõi như impact, policy, approach, significant, comprehensive.

OZDIC (ozdic.com): Công cụ tra cứu collocation miễn phí, giao diện HTML tĩnh cực kỳ gọn nhẹ, rất dễ để viết script parser hoặc cào dữ liệu cụm từ theo từng từ vựng trong cơ sở dữ liệu của bạn.

Bộ Sách Collocation Kinh Điển:

English Collocations in Use (Advanced / Intermediate - Cambridge): Sách được chia sẵn thành 60 unit theo đúng các chủ đề IELTS (Technology, Environment, Law & Society, Academic Writing). Bạn có thể số hóa bảng từ và ví dụ của từng bài vào cơ sở dữ liệu.

Tạo Tự Động Từ Kho Ngữ Liệu Sẵn Có (AI One-time Extraction):

Chạy một script nạp danh sách 500 từ vựng cốt lõi của ứng dụng vào Gemini API với prompt:

"Trích xuất 3 cặp collocation học thuật (Band 7.0+) thường gặp nhất đi kèm từ vựng này trong IELTS Writing, định dạng JSON gồm: head_word, tail_chunk, meaning_vi, example."

2. Nguồn Đề Bài & Câu Hỏi Cho IELTS Speaking (Part 1, 2, 3)
   Ngân Hàng Đề Thi Dự Đoán (IELTS Forecast Decks):

IELTS Speaking Forecast (Bộ đề dự đoán theo quý): Cứ mỗi 4 tháng (Quý 1: Jan–Apr, Quý 2: May–Aug, Quý 3: Sep–Dec), cộng đồng IELTS đều tổng hợp file PDF danh sách toàn bộ các đề thi Speaking thật đang ra trong phòng thi. Đây là nguồn câu hỏi thực chiến, sát thực tế nhất.

IELTS Liz (ieltsliz.com) & IELTS Simon (ielts-simon.study): Hai trang web chia sẻ miễn phí 100% danh sách câu hỏi Speaking mẫu chia theo Part 1, 2, 3 kèm bài trả lời mẫu (Model Answers) chuẩn band 8.0–9.0. Bạn có thể lưu câu hỏi và bài mẫu về làm benchmark đối chiếu cho Gemini chấm điểm.

Các Nguồn Tài Liệu Chính Thống:

Cambridge IELTS Practice Tests (Cam 10 – 19): Phần Speaking ở cuối mỗi Test gồm đủ 3 Parts cho các chủ đề kinh điển.

Bộ Sách Luyện Nói: Mark Allen - Mat Clark (IELTS Speaking) cung cấp hệ thống dàn ý và liên từ phản xạ tự nhiên theo từng dạng câu hỏi (Opinion, Evaluation, Prediction).

3. Phương Án Triển Khai Vào Hệ Thống (Zero-Cost Strategy)
   Để không mất công nhập liệu tay hàng nghìn câu:

Với Collocation: Tận dụng chính các đoạn văn dịch đã sinh ra từ tính năng Paragraph Translation. Mỗi khi Gemini sinh 1 đoạn dịch mẫu, trích xuất luôn trường key_vocabulary và lưu vào bảng collocations để phục vụ màn hình ghép cặp.

Với Speaking: Dùng script nạp sẵn khoảng 60–80 bộ câu hỏi Speaking Part 2 & Part 3 lấy từ bộ Forecast/Cambridge vào bảng speaking_prompts trong Supabase một lần duy nhất. Người học có thể luyện xoay vòng theo chủ đề mà không cần tốn chi phí gọi API sinh câu hỏi định kỳ.
