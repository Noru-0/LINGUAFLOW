import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cardSrsStates, reviewLogs, userStreaks } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { calculateSm2 } from '@/lib/srs/sm2'
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
    }

    return NextResponse.json({
      success: true,
      newState: {
        repetition: sm2Output.repetition,
        interval: sm2Output.interval,
        easeFactor: sm2Output.easeFactor,
        dueDate: sm2Output.dueDate.toISOString(),
      },
    })
  } catch (error) {
    console.error('Grade SRS card error:', error)
    return NextResponse.json({ error: 'Failed to record card rating' }, { status: 500 })
  }
}
