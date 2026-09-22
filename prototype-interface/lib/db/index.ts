import Database from 'better-sqlite3'
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3'
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as sqliteSchema from './schema'
import * as pgSchema from './pg_schema'
import path from 'path'
import fs from 'fs'
import { INITIAL_COLLOCATIONS } from './initial_collocations'
import { INITIAL_SPEAKING_PROMPTS } from './initial_speaking_prompts'

let dbInstance: any = null
let initializedSqlite = false

function getSqliteDb() {
  const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'linguaflow.db')
  const dbDir = path.dirname(dbPath)

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }

  const sqlite = new Database(dbPath)
  sqlite.pragma('journal_mode = WAL')

  if (!initializedSqlite) {
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at TEXT NOT NULL
      );

      try { sqlite.exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';"); } catch {}

      CREATE TABLE IF NOT EXISTS decks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        is_public INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS cards (
        id TEXT PRIMARY KEY,
        deck_id TEXT NOT NULL,
        term TEXT NOT NULL,
        vietnamese_definition TEXT NOT NULL,
        phonetic TEXT,
        part_of_speech TEXT,
        example_sentence TEXT,
        collocations_json TEXT DEFAULT '[]',
        english_meaning TEXT,
        cefr_level TEXT,
        audio_url TEXT,
        image_url TEXT,
        all_definitions_json TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
      );

      try { sqlite.exec('ALTER TABLE cards ADD COLUMN english_meaning TEXT;') } catch {}
      try { sqlite.exec('ALTER TABLE cards ADD COLUMN cefr_level TEXT;') } catch {}
      try { sqlite.exec('ALTER TABLE cards ADD COLUMN audio_url TEXT;') } catch {}
      try { sqlite.exec('ALTER TABLE cards ADD COLUMN image_url TEXT;') } catch {}
      try { sqlite.exec('ALTER TABLE cards ADD COLUMN all_definitions_json TEXT;') } catch {}

      CREATE TABLE IF NOT EXISTS card_srs_states (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        card_id TEXT NOT NULL,
        repetition INTEGER NOT NULL DEFAULT 0,
        interval INTEGER NOT NULL DEFAULT 0,
        ease_factor REAL NOT NULL DEFAULT 2.5,
        due_date TEXT NOT NULL,
        last_reviewed_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS card_dsr_state (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        card_id TEXT NOT NULL,
        difficulty REAL NOT NULL DEFAULT 5.0,
        stability REAL NOT NULL DEFAULT 0.0,
        reps INTEGER NOT NULL DEFAULT 0,
        lapses INTEGER NOT NULL DEFAULT 0,
        due_date TEXT NOT NULL,
        last_reviewed_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_dsr_due ON card_dsr_state(user_id, due_date ASC);

      CREATE TABLE IF NOT EXISTS review_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        card_id TEXT NOT NULL,
        rating INTEGER NOT NULL,
        repetition INTEGER NOT NULL,
        interval INTEGER NOT NULL,
        ease_factor REAL NOT NULL DEFAULT 2.5,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS translation_prompts (
        id TEXT PRIMARY KEY,
        vietnamese_text TEXT NOT NULL,
        canonical_answers_json TEXT NOT NULL,
        grammar_category TEXT NOT NULL,
        grammar_notes TEXT,
        difficulty TEXT DEFAULT 'intermediate'
      );

      CREATE TABLE IF NOT EXISTS translation_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        prompt_id TEXT NOT NULL,
        user_submission TEXT NOT NULL,
        is_correct INTEGER NOT NULL,
        matched_canonical TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (prompt_id) REFERENCES translation_prompts(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS user_streaks (
        user_id TEXT PRIMARY KEY,
        current_streak INTEGER NOT NULL DEFAULT 0,
        longest_streak INTEGER NOT NULL DEFAULT 0,
        last_activity_date TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS translation_paragraphs (
        id TEXT PRIMARY KEY,
        theme_category TEXT NOT NULL,
        sub_topic TEXT NOT NULL,
        target_band TEXT NOT NULL DEFAULT 'B2',
        vietnamese_paragraph TEXT NOT NULL,
        target_collocations_json TEXT DEFAULT '[]',
        model_translation TEXT NOT NULL,
        grammar_breakdown TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS translation_paragraph_submissions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        paragraph_id TEXT NOT NULL,
        user_translation TEXT NOT NULL,
        overall_feedback TEXT,
        estimated_cefr TEXT,
        grammar_errors_json TEXT,
        better_alternatives_json TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (paragraph_id) REFERENCES translation_paragraphs(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS collocations (
        id TEXT PRIMARY KEY,
        head_word TEXT NOT NULL,
        tail_chunk TEXT NOT NULL,
        full_phrase TEXT NOT NULL,
        meaning_vi TEXT NOT NULL,
        example_sentence TEXT NOT NULL,
        cefr_level TEXT DEFAULT 'C1',
        ielts_topic TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS collocation_dsr_state (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        collocation_id TEXT NOT NULL,
        difficulty REAL NOT NULL DEFAULT 5.0,
        stability REAL NOT NULL DEFAULT 0.0,
        reps INTEGER NOT NULL DEFAULT 0,
        lapses INTEGER NOT NULL DEFAULT 0,
        due_date TEXT NOT NULL,
        last_reviewed_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (collocation_id) REFERENCES collocations(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_colloc_due ON collocation_dsr_state(user_id, due_date ASC);

      CREATE TABLE IF NOT EXISTS speaking_prompts (
        id TEXT PRIMARY KEY,
        part INTEGER NOT NULL,
        topic TEXT NOT NULL,
        question_prompt TEXT NOT NULL,
        cue_points_json TEXT DEFAULT '[]',
        model_response TEXT,
        suggested_vocabulary_json TEXT DEFAULT '[]',
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS speaking_submissions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        prompt_id TEXT NOT NULL,
        transcribed_text TEXT NOT NULL,
        estimated_band REAL,
        coherence_feedback TEXT,
        lexical_feedback TEXT,
        grammar_feedback TEXT,
        improved_version TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (prompt_id) REFERENCES speaking_prompts(id) ON DELETE CASCADE
      );
    `)
    try {
      const colCountRow = sqlite.prepare('SELECT count(*) as count FROM collocations').get() as { count: number }
      if (!colCountRow || colCountRow.count === 0) {
        const stmt = sqlite.prepare(`
          INSERT INTO collocations (id, head_word, tail_chunk, full_phrase, meaning_vi, example_sentence, cefr_level, ielts_topic, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        for (const item of INITIAL_COLLOCATIONS) {
          stmt.run(item.id, item.head_word, item.tail_chunk, item.full_phrase, item.meaning_vi, item.example_sentence, item.cefr_level, item.ielts_topic, new Date().toISOString())
        }
      }

      const spkCountRow = sqlite.prepare('SELECT count(*) as count FROM speaking_prompts').get() as { count: number }
      if (!spkCountRow || spkCountRow.count === 0) {
        const stmt = sqlite.prepare(`
          INSERT INTO speaking_prompts (id, part, topic, question_prompt, cue_points_json, model_response, suggested_vocabulary_json, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `)
        for (const item of INITIAL_SPEAKING_PROMPTS) {
          stmt.run(item.id, item.part, item.topic, item.question_prompt, item.cue_points_json, item.model_response, item.suggested_vocabulary_json, new Date().toISOString())
        }
      }
    } catch (e) {
      console.error('Error auto-seeding collocations & speaking prompts:', e)
    }
    initializedSqlite = true
  }

  return drizzleSqlite(sqlite, { schema: sqliteSchema })
}

export function getDb(): any {
  if (!dbInstance) {
    const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL

    if (connectionString && (connectionString.startsWith('postgres://') || connectionString.startsWith('postgresql://'))) {
      try {
        const client = postgres(connectionString, {
          prepare: false,
          ssl: 'require',
          connect_timeout: 10,
          idle_timeout: 10,
        })
        client.unsafe(`
          CREATE TABLE IF NOT EXISTS public.translation_paragraphs (
            id TEXT PRIMARY KEY,
            theme_category TEXT NOT NULL,
            sub_topic TEXT NOT NULL,
            target_band TEXT NOT NULL DEFAULT 'B2',
            vietnamese_paragraph TEXT NOT NULL,
            target_collocations_json TEXT DEFAULT '[]',
            model_translation TEXT NOT NULL,
            grammar_breakdown TEXT,
            created_at TEXT NOT NULL DEFAULT NOW()::text
          );

          CREATE TABLE IF NOT EXISTS public.translation_paragraph_submissions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
            paragraph_id TEXT NOT NULL REFERENCES public.translation_paragraphs(id) ON DELETE CASCADE,
            user_translation TEXT NOT NULL,
            overall_feedback TEXT,
            estimated_cefr TEXT,
            grammar_errors_json TEXT,
            better_alternatives_json TEXT,
            created_at TEXT NOT NULL DEFAULT NOW()::text
          );

          CREATE TABLE IF NOT EXISTS public.collocations (
            id TEXT PRIMARY KEY,
            head_word TEXT NOT NULL,
            tail_chunk TEXT NOT NULL,
            full_phrase TEXT NOT NULL,
            meaning_vi TEXT NOT NULL,
            example_sentence TEXT NOT NULL,
            cefr_level TEXT DEFAULT 'C1',
            ielts_topic TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT NOW()::text
          );

          CREATE TABLE IF NOT EXISTS public.collocation_dsr_state (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            collocation_id TEXT NOT NULL REFERENCES public.collocations(id) ON DELETE CASCADE,
            difficulty DOUBLE PRECISION NOT NULL DEFAULT 5.0,
            stability DOUBLE PRECISION NOT NULL DEFAULT 0.0,
            reps INTEGER NOT NULL DEFAULT 0,
            lapses INTEGER NOT NULL DEFAULT 0,
            due_date TEXT NOT NULL,
            last_reviewed_at TEXT
          );

          CREATE TABLE IF NOT EXISTS public.speaking_prompts (
            id TEXT PRIMARY KEY,
            part INTEGER NOT NULL,
            topic TEXT NOT NULL,
            question_prompt TEXT NOT NULL,
            cue_points_json TEXT DEFAULT '[]',
            model_response TEXT,
            suggested_vocabulary_json TEXT DEFAULT '[]',
            created_at TEXT NOT NULL DEFAULT NOW()::text
          );

          CREATE TABLE IF NOT EXISTS public.speaking_submissions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            prompt_id TEXT NOT NULL REFERENCES public.speaking_prompts(id) ON DELETE CASCADE,
            transcribed_text TEXT NOT NULL,
            estimated_band DOUBLE PRECISION,
            coherence_feedback TEXT,
            lexical_feedback TEXT,
            grammar_feedback TEXT,
            improved_version TEXT,
            created_at TEXT NOT NULL DEFAULT NOW()::text
          );
        `).catch(() => {})

        dbInstance = drizzlePostgres(client, { schema: pgSchema })
        console.log('Connected to Supabase PostgreSQL with Postgres schema dialect.')
      } catch (err) {
        console.warn('Failed to connect to Supabase PostgreSQL, falling back to local SQLite:', err)
        dbInstance = getSqliteDb()
      }
    } else {
      dbInstance = getSqliteDb()
    }
  }

  return dbInstance
}

export function fallbackToSqlite() {
  dbInstance = getSqliteDb()
  return dbInstance
}

// Export lazy Proxy db client
export const db = new Proxy({} as any, {
  get(_target, prop) {
    const instance = getDb()
    return (instance as any)[prop]
  },
})
