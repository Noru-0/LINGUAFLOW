# Implementation Plan - LINGUAFLOW Backend & Full-Stack Integration

LinguaFlow is an ultra-lightweight, self-hosted, and distraction-free English learning web platform. Currently, `prototype-interface` provides a high-fidelity frontend mockup with client-side mock state. This plan outlines the technical design and phased implementation of the complete backend stack and its integration with the existing UI.

---

## Technical Overview

The backend architecture follows a **Layered Modular Monolith** within Next.js (App Router):
- **Database & ORM**: PostgreSQL (via Supabase) or SQLite 3 with **Drizzle ORM** (or Prisma) for type-safe schema management and zero-latency queries.
- **Authentication**: Lightweight Session / JWT Authentication with HTTP-only cookies and `bcryptjs` password hashing.
- **SRS Engine**: Implementation of SuperMemo SM-2 algorithm for automated card scheduling (`EF`, `Repetitions`, `Interval`, `due_date`).
- **Translation Engine**: String normalization pipeline (whitespace collapse, punctuation stripping, lowercase conversion), canonical answer array matching, and word diff generation.
- **Analytics & History**: Streak tracking, card stability classification (Learning, Young, Mature), and detailed error logs.

---

## User Review Required

> [!IMPORTANT]
> **Database & ORM Choice**: We recommend **Drizzle ORM** with **SQLite** for local development (zero configuration needed) and seamless deployment to **Supabase PostgreSQL** for production.
>
> **Authentication Approach**: Session cookies stored via HTTP-only cookies for simplicity and security within the Next.js App Router environment.

---

## Proposed Architectural Components

```
d:\5\EN_web\prototype-interface\
├── lib/
│   ├── db/
│   │   ├── index.ts                # Database connection client
│   │   ├── schema.ts               # Drizzle database tables & relations
│   │   └── seed.ts                 # Seed initial AWL vocabulary & Tatoeba translation prompts
│   ├── auth/
│   │   ├── password.ts             # Bcrypt password hashing / verification
│   │   ├── session.ts              # JWT / Session cookie management
│   │   └── middleware.ts           # Route protection helpers
│   ├── srs/
│   │   └── sm2.ts                  # SuperMemo SM-2 math & interval calculations
│   ├── translation/
│   │   ├── normalizer.ts           # String normalization & cleaning pipeline
│   │   ├── evaluator.ts            # Canonical answer evaluation & word diff engine
│   │   └── dictionary.ts           # Free Dictionary API wrapper for fallback phonetics
│   └── analytics/
│       └── streak.ts               # Streak & retention metrics logic
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts      # POST: Authenticate user
│   │   │   ├── register/route.ts   # POST: Register user
│   │   │   ├── logout/route.ts     # POST: Terminate session
│   │   │   └── me/route.ts         # GET: Fetch authenticated profile
│   │   ├── srs/
│   │   │   ├── queue/route.ts      # GET: Due cards for review
│   │   │   └── grade/route.ts      # POST: Grade card with SM-2 rating (1-4)
│   │   ├── translate/
│   │   │   ├── prompt/route.ts     # GET: Next translation exercise
│   │   │   └── submit/route.ts     # POST: Submit translation and receive diff/notes
│   │   ├── decks/
│   │   │   ├── route.ts            # GET/POST: Decks listing & creation
│   │   │   └── [id]/cards/route.ts # GET/POST: Cards within deck & bulk import
│   │   └── analytics/
│   │       └── overview/route.ts   # GET: Retention metrics, heatmap & error log
└── components/ (Refactored modular UI components mapped from prototype-interface/app/page.tsx)
```

---

## Step-by-Step Implementation Strategy

### Phase 1: Database Schema & Core Business Logic

#### 1. Database Schema (`lib/db/schema.ts`)
Define relational tables:
- **`users`**: `id`, `email`, `password_hash`, `name`, `role`, `created_at`
- **`decks`**: `id`, `user_id`, `title`, `description`, `is_public`, `created_at`
- **`cards`**: `id`, `deck_id`, `term`, `vietnamese_definition`, `phonetic`, `part_of_speech`, `example_sentence`, `collocations` (JSON array)
- **`card_srs_states`**: `id`, `user_id`, `card_id`, `repetition`, `interval`, `ease_factor`, `due_date`, `last_reviewed_at`
- **`review_logs`**: `id`, `user_id`, `card_id`, `rating`, `repetition`, `interval`, `ease_factor`, `created_at`
- **`translation_prompts`**: `id`, `vietnamese_text`, `canonical_answers` (JSON array), `grammar_category`, `grammar_notes`, `difficulty`
- **`translation_logs`**: `id`, `user_id`, `prompt_id`, `user_submission`, `is_correct`, `matched_canonical`, `created_at`
- **`user_streaks`**: `id`, `user_id`, `current_streak`, `longest_streak`, `last_activity_date`

