import { NextResponse } from 'next/server'
import { db, fallbackToSqlite } from '@/lib/db'
import { translationParagraphs, translationParagraphSubmissions, userStreaks, users } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { evaluateUserParagraph } from '@/services/gemini-translation-evaluator'
import { eq } from 'drizzle-orm'

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
    const { paragraphId, userTranslation } = body

    if (!paragraphId || !userTranslation?.trim()) {
      return NextResponse.json({ error: 'paragraphId and userTranslation are required' }, { status: 400 })
    }

    let activeDb = db
    let foundParagraphs = []

    try {
      foundParagraphs = await activeDb
        .select()
        .from(translationParagraphs)
        .where(eq(translationParagraphs.id, paragraphId))
        .limit(1)
    } catch {
      activeDb = fallbackToSqlite()
      foundParagraphs = await activeDb
        .select()
        .from(translationParagraphs)
        .where(eq(translationParagraphs.id, paragraphId))
        .limit(1)
    }

    const paragraph = foundParagraphs[0]
    if (!paragraph) {
      return NextResponse.json({ error: 'Paragraph prompt not found' }, { status: 404 })
    }

    // Call Gemini AI evaluation engine
    const evaluation = await evaluateUserParagraph(
      paragraph.vietnameseParagraph,
      userTranslation,
      paragraph.modelTranslation
    )

    const nowIso = new Date().toISOString()
    const submissionId = `psub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

    // Save submission log
    try {
      await activeDb.insert(translationParagraphSubmissions).values({
        id: submissionId,
        userId,
        paragraphId,
        userTranslation,
        overallFeedback: evaluation.overallFeedback,
        estimatedCefr: evaluation.estimatedCefr,
        grammarErrorsJson: JSON.stringify(evaluation.grammarErrors),
        betterAlternativesJson: JSON.stringify(evaluation.betterAlternatives),
        createdAt: nowIso,
      })
    } catch (dbErr) {
      console.warn('[Submission Log Warning] Failed to log paragraph submission to Postgres, trying SQLite:', dbErr)
      try {
        const fallbackDb = fallbackToSqlite()
        await fallbackDb.insert(translationParagraphSubmissions).values({
          id: submissionId,
          userId,
          paragraphId,
          userTranslation,
          overallFeedback: evaluation.overallFeedback,
          estimatedCefr: evaluation.estimatedCefr,
          grammarErrorsJson: JSON.stringify(evaluation.grammarErrors),
          betterAlternativesJson: JSON.stringify(evaluation.betterAlternatives),
          createdAt: nowIso,
        })
      } catch {}
    }

    // Update daily streak
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
    } catch (streakErr) {
      console.warn('[Streak Update Warning] Failed to update streak:', streakErr)
    }

    return NextResponse.json({
      success: true,
      evaluation,
      modelParagraph: paragraph.modelTranslation,
    })
  } catch (error) {
    console.error('Submit translation paragraph error:', error)
    return NextResponse.json({ error: 'Failed to evaluate paragraph translation' }, { status: 500 })
  }
}
