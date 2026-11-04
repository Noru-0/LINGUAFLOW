import { NextResponse } from 'next/server'
import { db, fallbackToSqlite } from '@/lib/db'
import { translationPrompts, translationLogs, userStreaks, users } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { evaluateSingleSentenceWithDeepSeek } from '@/services/gemini-translation-evaluator'
import { eq } from 'drizzle-orm'
import { safeJsonParse } from '@/lib/utils'

export const dynamic = 'force-dynamic'

async function ensureUserExists(userId: string, email?: string, name?: string) {
  try {
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1)
    if (existing.length === 0) {
      await db.insert(users).values({
        id: userId,
        email: email || `${userId}@user.local`,
        passwordHash: 'auth_user_session',
        name: name || 'Learner',
        role: 'user',
        createdAt: new Date().toISOString(),
      }).catch(() => {})
    }
  } catch {}
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    const userId = session?.userId || 'user_demo_alex_lee'
    await ensureUserExists(userId, session?.email, session?.name)

    const body = await request.json()
    const { promptId, userSubmission } = body

    if (!promptId || userSubmission === undefined) {
      return NextResponse.json({ error: 'promptId and userSubmission are required' }, { status: 400 })
    }

    let activeDb = db
    let prompt: any = null

    try {
      const foundPrompts = await activeDb
        .select()
        .from(translationPrompts)
        .where(eq(translationPrompts.id, promptId))
        .limit(1)
      prompt = foundPrompts[0]
    } catch {
      activeDb = fallbackToSqlite()
      const foundPrompts = await activeDb
        .select()
        .from(translationPrompts)
        .where(eq(translationPrompts.id, promptId))
        .limit(1)
      prompt = foundPrompts[0]
    }

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
    }

    const canonicalAnswers: string[] = safeJsonParse(prompt.canonicalAnswersJson, [])

    // Run DeepSeek evaluation engine for single sentences
    const evaluation = await evaluateSingleSentenceWithDeepSeek(
      prompt.vietnameseText,
      userSubmission,
      canonicalAnswers,
      prompt.grammarCategory || '',
      prompt.grammarNotes || ''
    )

    const nowIso = new Date().toISOString()

    // Record submission log
    try {
      await activeDb.insert(translationLogs).values({
        id: `tlog_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId,
        promptId,
        userSubmission,
        isCorrect: evaluation.isCorrect,
        matchedCanonical: evaluation.suggestedAnswer || canonicalAnswers[0],
        createdAt: nowIso,
      })
    } catch (insertErr) {
      console.warn('Postgres insert translationLogs failed, trying fallback SQLite:', insertErr)
      try {
        const fallbackDb = fallbackToSqlite()
        await fallbackDb.insert(translationLogs).values({
          id: `tlog_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          userId,
          promptId,
          userSubmission,
          isCorrect: evaluation.isCorrect,
          matchedCanonical: evaluation.suggestedAnswer || canonicalAnswers[0],
          createdAt: nowIso,
        })
      } catch {}
    }

    // Update streak
    try {
      const todayDate = nowIso.split('T')[0]
      const userStreakRecord = await activeDb
        .select()
        .from(userStreaks)
        .where(eq(userStreaks.userId, userId))
        .limit(1)

      if (userStreakRecord.length > 0) {
        const streak = userStreakRecord[0]
        if (streak.lastActivityDate !== todayDate) {
          const newStreak = (streak.currentStreak || 0) + 1
          const newLongest = Math.max(newStreak, streak.longestStreak || 0)
          await activeDb
            .update(userStreaks)
            .set({
              currentStreak: newStreak,
              longestStreak: newLongest,
              lastActivityDate: todayDate,
            })
            .where(eq(userStreaks.userId, userId))
        }
      } else {
        await activeDb.insert(userStreaks).values({
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastActivityDate: todayDate,
        })
      }
    } catch {}

    return NextResponse.json({
      success: true,
      evaluation,
      promptId,
    })
  } catch (error) {
    console.error('Translation submission error:', error)
    return NextResponse.json({ error: 'Failed to evaluate sentence' }, { status: 500 })
  }
}
