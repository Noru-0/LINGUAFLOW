-- ==========================================================
-- LINGUAFLOW: Supabase PostgreSQL Schema & Open RLS Policies
-- Copy and execute this script inside your Supabase SQL Editor
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. DECKS TABLE
CREATE TABLE IF NOT EXISTS public.decks (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CARDS TABLE
CREATE TABLE IF NOT EXISTS public.cards (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  deck_id TEXT NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
  term TEXT NOT NULL,
  vietnamese_definition TEXT NOT NULL,
  phonetic TEXT,
  part_of_speech TEXT,
  example_sentence TEXT,
  collocations_json JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CARD SRS STATES TABLE (SuperMemo SM-2)
CREATE TABLE IF NOT EXISTS public.card_srs_states (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  repetition INT NOT NULL DEFAULT 0,
  interval INT NOT NULL DEFAULT 0,
  ease_factor DOUBLE PRECISION NOT NULL DEFAULT 2.5,
  due_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_reviewed_at TIMESTAMPTZ,
  CONSTRAINT unique_user_card UNIQUE (user_id, card_id)
);

-- 4b. CARD DSR STATES TABLE (Difficulty - Stability - Retrievability)
-- Replaces card_srs_states over time; both are kept during the migration.
CREATE TABLE IF NOT EXISTS public.card_dsr_state (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,

  difficulty DOUBLE PRECISION NOT NULL DEFAULT 5.0,  -- D: 1.0 (rat de) -> 10.0 (rat kho)
  stability  DOUBLE PRECISION NOT NULL DEFAULT 0.0,  -- S: do ben tri nho (ngay)
  reps       INT NOT NULL DEFAULT 0,                 -- so lan on tap hop le
  lapses     INT NOT NULL DEFAULT 0,                 -- so lan quen (bi reset)

  due_date         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_reviewed_at TIMESTAMPTZ,

  CONSTRAINT unique_user_card_dsr UNIQUE (user_id, card_id)
);

-- Index to speed up "cards due now" queries
CREATE INDEX IF NOT EXISTS idx_dsr_due
  ON public.card_dsr_state (user_id, due_date ASC);

-- 5. REVIEW LOGS TABLE
CREATE TABLE IF NOT EXISTS public.review_logs (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  rating INT NOT NULL,
  repetition INT NOT NULL,
  interval INT NOT NULL,
  ease_factor DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. TRANSLATION PROMPTS TABLE
CREATE TABLE IF NOT EXISTS public.translation_prompts (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  vietnamese_text TEXT NOT NULL,
  canonical_answers_json JSONB NOT NULL,
  grammar_category TEXT NOT NULL,
  grammar_notes TEXT,
  difficulty TEXT DEFAULT 'intermediate'
);

-- 7. TRANSLATION LOGS TABLE
CREATE TABLE IF NOT EXISTS public.translation_logs (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  prompt_id TEXT NOT NULL REFERENCES public.translation_prompts(id) ON DELETE CASCADE,
  user_submission TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  matched_canonical TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. USER STREAKS TABLE
CREATE TABLE IF NOT EXISTS public.user_streaks (
  user_id TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  current_streak INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  last_activity_date DATE
);

-- 9. TRANSLATION PARAGRAPHS TABLE
CREATE TABLE IF NOT EXISTS public.translation_paragraphs (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  theme_category TEXT NOT NULL,
  sub_topic TEXT NOT NULL,
  target_band TEXT NOT NULL DEFAULT 'B2',
  vietnamese_paragraph TEXT NOT NULL,
  target_collocations_json JSONB DEFAULT '[]',
  model_translation TEXT NOT NULL,
  grammar_breakdown TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. TRANSLATION PARAGRAPH SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.translation_paragraph_submissions (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  paragraph_id TEXT NOT NULL REFERENCES public.translation_paragraphs(id) ON DELETE CASCADE,
  user_translation TEXT NOT NULL,
  overall_feedback TEXT,
  estimated_cefr TEXT,
  grammar_errors_json JSONB,
  better_alternatives_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Option A: Disable RLS for small study group cohort
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.decks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_srs_states DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_dsr_state DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.translation_prompts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.translation_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.translation_paragraphs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.translation_paragraph_submissions DISABLE ROW LEVEL SECURITY;

-- Option B: Alternatively create open policies if RLS is enabled
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    DROP POLICY IF EXISTS "Allow full access users" ON public.users;
    CREATE POLICY "Allow full access users" ON public.users FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'decks') THEN
    DROP POLICY IF EXISTS "Allow full access decks" ON public.decks;
    CREATE POLICY "Allow full access decks" ON public.decks FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cards') THEN
    DROP POLICY IF EXISTS "Allow full access cards" ON public.cards;
    CREATE POLICY "Allow full access cards" ON public.cards FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'card_srs_states') THEN
    DROP POLICY IF EXISTS "Allow full access card_srs_states" ON public.card_srs_states;
    CREATE POLICY "Allow full access card_srs_states" ON public.card_srs_states FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'card_dsr_state') THEN
    DROP POLICY IF EXISTS "Allow full access card_dsr_state" ON public.card_dsr_state;
    CREATE POLICY "Allow full access card_dsr_state" ON public.card_dsr_state FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'review_logs') THEN
    DROP POLICY IF EXISTS "Allow full access review_logs" ON public.review_logs;
    CREATE POLICY "Allow full access review_logs" ON public.review_logs FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'translation_prompts') THEN
    DROP POLICY IF EXISTS "Allow full access translation_prompts" ON public.translation_prompts;
    CREATE POLICY "Allow full access translation_prompts" ON public.translation_prompts FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'translation_logs') THEN
    DROP POLICY IF EXISTS "Allow full access translation_logs" ON public.translation_logs;
    CREATE POLICY "Allow full access translation_logs" ON public.translation_logs FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_streaks') THEN
    DROP POLICY IF EXISTS "Allow full access user_streaks" ON public.user_streaks;
    CREATE POLICY "Allow full access user_streaks" ON public.user_streaks FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
