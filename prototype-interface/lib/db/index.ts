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
import { INITIAL_TOPICS } from './initial_topics'

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
        created_at TEXT NOT NULL,
        FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
        FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_card_topics_card ON card_topics(card_id);
      CREATE INDEX IF NOT EXISTS idx_card_topics_topic ON card_topics(topic_id);
      CREATE INDEX IF NOT EXISTS idx_card_topics_primary ON card_topics(card_id, is_primary);

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
      if (!topicCountRow || topicCountRow.count === 0) {
        const insertTopicStmt = sqlite.prepare(`
          INSERT INTO topics (id, parent_id, name_en, name_vi, description, icon, color, order_index, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        let order = 0
        for (const major of INITIAL_TOPICS) {
          order++
          insertTopicStmt.run(major.id, null, major.nameEn, major.nameVi, major.description, major.icon, major.color, order, new Date().toISOString())
          for (const sub of major.subtopics) {
            order++
            insertTopicStmt.run(sub.id, sub.parentId, sub.nameEn, sub.nameVi, sub.description, sub.icon || 'Folder', major.color, order, new Date().toISOString())
          }
        }
      }
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
          connect_timeout: 10,
          idle_timeout: 10,
        })
        client.unsafe(`
          ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

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
            category TEXT,
            head_word TEXT NOT NULL,
            tail_chunk TEXT NOT NULL,
            full_phrase TEXT NOT NULL,
            meaning_vi TEXT NOT NULL,
            example_sentence TEXT NOT NULL,
            distractors_json TEXT DEFAULT '[]',
            cefr_level TEXT DEFAULT 'C1',
            ielts_topic TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT NOW()::text
          );

          ALTER TABLE public.collocations ADD COLUMN IF NOT EXISTS category TEXT;
          ALTER TABLE public.collocations ADD COLUMN IF NOT EXISTS distractors_json TEXT DEFAULT '[]';

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

          CREATE TABLE IF NOT EXISTS public.topics (
            id VARCHAR(50) PRIMARY KEY,
            parent_id VARCHAR(50) REFERENCES public.topics(id) ON DELETE CASCADE,
            name_en VARCHAR(100) NOT NULL,
            name_vi VARCHAR(100) NOT NULL,
            description TEXT,
            icon VARCHAR(50) DEFAULT 'Folder',
            color VARCHAR(20) DEFAULT '#3B82F6',
            order_index INT DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );

          CREATE INDEX IF NOT EXISTS idx_topics_parent ON public.topics(parent_id);

          CREATE TABLE IF NOT EXISTS public.card_topics (
            id VARCHAR(100) PRIMARY KEY,
            card_id VARCHAR(100) NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
            topic_id VARCHAR(50) NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
            is_primary BOOLEAN NOT NULL DEFAULT TRUE,
            confidence REAL DEFAULT 1.0,
            assigned_by VARCHAR(20) DEFAULT 'ai',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            CONSTRAINT uq_card_topic UNIQUE(card_id, topic_id)
          );

          CREATE INDEX IF NOT EXISTS idx_card_topics_card ON public.card_topics(card_id);
          CREATE INDEX IF NOT EXISTS idx_card_topics_topic ON public.card_topics(topic_id);
          CREATE INDEX IF NOT EXISTS idx_card_topics_primary ON public.card_topics(card_id, is_primary);

          CREATE TABLE IF NOT EXISTS public.user_topic_stats (
            user_id VARCHAR(100) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
            topic_id VARCHAR(50) NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
            total_cards INT NOT NULL DEFAULT 0,
            learning_cards INT NOT NULL DEFAULT 0,
            mature_cards INT NOT NULL DEFAULT 0,
            avg_retrievability REAL NOT NULL DEFAULT 0.0,
            last_studied_at TIMESTAMPTZ,
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            PRIMARY KEY (user_id, topic_id)
          );

          CREATE INDEX IF NOT EXISTS idx_user_topic_stats_user ON public.user_topic_stats(user_id);

          ALTER TABLE public.topics DISABLE ROW LEVEL SECURITY;
          ALTER TABLE public.card_topics DISABLE ROW LEVEL SECURITY;
          ALTER TABLE public.user_topic_stats DISABLE ROW LEVEL SECURITY;
        `).then(async () => {
          try {
            const countRes = await client`SELECT count(*) FROM public.topics`;
            if (countRes && Number(countRes[0]?.count) === 0) {
              let order = 0;
              for (const major of INITIAL_TOPICS) {
                order++;
                await client`
                  INSERT INTO public.topics (id, parent_id, name_en, name_vi, description, icon, color, order_index)
                  VALUES (${major.id}, NULL, ${major.nameEn}, ${major.nameVi}, ${major.description || null}, ${major.icon || 'Folder'}, ${major.color || '#3B82F6'}, ${order})
                  ON CONFLICT (id) DO NOTHING
                `;
                for (const sub of major.subtopics) {
                  order++;
                  await client`
                    INSERT INTO public.topics (id, parent_id, name_en, name_vi, description, icon, color, order_index)
                    VALUES (${sub.id}, ${sub.parentId}, ${sub.nameEn}, ${sub.nameVi}, ${sub.description || null}, ${sub.icon || 'Folder'}, ${major.color || '#3B82F6'}, ${order})
                    ON CONFLICT (id) DO NOTHING
                  `;
                }
              }
            }
          } catch (seedTopicsErr) {
            console.warn('Auto-seed topics warning:', seedTopicsErr);
          }
        }).catch(() => {})

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
