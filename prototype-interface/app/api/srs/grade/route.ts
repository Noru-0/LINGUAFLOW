import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cardSrsStates, cardDsrStates, cardMemoryState, cardReviewHistory, reviewLogs, userStreaks } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { calculateSm2 } from '@/lib/srs/sm2'
import { DSREngine, DSRRating } from '@/lib/srs/dsr'
import { GoldenTimeEngine } from '@/lib/golden-time-engine'
import { eq, and } from 'drizzle-orm'


export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    const userId = session?.userId || 'user_demo_alex_lee'

    const body = await request.json()
    const { cardId, rating } = body // rating: 1, 2, 3, 4

    if (!cardId || !rating || rating < 1 || rating > 4) {
      return NextResponse.json({ error: 'Valid cardId and rating (1-4) required' }, { status: 400 })
    }

    // Fetch current SRS state for card
    const existingState = await db
      .select()
      .from(cardSrsStates)
      .where(and(eq(cardSrsStates.userId, userId), eq(cardSrsStates.cardId, cardId)))
      .limit(1)

    const currentState = existingState[0] || {
      repetition: 0,
      interval: 0,
      easeFactor: 2.5,
    }

    // Compute SuperMemo SM-2 calculation
    const sm2Output = calculateSm2({
      repetition: currentState.repetition,
      interval: currentState.interval,
      easeFactor: currentState.easeFactor,
      rating,
    })

    const nowIso = new Date().toISOString()
    const stateId = existingState[0]?.id || `srs_${cardId}_${userId}`

    // Upsert new card SRS state
    if (existingState.length > 0) {
      await db
        .update(cardSrsStates)
        .set({
          repetition: sm2Output.repetition,
          interval: sm2Output.interval,
          easeFactor: sm2Output.easeFactor,
          dueDate: sm2Output.dueDate.toISOString(),
          lastReviewedAt: nowIso,
        })
        .where(eq(cardSrsStates.id, stateId))
    } else {
      await db.insert(cardSrsStates).values({
        id: stateId,
        userId,
        cardId,
        repetition: sm2Output.repetition,
        interval: sm2Output.interval,
        easeFactor: sm2Output.easeFactor,
        dueDate: sm2Output.dueDate.toISOString(),
        lastReviewedAt: nowIso,
      })
    }

    // -----------------------------------------------------------------------
    // DSR runs in parallel with SM-2 during the migration window.
    // Failures here must never break grading, so they are caught separately.
    // -----------------------------------------------------------------------
    let dsrResult: { difficulty: number; stability: number; intervalDays: number; dueDate: string } | null = null
    try {
      const existingDsr = await db
        .select()
        .from(cardDsrStates)
        .where(and(eq(cardDsrStates.userId, userId), eq(cardDsrStates.cardId, cardId)))
        .limit(1)

      const dsrRating = rating as DSRRating
      const currentDsr = existingDsr[0]

      const nextDsr =
        !currentDsr || !currentDsr.lastReviewedAt
          ? DSREngine.initializeCard(dsrRating)
          : DSREngine.reviewCard(
              {
                difficulty: currentDsr.difficulty,
                stability: currentDsr.stability,
                reps: currentDsr.reps,
                lapses: currentDsr.lapses,
                lastReviewed: currentDsr.lastReviewedAt ? new Date(currentDsr.lastReviewedAt) : null,
                dueDate: new Date(currentDsr.dueDate),
              },
              dsrRating
            )

      const dsrPayload = {
        userId,
        cardId,
        difficulty: nextDsr.difficulty,
        stability: nextDsr.stability,
        reps: nextDsr.reps,
        lapses: nextDsr.lapses,
        dueDate: nextDsr.dueDate.toISOString(),
        lastReviewedAt: nowIso,
      }

      if (currentDsr) {
        await db.update(cardDsrStates).set(dsrPayload).where(eq(cardDsrStates.id, currentDsr.id))
      } else {
        await db.insert(cardDsrStates).values({ id: `dsr_${cardId}_${userId}`, ...dsrPayload })
      }

      dsrResult = {
        difficulty: nextDsr.difficulty,
        stability: nextDsr.stability,
        intervalDays: DSREngine.calculateInterval(nextDsr.stability),
        dueDate: nextDsr.dueDate.toISOString(),
      }

      // -----------------------------------------------------------------------
      // Golden Time Engine (Memory Levels & Dual-Layer Architecture)
      // -----------------------------------------------------------------------
      try {
        const existingMem = await db
          .select()
          .from(cardMemoryState)
          .where(and(eq(cardMemoryState.userId, userId), eq(cardMemoryState.cardId, cardId)))
          .limit(1)

        const currentMem = existingMem[0]
        const nowObj = new Date()

        let nextMemState
        let elapsedDays = 0
        let currentR = 1.0

        if (!currentMem || !currentMem.lastReviewed) {
          nextMemState = GoldenTimeEngine.initNewWord(dsrRating, nowObj)
        } else {
          const oldLast = new Date(currentMem.lastReviewed)
          elapsedDays = Math.max(0, (nowObj.getTime() - oldLast.getTime()) / (1000 * 60 * 60 * 24))
          currentR = GoldenTimeEngine.calculateRetrievability(currentMem.stability, elapsedDays)
          
          nextMemState = GoldenTimeEngine.processReview(
            {
              memoryLevel: currentMem.memoryLevel,
              difficulty: currentMem.difficulty,
              stability: currentMem.stability,
              reps: currentMem.reps,
              lapses: currentMem.lapses,
              lastReviewed: oldLast,
              goldenTime: new Date(currentMem.goldenTime),
            },
            dsrRating,
            nowObj
          )
        }

        const memPayload = {
          userId,
          cardId,
          memoryLevel: nextMemState.memoryLevel,
          difficulty: nextMemState.difficulty,
          stability: nextMemState.stability,
          reps: nextMemState.reps,
          lapses: nextMemState.lapses,
          lastReviewed: nowIso,
          goldenTime: nextMemState.goldenTime.toISOString(),
        }

        if (currentMem) {
          await db.update(cardMemoryState).set(memPayload).where(eq(cardMemoryState.cardId, cardId))
        } else {
          await db.insert(cardMemoryState).values(memPayload)
        }

        // Save detailed review log into card_review_history for future calibration
        await db.insert(cardReviewHistory).values({
          id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          cardId,
          userId,
          rating: dsrRating,
          reviewedAt: nowIso,
          elapsedDays: Number(elapsedDays.toFixed(2)),
          retrievability: Number(currentR.toFixed(4)),
          oldDifficulty: currentMem ? currentMem.difficulty : 5.0,
          newDifficulty: nextMemState.difficulty,
          oldStability: currentMem ? currentMem.stability : 0.5,
          newStability: nextMemState.stability,
          createdAt: nowIso,
        })
      } catch (memError) {
        console.error('Golden Time Engine update error:', memError)
      }

      // Log the SM-2 vs DSR interval comparison for later analysis
      console.log(
        `[DSR] card=${cardId} rating=${rating} sm2Interval=${sm2Output.interval}d dsrInterval=${dsrResult.intervalDays}d`
      )
    } catch (dsrError) {
      console.error('DSR update failed (SM-2 result was still saved):', dsrError)
    }

    // Log review execution
    await db.insert(reviewLogs).values({
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      cardId,
      rating,
      repetition: sm2Output.repetition,
      interval: sm2Output.interval,
      easeFactor: sm2Output.easeFactor,
      createdAt: nowIso,
    })

    // Update daily study streak
    const todayDate = nowIso.split('T')[0]
    const userStreakRecord = await db
      .select()
      .from(userStreaks)
      .where(eq(userStreaks.userId, userId))
      .limit(1)

    if (userStreakRecord.length > 0) {
      const streak = userStreakRecord[0]
      if (streak.lastActivityDate !== todayDate) {
        const newStreak = (streak.currentStreak || 0) + 1
        const newLongest = Math.max(newStreak, streak.longestStreak || 0)
        await db
          .update(userStreaks)
          .set({
            currentStreak: newStreak,
            longestStreak: newLongest,
            lastActivityDate: todayDate,
          })
          .where(eq(userStreaks.userId, userId))
      }
    } else {
      await db.insert(userStreaks).values({
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: todayDate,
      })
    }

    return NextResponse.json({
      success: true,
      newState: {
        repetition: sm2Output.repetition,
        interval: sm2Output.interval,
        easeFactor: sm2Output.easeFactor,
        dueDate: sm2Output.dueDate.toISOString(),
      },
      dsr: dsrResult,
    })
  } catch (error) {
    console.error('Grade SRS card error:', error)
    return NextResponse.json({ error: 'Failed to record card rating' }, { status: 500 })
  }
}
