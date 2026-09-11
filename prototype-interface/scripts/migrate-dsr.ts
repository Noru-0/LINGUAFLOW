/**
 * One-off migration: create the `card_dsr_state` table (DSR algorithm).
 *
 * Usage:
 *   pnpm tsx scripts/migrate-dsr.ts
 *
 * Reads DATABASE_URL from .env.local (same as the app).
 */

import fs from 'fs'
import path from 'path'
import postgres from 'postgres'

// Minimal .env.local loader (avoids adding a dotenv dependency)
function loadEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) return

  for (const rawLine of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const eq = line.indexOf('=')
    if (eq === -1) continue

    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (!process.env[key]) process.env[key] = value
  }
}

const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS public.card_dsr_state (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,

  difficulty DOUBLE PRECISION NOT NULL DEFAULT 5.0,
  stability  DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  reps       INT NOT NULL DEFAULT 0,
  lapses     INT NOT NULL DEFAULT 0,

  due_date         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_reviewed_at TIMESTAMPTZ,

  CONSTRAINT unique_user_card_dsr UNIQUE (user_id, card_id)
);

CREATE INDEX IF NOT EXISTS idx_dsr_due
  ON public.card_dsr_state (user_id, due_date ASC);

ALTER TABLE public.card_dsr_state DISABLE ROW LEVEL SECURITY;
`

async function main() {
  loadEnvLocal()

  const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL
  if (!connectionString) {
    console.error('DATABASE_URL is not set. Aborting.')
    process.exit(1)
  }

  const sql = postgres(connectionString, { prepare: false, ssl: 'require', max: 1 })

  try {
    console.log('Applying DSR migration...')
    await sql.unsafe(MIGRATION_SQL)
    console.log('card_dsr_state table is ready.')

    const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM public.card_dsr_state`
    console.log(`Existing DSR rows: ${count}`)
  } finally {
    await sql.end()
  }
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
