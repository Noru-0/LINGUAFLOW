# Prototype Interface Navigator

Navigate and modify the `prototype-interface` Next.js project. Use when the user asks to update, find, or fix code in the IELTS learning web app.

---

## Architecture Overview

The `prototype-interface` project is a **Next.js (App Router)** English learning application integrating **Supabase**, **Gemini AI**, and **Spaced Repetition System (SRS/DSR)**.

---

## File Structure & Directory Guide

### 1. Frontend & UI
- **Pages**: `app/page.tsx` (Main), `app/admin/page.tsx`, `app/login/page.tsx`
- **Components**: `components/`
- **Features**: `components/speaking/SpeakingPractice.tsx`, `components/collocation/CollocationMatcher.tsx`
- **Auth**: `components/auth/AuthModal.tsx`
- **UI/Mascots**: `components/ui/` (e.g., `ThemeToggle.tsx`, `TotoroMascot.tsx`)
- **Hooks**: `hooks/useSpeechRecognition.ts` (Handles browser Web Speech API)

### 2. Backend & API Routes (`app/api/`)
- **SRS & Grading**: `app/api/srs/`
- **Translation**: `app/api/translate/` (Includes weekly generation & submissions)
- **Speaking**: `app/api/speaking/`
- **Auth & Admin**: `app/api/auth/` and `app/api/admin/`
- **Vocabulary / Cards**: `app/api/cards/`
- **Decks**: `app/api/decks/`

### 3. Core Engine & Services
- **Gemini Prompts & LLM Logic**: `services/` (e.g., `gemini-paragraph-generator.ts`, `gemini-speaking-evaluator.ts`, `gemini-translation-evaluator.ts`)
- **Dictionary Scrapers**: `services/cambridge-scraper.ts`, `services/vocabulary-pipeline.ts`
- **Spaced Repetition (DSR)**: `lib/golden-time-engine.ts`, `lib/srs/dsr.ts`
- **Database & Schemas**: `lib/db/` (Contains `schema.ts`, `supabase_schema.sql`, and seed data files)
- **Auth Core**: `lib/auth/session.ts`

### 4. Tests & Scripts
- **Tests**: `tests/` for DSR and Golden Time engine maths
- **Standalone Scripts**: `scripts/` for testing APIs locally without the UI (e.g., `test-gemini-enrich.ts`)

---

## Guidelines for Modifying

- **LLM / Gemini logic**: Modify files in `services/`.
- **Interval / DSR logic**: Modify `lib/golden-time-engine.ts` or `lib/srs/dsr.ts`.
- **Database Schema**: Update `lib/db/supabase_schema.sql` and `lib/db/schema.ts`.

