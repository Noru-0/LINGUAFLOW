import { pgTable, text, integer, doublePrecision, boolean } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role').default('user'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const decks = pgTable('decks', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  isPublic: boolean('is_public').notNull().default(false),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const cards = pgTable('cards', {
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

export const cardSrsStates = pgTable('card_srs_states', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  cardId: text('card_id').notNull().references(() => cards.id, { onDelete: 'cascade' }),
  repetition: integer('repetition').notNull().default(0),
  interval: integer('interval').notNull().default(0),
  easeFactor: doublePrecision('ease_factor').notNull().default(2.5),
  dueDate: text('due_date').notNull(),
  lastReviewedAt: text('last_reviewed_at'),
})

// DSR (Difficulty – Stability – Retrievability) state, replacing SM-2 over time
export const cardDsrStates = pgTable('card_dsr_state', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  cardId: text('card_id').notNull().references(() => cards.id, { onDelete: 'cascade' }),
  difficulty: doublePrecision('difficulty').notNull().default(5.0),
  stability: doublePrecision('stability').notNull().default(0.0),
  reps: integer('reps').notNull().default(0),
  lapses: integer('lapses').notNull().default(0),
  dueDate: text('due_date').notNull(),
  lastReviewedAt: text('last_reviewed_at'),
})

export const reviewLogs = pgTable('review_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  cardId: text('card_id').notNull().references(() => cards.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  repetition: integer('repetition').notNull(),
  interval: integer('interval').notNull(),
  easeFactor: doublePrecision('ease_factor').notNull(),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const translationPrompts = pgTable('translation_prompts', {
  id: text('id').primaryKey(),
  vietnameseText: text('vietnamese_text').notNull(),
  canonicalAnswersJson: text('canonical_answers_json').notNull(),
  grammarCategory: text('grammar_category').notNull(),
  grammarNotes: text('grammar_notes'),
  difficulty: text('difficulty').default('intermediate'),
})

export const translationLogs = pgTable('translation_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  promptId: text('prompt_id').notNull().references(() => translationPrompts.id, { onDelete: 'cascade' }),
  userSubmission: text('user_submission').notNull(),
  isCorrect: boolean('is_correct').notNull(),
  matchedCanonical: text('matched_canonical'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const userStreaks = pgTable('user_streaks', {
  userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  currentStreak: integer('current_streak').notNull().default(0),
  longestStreak: integer('longest_streak').notNull().default(0),
  lastActivityDate: text('last_activity_date'),
})

export const translationParagraphs = pgTable('translation_paragraphs', {
  id: text('id').primaryKey(),
  themeCategory: text('theme_category').notNull(),
  subTopic: text('sub_topic').notNull(),
  targetBand: text('target_band').notNull().default('B2'),
  vietnameseParagraph: text('vietnamese_paragraph').notNull(),
  targetCollocationsJson: text('target_collocations_json').default('[]'),
  modelTranslation: text('model_translation').notNull(),
  grammarBreakdown: text('grammar_breakdown'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const translationParagraphSubmissions = pgTable('translation_paragraph_submissions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  paragraphId: text('paragraph_id').notNull().references(() => translationParagraphs.id, { onDelete: 'cascade' }),
  userTranslation: text('user_translation').notNull(),
  overallFeedback: text('overall_feedback'),
  estimatedCefr: text('estimated_cefr'),
  grammarErrorsJson: text('grammar_errors_json'),
  betterAlternativesJson: text('better_alternatives_json'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const collocations = pgTable('collocations', {
  id: text('id').primaryKey(),
  headWord: text('head_word').notNull(),
  tailChunk: text('tail_chunk').notNull(),
  fullPhrase: text('full_phrase').notNull(),
  meaningVi: text('meaning_vi').notNull(),
  exampleSentence: text('example_sentence').notNull(),
  cefrLevel: text('cefr_level').default('C1'),
  ieltsTopic: text('ielts_topic').notNull(),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const collocationDsrState = pgTable('collocation_dsr_state', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  collocationId: text('collocation_id').notNull().references(() => collocations.id, { onDelete: 'cascade' }),
  difficulty: doublePrecision('difficulty').notNull().default(5.0),
  stability: doublePrecision('stability').notNull().default(0.0),
  reps: integer('reps').notNull().default(0),
  lapses: integer('lapses').notNull().default(0),
  dueDate: text('due_date').notNull(),
  lastReviewedAt: text('last_reviewed_at'),
})

export const speakingPrompts = pgTable('speaking_prompts', {
  id: text('id').primaryKey(),
  part: integer('part').notNull(),
  topic: text('topic').notNull(),
  questionPrompt: text('question_prompt').notNull(),
  cuePointsJson: text('cue_points_json').default('[]'),
  modelResponse: text('model_response'),
  suggestedVocabularyJson: text('suggested_vocabulary_json').default('[]'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const speakingSubmissions = pgTable('speaking_submissions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  promptId: text('prompt_id').notNull().references(() => speakingPrompts.id, { onDelete: 'cascade' }),
  transcribedText: text('transcribed_text').notNull(),
  estimatedBand: doublePrecision('estimated_band'),
  coherenceFeedback: text('coherence_feedback'),
  lexicalFeedback: text('lexical_feedback'),
  grammarFeedback: text('grammar_feedback'),
  improvedVersion: text('improved_version'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

