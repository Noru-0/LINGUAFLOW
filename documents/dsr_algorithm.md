# Hướng Dẫn Kỹ Thuật: Triển Khai Thuật Toán DSR Cho Flashcard & Điền Từ

Tài liệu này cung cấp hướng dẫn kiến trúc và mã nguồn để tích hợp thuật toán **DSR (Difficulty – Stability – Retrievability)** vào hai dạng bài tập cốt lõi:

1. **Flashcard Review** — người học tự đánh giá theo 4 mức độ (`Again`, `Hard`, `Good`, `Easy`).
2. **Fill-in-the-Blank with Hints (Điền từ có gợi ý)** — hệ thống tự chấm chuỗi nhập liệu, trừ điểm theo số gợi ý đã dùng, và quy đổi thành rating DSR tương ứng.

> **Trạng thái triển khai:** ✅ **DSR đã được tích hợp** và đang chạy **song song** với SuperMemo SM-2.
>
> | Hạng mục | Trạng thái | Vị trí |
> | --- | --- | --- |
> | DSR engine | ✅ Đã xong | `lib/srs/dsr.ts` |
> | Bảng `card_dsr_state` | ✅ Đã xong | `lib/db/supabase_schema.sql`, `lib/db/schema.ts`, `lib/db/pg_schema.ts` |
> | API ghi nhận | ✅ Đã xong | `app/api/srs/grade/route.ts` |
> | Evaluator điền từ | ✅ Đã xong | `lib/srs/dsr.ts` |
> | Unit test | ✅ 22/22 pass | `tests/dsr-engine.test.ts` |
> | Migration script | ✅ Đã xong | `scripts/migrate-dsr.ts` |
>
> SM-2 vẫn là nguồn dữ liệu chính cho `due_date`; DSR ghi song song để so sánh `interval` trước khi chuyển hẳn.

---

## Mục Lục

