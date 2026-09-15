import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { translationPrompts, translationLogs, userStreaks } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { evaluateSingleSentenceWithDeepSeek } from '@/services/gemini-translation-evaluator'
import { eq } from 'drizzle-orm'
import { safeJsonParse } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    const userId = session?.userId || 'user_demo_alex_lee'

    const body = await request.json()
    const { promptId, userSubmission } = body

    if (!promptId || userSubmission === undefined) {
      return NextResponse.json({ error: 'promptId and userSubmission are required' }, { status: 400 })
    }

    const foundPrompts = await db
      .select()
      .from(translationPrompts)
      .where(eq(translationPrompts.id, promptId))
      .limit(1)

    const prompt = foundPrompts[0]
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
    await db.insert(translationLogs).values({
      id: `tlog_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      promptId,
      userSubmission,
      isCorrect: evaluation.isCorrect,
      matchedCanonical: evaluation.suggestedAnswer || canonicalAnswers[0],
      createdAt: nowIso,
    })

    // Update streak
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
      evaluation: {
        isCorrect: evaluation.isCorrect,
        score: evaluation.score,
        overallAnalysis: evaluation.overallAnalysis,
        suggestedAnswer: evaluation.suggestedAnswer,
        detailedFeedback: evaluation.detailedFeedback,
        grammarNotes: evaluation.grammarNotes,
        improvementSuggestions: evaluation.improvementSuggestions,
        grammarCategory: prompt.grammarCategory,
        diff: evaluation.diff,
      },
    })
  } catch (error) {
    console.error('Translation submission error:', error)
    return NextResponse.json({ error: 'Failed to evaluate translation' }, { status: 500 })
  }
}
