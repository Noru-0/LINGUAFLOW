-- ==========================================================
-- LINGUAFLOW: Supabase PostgreSQL Schema & RLS Setup
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

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_srs_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translation_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- Allow public read access to prompts
CREATE POLICY "Allow public read translation_prompts" ON public.translation_prompts FOR SELECT USING (true);
