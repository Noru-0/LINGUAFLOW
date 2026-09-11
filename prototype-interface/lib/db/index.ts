import Database from 'better-sqlite3'
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import path from 'path'
import fs from 'fs'

let dbInstance: BetterSQLite3Database<typeof schema> | null = null
let initialized = false

export function getDb(): BetterSQLite3Database<typeof schema> {
  if (!dbInstance) {
    const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'linguaflow.db')
    const dbDir = path.dirname(dbPath)

    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
    }

    const sqlite = new Database(dbPath)
    sqlite.pragma('journal_mode = WAL')

    if (!initialized) {
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
          created_at TEXT NOT NULL,
          FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
        );

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

        CREATE TABLE IF NOT EXISTS review_logs (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          card_id TEXT NOT NULL,
          rating INTEGER NOT NULL,
          repetition INTEGER NOT NULL,
          interval INTEGER NOT NULL,
          ease_factor REAL NOT NULL,
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
      initialized = true
    }

    dbInstance = drizzle(sqlite, { schema })
  }

  return dbInstance
}

// Export proxy/getter db instance
export const db = new Proxy({} as BetterSQLite3Database<typeof schema>, {
  get(_target, prop) {
    const instance = getDb()
    return (instance as any)[prop]
  },
})
