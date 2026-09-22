import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  users,
  decks,
  cards,
  cardSrsStates,
  cardDsrStates,
  reviewLogs,
  userStreaks,
  speakingSubmissions,
  translationParagraphSubmissions,
  speakingPrompts,
  translationParagraphs,
  translationLogs,
  translationPrompts,
} from '@/lib/db/schema'
import { eq, desc, count } from 'drizzle-orm'
import { verifyAdminSession, unauthorizedAdminResponse } from '@/lib/auth/admin'

export const dynamic = 'force-dynamic'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { isAdmin } = await verifyAdminSession()
  if (!isAdmin) {
    return unauthorizedAdminResponse()
  }

  try {
    const { id: userId } = await params

    // 1. Fetch User Profile
    const foundUsers = await db.select().from(users).where(eq(users.id, userId)).limit(1)
    const user = foundUsers[0]

    if (!user) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy người dùng!' }, { status: 404 })
    }

    // 2. Fetch User Streak
    const streakRow = await db.select().from(userStreaks).where(eq(userStreaks.userId, userId)).limit(1).catch(() => [])
    const streak = streakRow[0] || { currentStreak: 0, longestStreak: 0, lastActivityDate: null }

    // 3. Fetch User Decks & Cards
    const userDecks = await db.select().from(decks).where(eq(decks.userId, userId)).orderBy(desc(decks.createdAt)).catch(() => [])

    // 4. Fetch SRS States & Calculate 4 Memory Stages
    const srsStates = await db.select().from(cardSrsStates).where(eq(cardSrsStates.userId, userId)).catch(() => [])

    const totalCards = srsStates.length
    const memoryStages = {
      new: { count: 0, percentage: 0 },
      learning: { count: 0, percentage: 0 },
      consolidating: { count: 0, percentage: 0 },
      mastered: { count: 0, percentage: 0 },
    }

    srsStates.forEach((state: any) => {
      const rep = state.repetition || 0
      const interval = state.interval || 0

      if (rep === 0) {
        memoryStages.new.count++
      } else if (interval < 2) {
        memoryStages.learning.count++
      } else if (interval >= 2 && interval < 30) {
        memoryStages.consolidating.count++
      } else {
        memoryStages.mastered.count++
      }
    })

    if (totalCards > 0) {
      memoryStages.new.percentage = Math.round((memoryStages.new.count / totalCards) * 100)
      memoryStages.learning.percentage = Math.round((memoryStages.learning.count / totalCards) * 100)
      memoryStages.consolidating.percentage = Math.round((memoryStages.consolidating.count / totalCards) * 100)
      memoryStages.mastered.percentage = Math.round((memoryStages.mastered.count / totalCards) * 100)
    }

    // 5. Fetch Review Logs & Single Sentence Translation Logs for Accuracy Rate
    const cardReviews = await db.select().from(reviewLogs).where(eq(reviewLogs.userId, userId)).orderBy(desc(reviewLogs.createdAt)).catch(() => [])
    const sentenceLogs = await db
      .select({
        id: translationLogs.id,
        userSubmission: translationLogs.userSubmission,
        isCorrect: translationLogs.isCorrect,
        matchedCanonical: translationLogs.matchedCanonical,
        createdAt: translationLogs.createdAt,
        vietnameseText: translationPrompts.vietnameseText,
        grammarCategory: translationPrompts.grammarCategory,
      })
      .from(translationLogs)
      .leftJoin(translationPrompts, eq(translationLogs.promptId, translationPrompts.id))
      .where(eq(translationLogs.userId, userId))
      .orderBy(desc(translationLogs.createdAt))
      .catch(() => [])

    const totalCardReviews = cardReviews.length
    const correctCardReviews = cardReviews.filter((l: any) => l.rating >= 3).length

    const totalSentenceLogs = sentenceLogs.length
    const correctSentenceLogs = sentenceLogs.filter((s: any) => s.isCorrect).length

    const totalCompletedTurns = totalCardReviews + totalSentenceLogs
    const totalCorrectTurns = correctCardReviews + correctSentenceLogs

    const accuracyRate = totalCompletedTurns > 0 ? parseFloat(((totalCorrectTurns / totalCompletedTurns) * 100).toFixed(1)) : 0.0

    // 6. Fetch Speaking Submissions
    const speakingSubs = await db
      .select({
        id: speakingSubmissions.id,
        promptId: speakingSubmissions.promptId,
        transcribedText: speakingSubmissions.transcribedText,
        estimatedBand: speakingSubmissions.estimatedBand,
        coherenceFeedback: speakingSubmissions.coherenceFeedback,
        lexicalFeedback: speakingSubmissions.lexicalFeedback,
        grammarFeedback: speakingSubmissions.grammarFeedback,
        improvedVersion: speakingSubmissions.improvedVersion,
        createdAt: speakingSubmissions.createdAt,
        questionPrompt: speakingPrompts.questionPrompt,
        topic: speakingPrompts.topic,
        part: speakingPrompts.part,
      })
      .from(speakingSubmissions)
      .leftJoin(speakingPrompts, eq(speakingSubmissions.promptId, speakingPrompts.id))
      .where(eq(speakingSubmissions.userId, userId))
      .orderBy(desc(speakingSubmissions.createdAt))
      .catch(() => [])

    // 7. Fetch Paragraph Submissions
    const paragraphSubs = await db
      .select({
        id: translationParagraphSubmissions.id,
        userTranslation: translationParagraphSubmissions.userTranslation,
        overallFeedback: translationParagraphSubmissions.overallFeedback,
        estimatedCefr: translationParagraphSubmissions.estimatedCefr,
        createdAt: translationParagraphSubmissions.createdAt,
        subTopic: translationParagraphs.subTopic,
        vietnameseParagraph: translationParagraphs.vietnameseParagraph,
      })
      .from(translationParagraphSubmissions)
      .leftJoin(translationParagraphs, eq(translationParagraphSubmissions.paragraphId, translationParagraphs.id))
      .where(eq(translationParagraphSubmissions.userId, userId))
      .orderBy(desc(translationParagraphSubmissions.createdAt))
      .catch(() => [])

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || (user.email === 'admin@linguaflow.com' ? 'admin' : 'user'),
        createdAt: user.createdAt,
      },
      streak,
      overview: {
        totalDecks: userDecks.length,
        totalSrsCardsTracked: totalCards,
        accuracyRate,
        totalCompletedTurns,
        singleSentence: {
          total: totalSentenceLogs,
          correct: correctSentenceLogs,
        },
        paragraph: {
          total: paragraphSubs.length,
        },
        speaking: {
          total: speakingSubs.length,
        },
        memoryStages,
      },
      decks: userDecks,
      speakingSubmissions: speakingSubs,
      paragraphSubmissions: paragraphSubs,
      sentenceLogs,
      recentReviewLogs: cardReviews.slice(0, 15),
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
