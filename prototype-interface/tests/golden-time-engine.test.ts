import { describe, test, expect } from 'vitest'
import { GoldenTimeEngine } from '../lib/golden-time-engine'

describe('GoldenTimeEngine - Memory Levels & Formulas', () => {
  test('calculateMemoryLevel maps stability to 5 levels correctly', () => {
    expect(GoldenTimeEngine.calculateMemoryLevel(0.5)).toBe(1)
    expect(GoldenTimeEngine.calculateMemoryLevel(1.9)).toBe(1)
    expect(GoldenTimeEngine.calculateMemoryLevel(2.0)).toBe(2)
    expect(GoldenTimeEngine.calculateMemoryLevel(4.9)).toBe(2)
    expect(GoldenTimeEngine.calculateMemoryLevel(5.0)).toBe(3)
    expect(GoldenTimeEngine.calculateMemoryLevel(13.9)).toBe(3)
    expect(GoldenTimeEngine.calculateMemoryLevel(14.0)).toBe(4)
    expect(GoldenTimeEngine.calculateMemoryLevel(44.9)).toBe(4)
    expect(GoldenTimeEngine.calculateMemoryLevel(45.0)).toBe(5)
    expect(GoldenTimeEngine.calculateMemoryLevel(100.0)).toBe(5)
  })

  test('calculateRetrievability gives exactly 0.9 when elapsedDays equals stability', () => {
    const rAtStability = GoldenTimeEngine.calculateRetrievability(10, 10)
    expect(rAtStability).toBeCloseTo(0.9, 5)

    const rFresh = GoldenTimeEngine.calculateRetrievability(10, 0)
    expect(rFresh).toBe(1.0)

    const rZeroS = GoldenTimeEngine.calculateRetrievability(0, 5)
    expect(rZeroS).toBe(0)
  })

  test('getNextGoldenInterval equals stability when target retention is 0.9', () => {
    const interval = GoldenTimeEngine.getNextGoldenInterval(10)
    expect(interval).toBeCloseTo(10, 5)
  })
})

describe('GoldenTimeEngine - State Transitions & Review Processing', () => {
  test('initNewWord initializes state correctly for Good rating', () => {
    const now = new Date('2026-09-28T10:00:00.000Z')
    const state = GoldenTimeEngine.initNewWord(3, now)

    expect(state.difficulty).toBe(4.5)
    expect(state.stability).toBe(2.5)
    expect(state.memoryLevel).toBe(2)
    expect(state.reps).toBe(1)
    expect(state.lapses).toBe(0)
    expect(state.goldenTime.getTime()).toBeGreaterThan(now.getTime())
  })

  test('initNewWord for Again rating marks lapse and low stability', () => {
    const now = new Date('2026-09-28T10:00:00.000Z')
    const state = GoldenTimeEngine.initNewWord(1, now)

    expect(state.difficulty).toBe(8.0)
    expect(state.stability).toBe(0.3)
    expect(state.memoryLevel).toBe(1)
    expect(state.reps).toBe(0)
    expect(state.lapses).toBe(1)
  })

  test('processReview with Again increases difficulty and collapses stability to ~0.3x', () => {
    const now = new Date('2026-09-28T10:00:00.000Z')
    const initial = GoldenTimeEngine.initNewWord(3, now)
    
    const reviewTime = new Date(now.getTime() + 2.5 * 24 * 60 * 60 * 1000)
    const updated = GoldenTimeEngine.processReview(initial, 1, reviewTime)

    expect(updated.difficulty).toBe(6.0) // 4.5 + 1.5
    expect(updated.stability).toBe(0.75) // 2.5 * 0.3
    expect(updated.memoryLevel).toBe(1)
    expect(updated.reps).toBe(0)
    expect(updated.lapses).toBe(1)
  })

  test('processReview with Good rating caps stability growth at MAX_STABILITY_MULTIPLIER (2.5x)', () => {
    const now = new Date('2026-09-28T10:00:00.000Z')
    const initial = GoldenTimeEngine.initNewWord(4, now) // D = 2.5, S = 5.0

    const reviewTime = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000)
    const updated = GoldenTimeEngine.processReview(initial, 3, reviewTime)

    expect(updated.stability).toBeLessThanOrEqual(5.0 * 2.5)
    expect(updated.reps).toBe(2)
    expect(updated.memoryLevel).toBeGreaterThanOrEqual(3)
  })

  test('Easy rating grows stability faster than Good rating, but remains capped', () => {
    const now = new Date('2026-09-28T10:00:00.000Z')
    const initial = GoldenTimeEngine.initNewWord(3, now)

    const reviewTime = new Date(now.getTime() + 2.5 * 24 * 60 * 60 * 1000)
    const goodReview = GoldenTimeEngine.processReview(initial, 3, reviewTime)
    const easyReview = GoldenTimeEngine.processReview(initial, 4, reviewTime)

    expect(easyReview.stability).toBeGreaterThanOrEqual(goodReview.stability)
    expect(easyReview.stability).toBeLessThanOrEqual(initial.stability * 2.5)
  })
})