#### 2. SuperMemo SM-2 Engine (`lib/srs/sm2.ts`)
- Implement grade mapping: `1 (Again) -> q=1`, `2 (Hard) -> q=3`, `3 (Good) -> q=4`, `4 (Easy) -> q=5`.
- Calculate updated $EF'$:
  $$EF' = \max(1.3, EF + (0.1 - (5 - q) \times (0.08 + (5 - q) \times 0.02)))$$
- Update intervals:
  - If $q \ge 3$: $I_0 = 1$, $I_1 = 6$, $I_n = I_{n-1} \times EF'$.
  - If $q < 3$: Reset $R = 0, I = 1$.
- Set `due_date = NOW() + I days`.

#### 3. Text Normalizer & Translation Diff Engine (`lib/translation/normalizer.ts`, `evaluator.ts`)
- **Normalizer Rules**:
  1. `.trim()`
  2. `.replace(/\s+/g, ' ')`
  3. Strip punctuation: `.replace(/[.,!?;:"'\\-]/g, '')`
  4. `.toLowerCase()`
- **Evaluator**:
  - Compare normalized user input against normalized canonical answers.
  - If match found, return `is_correct = true`, matching canonical answer, and grammar notes.
  - Generate word-level diff (using `diff` package) for comparative feedback.

---

### Phase 2: Authentication & API Routes

#### 1. Authentication Endpoints (`app/api/auth/*`)
- `/api/auth/register`: Validate input, hash password with `bcryptjs`, insert user record, set session cookie.
- `/api/auth/login`: Verify credentials against `password_hash`, issue session JWT cookie.
- `/api/auth/me`: Decode cookie and return authenticated user details.

#### 2. SRS Review API (`app/api/srs/*`)
- `/api/srs/queue`: Select cards joined with `card_srs_states` where `due_date <= CURRENT_TIMESTAMP` (limit 25 per session).
- `/api/srs/grade`: Execute SM-2 algorithm, update `card_srs_states`, write audit record to `review_logs`, update user streak.

#### 3. Translation Practice API (`app/api/translate/*`)
- `/api/translate/prompt`: Fetch next uncompleted translation prompt or random prompt for grammar category.
- `/api/translate/submit`: Run normalizer & evaluator, save `translation_logs`, return feedback (status, canonical match, grammar notes, word diff).

#### 4. Deck & Bulk Import API (`app/api/decks/*`)
- `/api/decks`: CRUD operations for decks.
- `/api/decks/[id]/cards`: Card creation and bulk CSV/JSON ingestion parser.

#### 5. Analytics API (`app/api/analytics/overview`)
- Fetch due count, mastery percentage, stability distribution (Learning, Young, Mature), 30-day activity matrix, and past translation mistake log.

---

### Phase 3: Frontend Integration (`prototype-interface/`)

- Refactor `prototype-interface/app/page.tsx` into clean, modular client components and custom data-fetching hooks (or SWR/React Query).
- Connect `Dashboard`, `Review`, `Translate`, `Decks`, and `Analytics` views to live API routes.
- Preserve keyboard-first shortcuts (`Space` to flip, `1-4` to grade, `Enter` to submit translation).
- Add error boundary, toast notifications, and optimistic UI updates for instant response times (`< 50ms`).

---

### Phase 4: Database Seeding & Initial Content Ingestion

- Write `lib/db/seed.ts` script to populate database with:
  1. Default Academic Word List (AWL) vocabulary cards.
  2. Initial set of Tatoeba Vietnamese-to-English translation prompts (Conditionals, Inversions, Relative Clauses).

---

## Verification Plan

### Automated Tests
- **SM-2 Engine Tests**: Unit test SM-2 interval calculations across all quality ratings (`Again`, `Hard`, `Good`, `Easy`).
- **Text Normalizer & Evaluator Tests**: Unit test normalization (punctuation, multi-space, casing) and canonical matching logic.
- **API Integration Tests**: End-to-end testing of user login, queue fetching, grading submission, and streak updates.

### Manual Verification
1. **Flashcard Review Flow**: Perform a complete review session using keyboard shortcuts (`Space` + `1-4`), verify database state updates and next card load.
2. **Grammar Translation Flow**: Submit both exact, normalized alternative, and incorrect translation inputs to verify comparative diff display and grammar notes.
3. **Bulk Import Flow**: Upload a sample CSV containing 10 vocabulary cards and verify table population.
4. **Analytics & Streak Verification**: Perform reviews on consecutive days (or mock timestamps) and verify streak counter increment.
