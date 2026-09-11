/**
 * SuperMemo SM-2 Spaced Repetition Algorithm Implementation
 * 
 * Quality Rating Mapping from UI:
 * - 1: "Again" -> q = 1
 * - 2: "Hard"  -> q = 3
 * - 3: "Good"  -> q = 4
 * - 4: "Easy"  -> q = 5
 */

export interface SrsInput {
  repetition: number
  interval: number
  easeFactor: number
  rating: number // 1, 2, 3, or 4 from UI
}

export interface SrsOutput {
  repetition: number
  interval: number // in days
  easeFactor: number
  dueDate: Date
}

export function calculateSm2({ repetition, interval, easeFactor, rating }: SrsInput): SrsOutput {
  // Map UI rating 1-4 to SuperMemo quality score q (0-5)
  const qMap: Record<number, number> = {
    1: 1, // Again
    2: 3, // Hard
    3: 4, // Good
    4: 5, // Easy
  }

  const q = qMap[rating] ?? 3

  // Calculate new Ease Factor EF'
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  let newEf = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  if (newEf < 1.3) {
    newEf = 1.3
  }

  let newRepetition = repetition
  let newInterval = interval

  if (q >= 3) {
    // Successful recall
    if (repetition === 0) {
      newInterval = 1
    } else if (repetition === 1) {
      newInterval = 6
    } else {
      newInterval = Math.round(interval * newEf)
    }
    newRepetition = repetition + 1
  } else {
    // Failed recall (Again)
    newRepetition = 0
    newInterval = 1
    newEf = easeFactor // Retain previous EF on failure per SM-2 spec
  }

  // Calculate due date (NOW + newInterval days)
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + newInterval)

  return {
    repetition: newRepetition,
    interval: newInterval,
    easeFactor: Number(newEf.toFixed(2)),
    dueDate,
  }
}
