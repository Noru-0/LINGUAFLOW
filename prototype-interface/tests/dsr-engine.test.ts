import { describe, test, expect } from 'vitest'
import {
  DSREngine,
  evaluateFillInBlank,
  buildHintPattern,
  firstLetterOf,
  TARGET_RETENTION,
} from '../lib/srs/dsr'

describe('DSR Engine Math Consistency', () => {
  test('First review with Good rating should set stability around 3 days', () => {
    const state = DSREngine.initializeCard(3)
    expect(state.difficulty).toBe(4.5)
    expect(state.stability).toBeGreaterThanOrEqual(3.0)
    expect(state.reps).toBe(1)
    expect(state.lapses).toBe(0)
  })

  test('First review with Again should count as a lapse', () => {
    const state = DSREngine.initializeCard(1)
    expect(state.difficulty).toBe(8.0)
    expect(state.stability).toBe(0.4)
    expect(state.reps).toBe(0)
    expect(state.lapses).toBe(1)
  })

  test('Forgotten card (Again) should increase difficulty and collapse stability', () => {
    const initial = DSREngine.initializeCard(3)
    const updated = DSREngine.reviewCard(initial, 1)

    expect(updated.difficulty).toBeGreaterThan(initial.difficulty)
    expect(updated.stability).toBeLessThan(initial.stability)
    expect(updated.reps).toBe(0)
    expect(updated.lapses).toBe(1)
  })

  test('Difficulty stays clamped within 1.0 – 10.0', () => {
    let state = DSREngine.initializeCard(4)
    for (let i = 0; i < 20; i++) {
      state = DSREngine.reviewCard(state, 4)
    }
    expect(state.difficulty).toBeGreaterThanOrEqual(1.0)

    let hard = DSREngine.initializeCard(1)
    for (let i = 0; i < 20; i++) {
      hard = DSREngine.reviewCard(hard, 1)
    }
    expect(hard.difficulty).toBeLessThanOrEqual(10.0)
  })

  test('Stability never drops below the 0.4 day floor', () => {
    let state = DSREngine.initializeCard(3)
    for (let i = 0; i < 10; i++) {
      state = DSREngine.reviewCard(state, 1)
    }
    expect(state.stability).toBeGreaterThanOrEqual(0.4)
  })

  test('Easy rating grows stability faster than Good', () => {
    const base = DSREngine.initializeCard(3)
    const good = DSREngine.reviewCard(base, 3)
    const easy = DSREngine.reviewCard(base, 4)
    expect(easy.stability).toBeGreaterThan(good.stability)
  })

  test('Interval should never be below 1 day', () => {
    expect(DSREngine.calculateInterval(0)).toBe(1)
    expect(DSREngine.calculateInterval(0.1)).toBe(1)
    expect(DSREngine.calculateInterval(-5)).toBe(1)
  })

  test('Retrievability decays over time', () => {
    const fresh = DSREngine.calculateRetrievability(10, 0)
    const stale = DSREngine.calculateRetrievability(10, 20)
    expect(fresh).toBeGreaterThan(stale)
    expect(fresh).toBeCloseTo(1, 5)
  })

  test('Retrievability is 0 for a card with no stability', () => {
    expect(DSREngine.calculateRetrievability(0, 5)).toBe(0)
  })

  test('Due date is always in the future', () => {
    const now = new Date('2026-01-01T00:00:00.000Z')
    const state = DSREngine.initializeCard(3, now)
    expect(state.dueDate.getTime()).toBeGreaterThan(now.getTime())
  })

  test('Target retention constant is 0.9', () => {
    expect(TARGET_RETENTION).toBe(0.9)
  })
})

describe('Fill-in-the-Blank evaluator', () => {
  const base = {
    userInput: 'accomplish',
    targetWord: 'accomplish',
    hintsUsedCount: 0,
    elapsedSeconds: 10,
    gaveUp: false,
  }

  test('Correct with no hints and under 5s is Easy', () => {
    const result = evaluateFillInBlank({ ...base, elapsedSeconds: 3 })
    expect(result).toEqual({ isCorrect: true, rating: 4 })
  })

  test('Correct with no hints and 5s or more is Good', () => {
    const result = evaluateFillInBlank({ ...base, elapsedSeconds: 5 })
    expect(result).toEqual({ isCorrect: true, rating: 3 })
  })

  test('Correct with 1 hint is Good', () => {
    const result = evaluateFillInBlank({ ...base, hintsUsedCount: 1 })
    expect(result).toEqual({ isCorrect: true, rating: 3 })
  })

  test('Correct with 2 hints is Hard', () => {
    const result = evaluateFillInBlank({ ...base, hintsUsedCount: 2 })
    expect(result).toEqual({ isCorrect: true, rating: 2 })
  })

  test('Giving up is Always Again', () => {
    const result = evaluateFillInBlank({ ...base, gaveUp: true })
    expect(result).toEqual({ isCorrect: false, rating: 1 })
  })

  test('A wrong answer is Again even with no hints', () => {
    const result = evaluateFillInBlank({ ...base, userInput: 'acomplish' })
    expect(result).toEqual({ isCorrect: false, rating: 1 })
  })

  test('Matching is case-insensitive and trims whitespace', () => {
    const result = evaluateFillInBlank({ ...base, userInput: '  AcComPlish  ', elapsedSeconds: 2 })
    expect(result).toEqual({ isCorrect: true, rating: 4 })
  })

  test('An empty answer is Again', () => {
    const result = evaluateFillInBlank({ ...base, userInput: '   ' })
    expect(result).toEqual({ isCorrect: false, rating: 1 })
  })
})

describe('Hint helpers', () => {
  test('buildHintPattern masks the middle letters', () => {
    expect(buildHintPattern('accomplish')).toBe('a _ _ _ _ _ _ _ _ h')
  })

  test('buildHintPattern leaves very short words intact', () => {
    expect(buildHintPattern('an')).toBe('an')
    expect(buildHintPattern('a')).toBe('a')
  })

  test('firstLetterOf returns the leading character', () => {
    expect(firstLetterOf('accomplish')).toBe('a')
    expect(firstLetterOf('  resilience')).toBe('r')
  })
})