1. [So Sánh SM-2 Hiện Tại Và DSR](#1-so-sánh-sm-2-hiện-tại-và-dsr)
2. [Kiến Trúc Dữ Liệu](#2-kiến-trúc-dữ-liệu)
3. [Core Engine: Thuật Toán DSR](#3-core-engine-thuật-toán-dsr)
4. [Dạng Bài Tập 1: Flashcard Review](#4-dạng-bài-tập-1-flashcard-review)
5. [Dạng Bài Tập 2: Điền Từ Có Gợi Ý](#5-dạng-bài-tập-2-điền-từ-có-gợi-ý)
6. [API Cập Nhật Lịch Ôn](#6-api-cập-nhật-lịch-ôn)
7. [Kiểm Thử Đơn Vị](#7-kiểm-thử-đơn-vị)
8. [Lộ Trình Di Trú](#8-lộ-trình-di-trú)

### Lệnh nhanh

```bash
pnpm test                      # chạy 22 unit test của DSR engine
pnpm tsx scripts/migrate-dsr.ts  # tạo bảng card_dsr_state trên Supabase
```

---

## 1. So Sánh SM-2 Hiện Tại Và DSR

| Tiêu chí | SM-2 (hiện tại) | DSR (đề xuất) |
| --- | --- | --- |
| Tham số trạng thái | `repetition`, `interval`, `easeFactor` | `difficulty`, `stability`, `reps`, `lapses` |
| Mô hình trí nhớ | Hệ số nhân khoảng cách | Đường cong quên lãng `R = e^(-Δt/S)` |
| Mục tiêu | Không có ngưỡng rõ ràng | Giữ xác suất nhớ ở `TARGET_RETENTION = 0.9` |
| Xử lý quên | Reset `repetition = 0`, `interval = 1` | Giảm `stability × 0.25`, tăng `difficulty` |
| Bảng dữ liệu | `card_srs_states` | `card_dsr_state` (bảng mới) |
| File engine | `lib/srs/sm2.ts` | `lib/srs/dsr.ts` (thêm mới) |

**Khuyến nghị:** giữ SM-2 làm fallback trong giai đoạn chuyển tiếp, chạy DSR song song rồi so sánh `interval` trước khi chuyển hẳn.

---

## 2. Kiến Trúc Dữ Liệu

Một thẻ từ vựng chia sẻ chung một trạng thái DSR duy nhất, nhưng hỗ trợ metadata phục vụ cho cả 2 dạng bài tập.

### 2.1. Bảng `cards` (đã tồn tại — cần bổ sung 2 cột)

Schema hiện tại (`lib/db/supabase_schema.sql`) đã có sẵn hầu hết các cột cần thiết:

| Cột hiện có | Kiểu | Ghi chú |
| --- | --- | --- |
| `id` | `TEXT` | Khoá chính, dùng `uuid_generate_v4()::text` |
| `deck_id` | `TEXT` | FK → `decks(id)` |
| `term` | `TEXT` | Từ tiếng Anh |
| `vietnamese_definition` | `TEXT` | Nghĩa tiếng Việt |
| `phonetic` | `TEXT` | Phiên âm IPA |
| `part_of_speech` | `TEXT` | Từ loại |
| `example_sentence` | `TEXT` | Câu ví dụ |
| `collocations_json` | `JSONB` | Mảng collocations |

Chỉ cần **thêm 2 cột** cho dạng bài điền từ:

```sql
-- Bổ sung cột phục vụ Fill-in-the-Blank (idempotent)
ALTER TABLE public.cards
  ADD COLUMN IF NOT EXISTS hint_pattern TEXT,   -- Gợi ý: "a _ _ _ _ _ _ _ _ h"
  ADD COLUMN IF NOT EXISTS first_letter TEXT;   -- Gợi ý cấp 1: "a"

COMMENT ON COLUMN public.cards.hint_pattern IS 'Mẫu gợi ý điền từ, sinh tự động từ term';
COMMENT ON COLUMN public.cards.first_letter IS 'Ký tự đầu của term, dùng cho hint cấp 1';
```

> **Lưu ý:** `hint_pattern` và `first_letter` có thể **sinh tự động** từ `term` ở tầng ứng dụng, nên 2 cột này là tuỳ chọn (chỉ dùng khi cần cache sẵn).

### 2.2. Bảng `card_dsr_state` (bảng mới)

Thay thế dần `card_srs_states`. Giữ cùng quy ước với schema hiện tại: khoá `TEXT`, `user_id`/`card_id` là `TEXT`, có ràng buộc unique theo cặp `(user_id, card_id)`.

```sql
-- Bảng trạng thái thuật toán DSR
CREATE TABLE IF NOT EXISTS public.card_dsr_state (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,

  difficulty DOUBLE PRECISION NOT NULL DEFAULT 5.0,  -- D: 1.0 (rất dễ) → 10.0 (rất khó)
  stability  DOUBLE PRECISION NOT NULL DEFAULT 0.0,  -- S: độ bền trí nhớ (ngày)
  reps       INT NOT NULL DEFAULT 0,                 -- số lần ôn tập hợp lệ
  lapses     INT NOT NULL DEFAULT 0,                 -- số lần quên (bị reset)

  last_reviewed_at TIMESTAMPTZ,                      -- thời điểm ôn gần nhất
  due_date         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_user_card_dsr UNIQUE (user_id, card_id)
);

-- Index tối ưu truy vấn thẻ đến hạn ôn
CREATE INDEX IF NOT EXISTS idx_dsr_due
  ON public.card_dsr_state (user_id, due_date ASC);

-- Đồng bộ quyền truy cập với các bảng còn lại
ALTER TABLE public.card_dsr_state DISABLE ROW LEVEL SECURITY;
```

**Ánh xạ tên cột giữa hai schema:**

| DSR (tài liệu gốc) | Schema hiện tại | Ghi chú |
| --- | --- | --- |
| `card_id` (PK) | `id` (PK) + `card_id` | Thêm `id` cho nhất quán |
| `user_id` | `user_id` | Giữ nguyên |
| `last_reviewed` | `last_reviewed_at` | Đổi tên cho khớp `card_srs_states` |
| `due_date` | `due_date` | Giữ nguyên |
| `difficulty` | `difficulty` | `FLOAT` → `DOUBLE PRECISION` |
| `stability` | `stability` | `FLOAT` → `DOUBLE PRECISION` |
| `reps` / `lapses` | `reps` / `lapses` | Giữ nguyên |

### 2.3. Drizzle ORM (`lib/db/schema.ts`)

```ts
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

export const cardDsrStates = sqliteTable('card_dsr_state', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  cardId: text('card_id').notNull().references(() => cards.id, { onDelete: 'cascade' }),
  difficulty: real('difficulty').notNull().default(5.0),
  stability: real('stability').notNull().default(0.0),
  reps: integer('reps').notNull().default(0),
  lapses: integer('lapses').notNull().default(0),
  lastReviewedAt: text('last_reviewed_at'),
  dueDate: text('due_date').notNull(),
})
```

---

## 3. Core Engine: Thuật Toán DSR

Tạo file `lib/srs/dsr.ts` (đặt cạnh `lib/srs/sm2.ts` để dễ so sánh):

```ts
export type DSRRating = 1 | 2 | 3 | 4
// 1: Again (Quên) | 2: Hard (Khó) | 3: Good (Nhớ tốt) | 4: Easy (Quá dễ)

export interface DSRState {
  difficulty: number // 1.0 – 10.0
  stability: number // ngày
  reps: number
  lapses: number
  lastReviewed: Date | null
  dueDate: Date
}

export const TARGET_RETENTION = 0.9 // Mục tiêu giữ xác suất nhớ 90%

export class DSREngine {
  /**
   * Xác suất nhớ lại tại thời điểm hiện tại: R = e^(-Δt / S)
   */
  static calculateRetrievability(stability: number, elapsedDays: number): number {
    if (stability <= 0) return 0
    return Math.exp((-Math.LN10 * elapsedDays) / (stability * 9))
  }

  /**
   * Khoảng cách ngày ôn kế tiếp dựa trên Stability và Target Retention
   */
  static calculateInterval(stability: number, targetRetention = TARGET_RETENTION): number {
    const interval = Math.round(stability * (Math.log(targetRetention) / Math.log(0.9)))
    return Math.max(1, interval)
  }

  /**
   * Khởi tạo trạng thái cho lần học đầu tiên
   */
  static initializeCard(rating: DSRRating): DSRState {
    const initD: Record<DSRRating, number> = { 1: 8.0, 2: 6.0, 3: 4.5, 4: 2.5 }
    const initS: Record<DSRRating, number> = { 1: 0.4, 2: 1.2, 3: 3.2, 4: 7.0 }

    const difficulty = initD[rating]
    const stability = initS[rating]
    const interval = this.calculateInterval(stability)

    const now = new Date()
    const dueDate = new Date(now)
    dueDate.setDate(dueDate.getDate() + interval)

    return {
      difficulty,
      stability,
      reps: rating === 1 ? 0 : 1,
      lapses: rating === 1 ? 1 : 0,
      lastReviewed: now,
      dueDate,
    }
  }

  /**
   * Cập nhật trạng thái ở các lần ôn tiếp theo
   */
  static reviewCard(current: DSRState, rating: DSRRating): DSRState {
    const now = new Date()
    const last = current.lastReviewed ? new Date(current.lastReviewed) : now
    const elapsedDays = Math.max(0, (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))

    const retrievability = this.calculateRetrievability(current.stability, elapsedDays)

    let newD = current.difficulty
    let newS = current.stability
    let lapses = current.lapses
    let reps = current.reps

    if (rating === 1) {
      // THẺ BỊ QUÊN (Lapse)
      newD = Math.min(10.0, current.difficulty + 1.6)
      newS = Math.max(0.4, current.stability * 0.25) // Phạt tụt độ bền
      reps = 0
      lapses += 1
    } else {
      // THẺ NHỚ ĐƯỢC (Pass)
      const dDelta: Record<DSRRating, number> = { 1: 0, 2: 0.6, 3: -0.2, 4: -0.8 }
      newD = Math.max(1.0, Math.min(10.0, current.difficulty + dDelta[rating]))

      // Thẻ càng dễ (D thấp) + ôn đúng lúc suýt quên (R thấp) → S tăng vọt
      const difficultyBonus = (11 - newD) / 5
      const retrievalBonus = Math.pow(1 - retrievability, 0.5) * 2
      const multiplier = 1 + difficultyBonus + retrievalBonus

      if (rating === 2) {
        newS = current.stability * 1.2 // Hard: tăng nhẹ
      } else if (rating === 4) {
        newS = current.stability * multiplier * 1.35 // Easy: tăng mạnh
      } else {
        newS = current.stability * multiplier // Good
      }
      reps += 1
    }

    const interval = this.calculateInterval(newS)
    const dueDate = new Date(now)
    dueDate.setDate(dueDate.getDate() + interval)

    return {
      difficulty: Number(newD.toFixed(2)),
      stability: Number(newS.toFixed(2)),
      reps,
      lapses,
      lastReviewed: now,
      dueDate,
    }
  }
}
```

---

## 4. Dạng Bài Tập 1: Flashcard Review

Người học thực hiện **Active Recall** (chủ động hồi tưởng) rồi tự đánh giá.

### Quy trình

1. Hiển thị **mặt trước**: nghĩa tiếng Việt + từ loại (part of speech).
2. Người học suy nghĩ đáp án trong đầu.
3. Nhấn **Show Answer** (hoặc phím `Space`): mặt sau lật mở, hiện từ tiếng Anh, phiên âm, câu ví dụ.
4. Chọn 1 trong 4 mức đánh giá:

| Nút | Nhãn | Ý nghĩa |
| --- | --- | --- |
| `1` | Again | Không nhớ hoặc nhớ sai |
| `2` | Hard | Nhớ đúng nhưng phải đắn đo lâu |
| `3` | Good | Nhớ đúng sau vài giây suy nghĩ tự nhiên |
| `4` | Easy | Nhớ ngay lập tức, không cần nỗ lực |

### Component (React / Next.js)

```tsx
import { DSREngine, DSRRating, DSRState } from '@/lib/srs/dsr'

export function FlashcardView({
  card,
  state,
  onSync,
}: {
  card: any
  state: DSRState
  onSync: (next: DSRState) => void
}) {
  const [revealed, setRevealed] = useState(false)

  const handleRate = (rating: DSRRating) => {
    const nextState =
      state.reps === 0 && !state.lastReviewed
        ? DSREngine.initializeCard(rating)
        : DSREngine.reviewCard(state, rating)

    onSync(nextState)
    setRevealed(false)
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
      {/* Mặt trước */}
      <div className="text-center my-6">
        <span className="text-xs uppercase tracking-wider text-slate-400">Vietnamese Meaning</span>
        <h2 className="text-2xl font-bold text-slate-900 mt-1">{card.vietnameseDefinition}</h2>
      </div>

      {/* Mặt sau */}
      {revealed ? (
        <div className="text-center pt-4 border-t border-slate-100 space-y-2">
          <h1 className="text-3xl font-extrabold text-indigo-600">{card.term}</h1>
          <p className="text-sm font-mono text-slate-500">{card.phonetic}</p>
          <p className="text-sm text-slate-700 italic">&quot;{card.exampleSentence}&quot;</p>

          <div className="grid grid-cols-4 gap-2 pt-6">
            <button onClick={() => handleRate(1)} className="p-2 text-xs font-semibold rounded bg-rose-50 text-rose-600 hover:bg-rose-100">1: Again</button>
            <button onClick={() => handleRate(2)} className="p-2 text-xs font-semibold rounded bg-amber-50 text-amber-600 hover:bg-amber-100">2: Hard</button>
            <button onClick={() => handleRate(3)} className="p-2 text-xs font-semibold rounded bg-blue-50 text-blue-600 hover:bg-blue-100">3: Good</button>
            <button onClick={() => handleRate(4)} className="p-2 text-xs font-semibold rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100">4: Easy</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setRevealed(true)}
          className="w-full mt-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition"
        >
          Show Answer (Space)
        </button>
      )}
    </div>
  )
}
```

---

## 5. Dạng Bài Tập 2: Điền Từ Có Gợi Ý

Khác với flashcard, dạng này yêu cầu người học **gõ từ vựng** vào chỗ trống trong câu ví dụ. Người học có thể mở dần các cấp gợi ý khi bị tắc.

### Hệ thống gợi ý luỹ tiến

| Cấp | Nội dung hiển thị | Ví dụ (`accomplish`) |
| --- | --- | --- |
| 0 | Ô trống rỗng | `[ _______ ]` |
| 1 | Ký tự đầu + số lượng ký tự | `a _ _ _ _ _ _ _ _ h` (10 chữ cái) |
| 2 | Thêm phiên âm IPA | `/əˈkʌm.plɪʃ/` |
| 3 | Đầu hàng — nút **Reveal Answer** | Hiện toàn bộ từ |

### Bảng quy đổi điểm → DSR Rating

Hệ thống so khớp chuỗi đã nhập với đáp án (chuẩn hoá hoa/thường, cắt khoảng trắng thừa) rồi ánh xạ:

| Kết quả nhập | Số gợi ý đã dùng | Thời gian | Rating | Ý nghĩa sư phạm |
| --- | --- | --- | --- | --- |
| Chính xác 100% | 0 | < 5 giây | **4: Easy** | Trí nhớ phản xạ tức thì |
| Chính xác 100% | 0 | ≥ 5 giây | **3: Good** | Nhớ chuẩn sau khi suy nghĩ |
| Chính xác 100% | 1 (ký tự đầu) | Bất kỳ | **3: Good** | Cần mồi nhẹ bộ nhớ |
| Chính xác 100% | 2 (ký tự + IPA) | Bất kỳ | **2: Hard** | Khó khăn lớn khi truy xuất |
| Sai / Bỏ cuộc | Đã bấm Reveal | Bất kỳ | **1: Again** | Quên từ, kích hoạt vòng học lại |

### Logic Evaluator

```ts
export interface FillBlankEvaluationInput {
  userInput: string
  targetWord: string
  hintsUsedCount: number // 0, 1, 2
  elapsedSeconds: number
  gaveUp: boolean
}

export function evaluateFillInBlank(
  input: FillBlankEvaluationInput
): { isCorrect: boolean; rating: DSRRating } {
  if (input.gaveUp) {
    return { isCorrect: false, rating: 1 } // Bỏ cuộc tính là Again
  }

  // Chuẩn hoá chuỗi so khớp
  const normalizedUser = input.userInput.trim().toLowerCase()
  const normalizedTarget = input.targetWord.trim().toLowerCase()

  const isCorrect = normalizedUser === normalizedTarget

  if (!isCorrect) {
    return { isCorrect: false, rating: 1 } // Nhập sai tính là Again
  }

  // Quy đổi rating theo số gợi ý đã dùng
  if (input.hintsUsedCount === 0) {
    return {
      isCorrect: true,
      rating: input.elapsedSeconds < 5 ? 4 : 3, // <5s là Easy, ngược lại là Good
    }
  }

  if (input.hintsUsedCount === 1) {
    return { isCorrect: true, rating: 3 } // Good
  }

  // Dùng từ 2 gợi ý trở lên
  return { isCorrect: true, rating: 2 } // Hard
}
```

---

## 6. API Cập Nhật Lịch Ôn

Cả hai dạng bài tập đều gửi kết quả về **cùng một endpoint**.

> **Lưu ý:** dự án dùng **Drizzle ORM** (`@/lib/db`), không dùng Supabase JS client trực tiếp.

```ts
// app/api/srs/grade/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cardDsrStates } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { DSREngine, DSRRating } from '@/lib/srs/dsr'
import { eq, and } from 'drizzle-orm'

export async function POST(req: Request) {
  const { cardId, rating } = (await req.json()) as { cardId: string; rating: DSRRating }

  const session = await getSession()
  const userId = session?.userId || 'user_demo_alex_lee'

  // 1. Lấy trạng thái DSR hiện tại
  const [current] = await db
    .select()
    .from(cardDsrStates)
    .where(and(eq(cardDsrStates.userId, userId), eq(cardDsrStates.cardId, cardId)))
    .limit(1)

  // 2. Tính trạng thái kế tiếp
  const nextState =
    !current || !current.lastReviewedAt
      ? DSREngine.initializeCard(rating)
      : DSREngine.reviewCard(
          {
            difficulty: current.difficulty,
            stability: current.stability,
            reps: current.reps,
            lapses: current.lapses,
            lastReviewed: current.lastReviewedAt ? new Date(current.lastReviewedAt) : null,
            dueDate: new Date(current.dueDate),
          },
          rating
        )

  // 3. Ghi nhận (upsert theo cặp user_id + card_id)
  const payload = {
    userId,
    cardId,
    difficulty: nextState.difficulty,
    stability: nextState.stability,
    reps: nextState.reps,
    lapses: nextState.lapses,
    lastReviewedAt: nextState.lastReviewed?.toISOString() ?? null,
    dueDate: nextState.dueDate.toISOString(),
  }

  if (current) {
    await db.update(cardDsrStates).set(payload).where(eq(cardDsrStates.id, current.id))
  } else {
    await db.insert(cardDsrStates).values({ id: `dsr_${userId}_${cardId}`, ...payload })
  }

  return NextResponse.json({
    success: true,
    nextDue: nextState.dueDate,
    intervalDays: DSREngine.calculateInterval(nextState.stability),
  })
}
```

---

## 7. Kiểm Thử Đơn Vị

```ts
// tests/dsr-engine.test.ts
import { DSREngine } from '../lib/srs/dsr'

describe('DSR Engine Math Consistency', () => {
  test('First review with Good rating should set stability around 3 days', () => {
    const state = DSREngine.initializeCard(3)
    expect(state.difficulty).toBe(4.5)
    expect(state.stability).toBeGreaterThanOrEqual(3.0)
    expect(state.reps).toBe(1)
    expect(state.lapses).toBe(0)
  })

  test('Forgotten card (Again) should increase difficulty and collapse stability', () => {
    const initial = DSREngine.initializeCard(3)
    const updated = DSREngine.reviewCard(initial, 1)

    expect(updated.difficulty).toBeGreaterThan(initial.difficulty)
    expect(updated.stability).toBeLessThan(initial.stability)
    expect(updated.reps).toBe(0)
    expect(updated.lapses).toBe(1)
  })

  test('Interval should never be below 1 day', () => {
    expect(DSREngine.calculateInterval(0)).toBe(1)
    expect(DSREngine.calculateInterval(0.1)).toBe(1)
  })

  test('Retrievability decays over time', () => {
    const fresh = DSREngine.calculateRetrievability(10, 0)
    const stale = DSREngine.calculateRetrievability(10, 20)
    expect(fresh).toBeGreaterThan(stale)
    expect(fresh).toBeCloseTo(1, 5)
  })
})
```

---

## 8. Lộ Trình Di Trú

| Bước | Việc cần làm | File / Lệnh | Trạng thái |
| --- | --- | --- | --- |
| 1 | Thêm bảng `card_dsr_state` | `lib/db/supabase_schema.sql` | ✅ Xong |
| 2 | Thêm Drizzle schema | `lib/db/schema.ts`, `lib/db/pg_schema.ts` | ✅ Xong |
| 3 | Tạo engine DSR | `lib/srs/dsr.ts` | ✅ Xong |
| 4 | Viết unit test | `tests/dsr-engine.test.ts` | ✅ 22/22 pass |
| 5 | Chạy song song SM-2 + DSR, ghi log so sánh `interval` | `app/api/srs/grade/route.ts` | ✅ Xong |
| 6 | Chuyển endpoint sang DSR, giữ SM-2 làm fallback | `app/api/srs/grade/route.ts` | ⏳ Chờ dữ liệu so sánh |
| 7 | (Tuỳ chọn) Xoá `card_srs_states` sau khi ổn định | migration | ⏳ Chưa |

### Áp dụng migration

```bash
# Tạo bảng card_dsr_state trên Supabase (idempotent, chạy lại an toàn)
pnpm tsx scripts/migrate-dsr.ts
```

### Kiểm tra DSR đang chạy

```bash
pnpm test    # 22 unit test cho engine + evaluator
```

Response của `POST /api/srs/grade` hiện trả về cả hai kết quả:

```json
{
  "success": true,
  "newState": { "repetition": 1, "interval": 6, "easeFactor": 2.5, "dueDate": "..." },
  "dsr": { "difficulty": 4.3, "stability": 7.5, "intervalDays": 8, "dueDate": "..." }
}
```

> Nếu bước DSR gặp lỗi, nó được bắt riêng và **không** làm hỏng việc chấm điểm SM-2 — `dsr` sẽ là `null`.

### Backfill dữ liệu từ SM-2 sang DSR

```sql
-- Quy đổi trạng thái SM-2 hiện có sang DSR (chạy 1 lần)
INSERT INTO public.card_dsr_state (
  id, user_id, card_id, difficulty, stability, reps, lapses, last_reviewed_at, due_date
)
SELECT
  'dsr_' || s.user_id || '_' || s.card_id,
  s.user_id,
  s.card_id,
  GREATEST(1.0, LEAST(10.0, 11.0 - s.ease_factor * 2)),  -- EF cao → D thấp
  GREATEST(0.4, s.interval::double precision),           -- interval ≈ stability
  s.repetition,
  CASE WHEN s.repetition = 0 THEN 1 ELSE 0 END,
  s.last_reviewed_at,
  s.due_date
FROM public.card_srs_states s
ON CONFLICT (user_id, card_id) DO NOTHING;
```
