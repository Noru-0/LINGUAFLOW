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
import { INITIAL_TOPICS, ALL_TAXONOMY_TOPICS } from './initial_topics'

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

      CREATE TABLE IF NOT EXISTS card_memory_state (
        card_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        memory_level INTEGER NOT NULL DEFAULT 1,
        difficulty REAL NOT NULL DEFAULT 5.0,
        stability REAL NOT NULL DEFAULT 0.5,
        reps INTEGER NOT NULL DEFAULT 0,
        lapses INTEGER NOT NULL DEFAULT 0,
        last_reviewed TEXT,
        golden_time TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_golden_time ON card_memory_state(user_id, golden_time ASC);

      CREATE TABLE IF NOT EXISTS card_review_history (
        id TEXT PRIMARY KEY,
        card_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        rating INTEGER NOT NULL,
        reviewed_at TEXT NOT NULL DEFAULT (datetime('now')),
        elapsed_days REAL NOT NULL,
        retrievability REAL NOT NULL,
        old_difficulty REAL NOT NULL,
        new_difficulty REAL NOT NULL,
        old_stability REAL NOT NULL,
        new_stability REAL NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_review_history_user ON card_review_history(user_id, card_id);


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

      CREATE TABLE IF NOT EXISTS topics (
        id TEXT PRIMARY KEY,
        parent_id TEXT,
        name_en TEXT NOT NULL,
        name_vi TEXT NOT NULL,
        description TEXT,
        icon TEXT DEFAULT 'Folder',
        color TEXT DEFAULT '#3B82F6',
        order_index INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (parent_id) REFERENCES topics(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_topics_parent ON topics(parent_id);

      CREATE TABLE IF NOT EXISTS card_topics (
        id TEXT PRIMARY KEY,
        card_id TEXT NOT NULL,
        topic_id TEXT NOT NULL,
        is_primary INTEGER NOT NULL DEFAULT 1,
        confidence REAL DEFAULT 1.0,
        assigned_by TEXT DEFAULT 'ai',
        predicted_main_topic TEXT,
        predicted_subtopic TEXT,
        human_verified INTEGER NOT NULL DEFAULT 0,
        prediction_status TEXT DEFAULT 'accepted',
        model_version TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
        FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_card_topics_card ON card_topics(card_id);
      CREATE INDEX IF NOT EXISTS idx_card_topics_topic ON card_topics(topic_id);
      CREATE INDEX IF NOT EXISTS idx_card_topics_primary ON card_topics(card_id, is_primary);

      CREATE TABLE IF NOT EXISTS card_topic_review_history (
        id TEXT PRIMARY KEY,
        card_id TEXT NOT NULL,
        action TEXT NOT NULL,
        previous_topic_id TEXT,
        new_topic_id TEXT NOT NULL,
        actor TEXT NOT NULL DEFAULT 'system',
        created_at TEXT NOT NULL,
        FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS user_topic_stats (
        user_id TEXT NOT NULL,
        topic_id TEXT NOT NULL,
        total_cards INTEGER NOT NULL DEFAULT 0,
        learning_cards INTEGER NOT NULL DEFAULT 0,
        mature_cards INTEGER NOT NULL DEFAULT 0,
        avg_retrievability REAL NOT NULL DEFAULT 0.0,
        last_studied_at TEXT,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (user_id, topic_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_user_topic_stats_user ON user_topic_stats(user_id);
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

      const topicCountRow = sqlite.prepare('SELECT count(*) as count FROM topics').get() as { count: number }
      if (!topicCountRow || topicCountRow.count < 15) {
        const insertTopicStmt = sqlite.prepare(`
          INSERT OR IGNORE INTO topics (id, parent_id, name_en, name_vi, description, icon, color, order_index, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        let order = 0
        for (const major of ALL_TAXONOMY_TOPICS) {
          order++
          insertTopicStmt.run(major.id, null, major.nameEn, major.nameVi, major.description, major.icon, major.color, order, new Date().toISOString())
          for (const sub of major.subtopics) {
            order++
            insertTopicStmt.run(sub.id, sub.parentId, sub.nameEn, sub.nameVi, sub.description, sub.icon || 'Folder', major.color, order, new Date().toISOString())
          }
        }
      } else {
        // Ensure General Vocabulary ('gen' + 'gen.*') is present even on pre-existing DBs
        const insertIgnoreStmt = sqlite.prepare(`
          INSERT OR IGNORE INTO topics (id, parent_id, name_en, name_vi, description, icon, color, order_index, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        let order = 100
        for (const major of ALL_TAXONOMY_TOPICS) {
          order++
          insertIgnoreStmt.run(major.id, null, major.nameEn, major.nameVi, major.description, major.icon, major.color, order, new Date().toISOString())
          for (const sub of major.subtopics) {
            order++
            insertIgnoreStmt.run(sub.id, sub.parentId, sub.nameEn, sub.nameVi, sub.description, sub.icon || 'Folder', major.color, order, new Date().toISOString())
          }
        }
      }

      try { sqlite.exec('ALTER TABLE card_topics ADD COLUMN predicted_main_topic TEXT;') } catch {}
      try { sqlite.exec('ALTER TABLE card_topics ADD COLUMN predicted_subtopic TEXT;') } catch {}
      try { sqlite.exec('ALTER TABLE card_topics ADD COLUMN human_verified INTEGER NOT NULL DEFAULT 0;') } catch {}
      try { sqlite.exec("ALTER TABLE card_topics ADD COLUMN prediction_status TEXT DEFAULT 'accepted';") } catch {}
      try { sqlite.exec('ALTER TABLE card_topics ADD COLUMN model_version TEXT;') } catch {}
    } catch (e) {
      console.error('Error auto-seeding collocations, speaking prompts & topics:', e)
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
          max: 5,
          connect_timeout: 15,
          idle_timeout: 20,
        })

        const pgDb = drizzlePostgres(client, { schema: pgSchema })

        // Fast read-only schema check (avoids ACCESS EXCLUSIVE locks on concurrent cold starts)
        ;(async () => {
          try {
            const probe = await client`
              SELECT
                to_regclass('public.card_topic_review_history') AS rev_tbl,
                to_regclass('public.topics') AS topics_tbl,
                COALESCE((SELECT count(*)::int FROM public.topics), 0) AS topic_cnt
            `
            const row = probe?.[0]
            if (row?.topics_tbl && !row?.rev_tbl) {
              await client.unsafe(`
                ALTER TABLE public.card_topics ADD COLUMN IF NOT EXISTS predicted_main_topic VARCHAR(50);
                ALTER TABLE public.card_topics ADD COLUMN IF NOT EXISTS predicted_subtopic VARCHAR(50);
                ALTER TABLE public.card_topics ADD COLUMN IF NOT EXISTS human_verified BOOLEAN NOT NULL DEFAULT FALSE;
                ALTER TABLE public.card_topics ADD COLUMN IF NOT EXISTS prediction_status VARCHAR(20) DEFAULT 'accepted';
                ALTER TABLE public.card_topics ADD COLUMN IF NOT EXISTS model_version VARCHAR(30);
                CREATE TABLE IF NOT EXISTS public.card_topic_review_history (
                  id VARCHAR(100) PRIMARY KEY,
                  card_id VARCHAR(100) NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
                  action VARCHAR(30) NOT NULL,
                  previous_topic_id VARCHAR(50),
                  new_topic_id VARCHAR(50) NOT NULL,
                  actor VARCHAR(50) NOT NULL DEFAULT 'system',
                  created_at TIMESTAMPTZ DEFAULT NOW()
                );
              `)
            }
            if (row?.topics_tbl && Number(row?.topic_cnt ?? 0) < 56) {
              const topicRows: any[] = []
              let order = 0
              for (const major of ALL_TAXONOMY_TOPICS) {
                order++
                topicRows.push({
                  id: major.id,
                  parentId: null,
                  nameEn: major.nameEn,
                  nameVi: major.nameVi,
                  description: major.description || null,
                  icon: major.icon || 'Folder',
                  color: major.color || '#3B82F6',
                  orderIndex: order,
                })
                for (const sub of major.subtopics) {
                  order++
                  topicRows.push({
                    id: sub.id,
                    parentId: sub.parentId,
                    nameEn: sub.nameEn,
                    nameVi: sub.nameVi,
                    description: sub.description || null,
                    icon: sub.icon || 'Folder',
                    color: major.color || '#3B82F6',
                    orderIndex: order,
                  })
                }
              }
              await pgDb.insert(pgSchema.topics).values(topicRows).onConflictDoNothing()
            }
          } catch (bgErr) {
            console.warn('Postgres lightweight schema check warning:', bgErr)
          }
        })()

        dbInstance = pgDb
        console.log('Connected to Supabase PostgreSQL with Postgres schema dialect.')
      } catch (err) {
        console.warn('Failed to connect to Supabase PostgreSQL, attempting local SQLite fallback:', err)
        dbInstance = getSqliteDb()
      }
    } else {
      dbInstance = getSqliteDb()
    }
  }

  return dbInstance
}

export function fallbackToSqlite() {
  const hasPg = Boolean(process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL)
  if (hasPg && dbInstance) {
    // On Vercel serverless Linux, better-sqlite3 native bindings are often unavailable;
    // do not poison the shared Postgres client after a transient timeout.
    return dbInstance
  }
  try {
    dbInstance = getSqliteDb()
    return dbInstance
  } catch (err) {
    console.warn('SQLite fallback unavailable in this environment:', err)
    return dbInstance
  }
}

// Export lazy Proxy db client
export const db = new Proxy({} as any, {
  get(_target, prop) {
    const instance = getDb()
    return (instance as any)[prop]
  },
})
