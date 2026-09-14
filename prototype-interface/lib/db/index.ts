import Database from 'better-sqlite3'
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3'
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as sqliteSchema from './schema'
import * as pgSchema from './pg_schema'
import path from 'path'
import fs from 'fs'

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
        created_at TEXT NOT NULL
      );

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
    `)
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
