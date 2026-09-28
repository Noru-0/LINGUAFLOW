/**
 * DSR (Difficulty – Stability – Retrievability) Spaced Repetition Engine
 *
 * An upgrade path from SuperMemo SM-2 (see `lib/srs/sm2.ts`).
 *
 * Rating mapping from the UI:
 * - 1: "Again" -> forgot the word
 * - 2: "Hard"  -> recalled but with serious effort
 * - 3: "Good"  -> recalled after natural deliberation
 * - 4: "Easy"  -> instant, effortless recall
 */

export type DSRRating = 1 | 2 | 3 | 4

export interface DSRState {
  /** D: item difficulty, 1.0 (easiest) – 10.0 (hardest) */
  difficulty: number
  /** S: memory stability in days */
  stability: number
  /** Number of successful reviews */
  reps: number
  /** Number of times the card was forgotten */
  lapses: number
  /** Timestamp of the previous review */
  lastReviewed: Date | null
  /** When the card becomes due again */
  dueDate: Date
}

/** Target probability of recall at review time (90%). */
export const TARGET_RETENTION = 0.9

/** Decay constant used by the forgetting curve. */
const DECAY = 9

/** Minimum stability (days) a lapsed card can fall back to. */
const MIN_STABILITY = 0.4

export class DSREngine {
  /**
   * Probability that the card is still remembered after `elapsedDays`:
   * `R = e^(-ln(10) * Δt / (S * 9))`
   */
  static calculateRetrievability(stability: number, elapsedDays: number): number {
    if (stability <= 0) return 0
    if (elapsedDays <= 0) return 1
    return Math.exp((-Math.LN10 * elapsedDays) / (stability * DECAY))
  }

  /**
   * Days until the next review, derived from stability and the target retention.
   * Always at least 1 day.
   */
  static calculateInterval(stability: number, targetRetention = TARGET_RETENTION): number {
    if (stability <= 0) return 1
    const interval = Math.round(stability * (Math.log(targetRetention) / Math.log(0.9)))
    return Math.max(1, interval)
  }

  /**
   * Build the initial state for a card's very first review.
   */
  static initializeCard(rating: DSRRating, now: Date = new Date()): DSRState {
    const initD: Record<DSRRating, number> = { 1: 8.0, 2: 6.0, 3: 4.5, 4: 2.5 }
    const initS: Record<DSRRating, number> = { 1: 0.4, 2: 1.2, 3: 3.2, 4: 7.0 }

    const difficulty = initD[rating]
    const stability = initS[rating]
    const interval = this.calculateInterval(stability)

    const dueDate = new Date(now)
    dueDate.setDate(dueDate.getDate() + interval)

    return {
      difficulty,
      stability,
      reps: rating === 1 ? 0 : 1,
      lapses: rating === 1 ? 1 : 0,
      lastReviewed: now,
      dueDate,
    }
  }

  /**
   * Compute the next state after a review.
   */
  static reviewCard(current: DSRState, rating: DSRRating, now: Date = new Date()): DSRState {
    const last = current.lastReviewed ? new Date(current.lastReviewed) : now
    const elapsedDays = Math.max(0, (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))

    const retrievability = this.calculateRetrievability(current.stability, elapsedDays)

    let newD = current.difficulty
    let newS = current.stability
    let lapses = current.lapses
    let reps = current.reps

    if (rating === 1) {
      // FORGOTTEN (lapse): harder item, stability collapses
      newD = Math.min(10.0, current.difficulty + 1.6)
      newS = Math.max(MIN_STABILITY, current.stability * 0.25)
      reps = 0
      lapses += 1
    } else {
      // RECALLED (pass)
      const dDelta: Record<DSRRating, number> = { 1: 0, 2: 0.6, 3: -0.2, 4: -0.8 }
      newD = Math.max(1.0, Math.min(10.0, current.difficulty + dDelta[rating]))

      // Easier item (low D) reviewed just before forgetting (low R) -> big stability gain
      const difficultyBonus = (11 - newD) / 5
      const retrievalBonus = Math.pow(1 - retrievability, 0.5) * 2
      const multiplier = 1 + difficultyBonus + retrievalBonus

      if (rating === 2) {
        newS = current.stability * 1.2 // Hard: modest growth
      } else if (rating === 4) {
        newS = current.stability * multiplier * 1.35 // Easy: strong growth
      } else {
        newS = current.stability * multiplier // Good
      }
      reps += 1
    }

    const interval = this.calculateInterval(newS)
    const dueDate = new Date(now)
    dueDate.setDate(dueDate.getDate() + interval)

    return {
      difficulty: Number(newD.toFixed(2)),
      stability: Number(newS.toFixed(2)),
      reps,
      lapses,
      lastReviewed: now,
      dueDate,
    }
  }
}

// ---------------------------------------------------------------------------
// Fill-in-the-Blank with progressive hints
// ---------------------------------------------------------------------------

export interface FillBlankEvaluationInput {
  userInput: string
  targetWord: string
  /** 0 = no hints, 1 = first letter, 2 = first letter + IPA */
  hintsUsedCount: number
  elapsedSeconds: number
  gaveUp: boolean
}

export interface FillBlankEvaluationResult {
  isCorrect: boolean
  rating: DSRRating
}

/**
 * Grade a fill-in-the-blank attempt and map it to a DSR rating.
 *
 * | Input            | Hints | Time   | Rating |
 * | ---------------- | ----- | ------ | ------ |
 * | Correct          | 0     | < 5s   | 4 Easy |
 * | Correct          | 0     | >= 5s  | 3 Good |
 * | Correct          | 1     | any    | 3 Good |
 * | Correct          | 2     | any    | 2 Hard |
 * | Wrong / gave up  | any   | any    | 1 Again |
 */
export function evaluateFillInBlank(input: FillBlankEvaluationInput): FillBlankEvaluationResult {
  if (input.gaveUp) {
    return { isCorrect: false, rating: 1 }
  }

  const normalizedUser = input.userInput.trim().toLowerCase()
  const normalizedTarget = input.targetWord.trim().toLowerCase()

  const isMatch =
    normalizedUser === normalizedTarget ||
    (normalizedUser.length > 0 &&
      normalizedUser.replace(/[^a-z0-9]/gi, '') === normalizedTarget.replace(/[^a-z0-9]/gi, ''))

  if (!normalizedUser || !isMatch) {
    return { isCorrect: false, rating: 1 }
  }

  if (input.hintsUsedCount <= 0) {
    return { isCorrect: true, rating: input.elapsedSeconds < 5 ? 4 : 3 }
  }

  if (input.hintsUsedCount === 1) {
    return { isCorrect: true, rating: 3 }
  }

  return { isCorrect: true, rating: 2 }
}

/**
 * Build the masked hint pattern for a word, e.g. "accomplish" -> "a _ _ _ _ _ _ _ _ h".
 */
export function buildHintPattern(word: string): string {
  const letters = word.trim()
  if (letters.length <= 2) return letters
  return `${letters[0]} ${'_ '.repeat(letters.length - 2).trim()} ${letters[letters.length - 1]}`
}

/** First letter of a word, used as the level-1 hint. */
export function firstLetterOf(word: string): string {
  return word.trim().charAt(0)
}
