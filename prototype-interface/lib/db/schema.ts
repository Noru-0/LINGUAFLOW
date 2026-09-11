import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const decks = sqliteTable('decks', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const cards = sqliteTable('cards', {
  id: text('id').primaryKey(),
  deckId: text('deck_id').notNull().references(() => decks.id, { onDelete: 'cascade' }),
  term: text('term').notNull(),
  vietnameseDefinition: text('vietnamese_definition').notNull(),
  phonetic: text('phonetic'),
  partOfSpeech: text('part_of_speech'),
  exampleSentence: text('example_sentence'),
  collocationsJson: text('collocations_json').default('[]'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const cardSrsStates = sqliteTable('card_srs_states', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  cardId: text('card_id').notNull().references(() => cards.id, { onDelete: 'cascade' }),
  repetition: integer('repetition').notNull().default(0),
  interval: integer('interval').notNull().default(0),
  easeFactor: real('ease_factor').notNull().default(2.5),
  dueDate: text('due_date').notNull(),
  lastReviewedAt: text('last_reviewed_at'),
})

// DSR (Difficulty – Stability – Retrievability) state, replacing SM-2 over time
export const cardDsrStates = sqliteTable('card_dsr_state', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  cardId: text('card_id').notNull().references(() => cards.id, { onDelete: 'cascade' }),
  difficulty: real('difficulty').notNull().default(5.0),
  stability: real('stability').notNull().default(0.0),
  reps: integer('reps').notNull().default(0),
  lapses: integer('lapses').notNull().default(0),
  dueDate: text('due_date').notNull(),
  lastReviewedAt: text('last_reviewed_at'),
})

export const reviewLogs = sqliteTable('review_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  cardId: text('card_id').notNull().references(() => cards.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  repetition: integer('repetition').notNull(),
  interval: integer('interval').notNull(),
  easeFactor: real('ease_factor').notNull(),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const translationPrompts = sqliteTable('translation_prompts', {
  id: text('id').primaryKey(),
  vietnameseText: text('vietnamese_text').notNull(),
  canonicalAnswersJson: text('canonical_answers_json').notNull(), // JSON string array
  grammarCategory: text('grammar_category').notNull(),
  grammarNotes: text('grammar_notes'),
  difficulty: text('difficulty').default('intermediate'),
})

export const translationLogs = sqliteTable('translation_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  promptId: text('prompt_id').notNull().references(() => translationPrompts.id, { onDelete: 'cascade' }),
  userSubmission: text('user_submission').notNull(),
  isCorrect: integer('is_correct', { mode: 'boolean' }).notNull(),
  matchedCanonical: text('matched_canonical'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const userStreaks = sqliteTable('user_streaks', {
  userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  currentStreak: integer('current_streak').notNull().default(0),
  longestStreak: integer('longest_streak').notNull().default(0),
  lastActivityDate: text('last_activity_date'),
})
