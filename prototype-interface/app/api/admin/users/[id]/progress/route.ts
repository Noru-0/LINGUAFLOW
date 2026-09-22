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

    // 4. Fetch SRS & DSR States
    const srsStates = await db.select().from(cardSrsStates).where(eq(cardSrsStates.userId, userId)).catch(() => [])
    const dsrStates = await db.select().from(cardDsrStates).where(eq(cardDsrStates.userId, userId)).catch(() => [])

    const todayIso = new Date().toISOString().split('T')[0]
    const dueSrsCount = srsStates.filter((s: any) => s.dueDate <= todayIso).length

    // 5. Fetch Review Logs (SM2/DSR rating distribution)
    const logs = await db.select().from(reviewLogs).where(eq(reviewLogs.userId, userId)).orderBy(desc(reviewLogs.createdAt)).limit(100).catch(() => [])

    const ratingCounts = {
      again: logs.filter((l: any) => l.rating === 1).length,
      hard: logs.filter((l: any) => l.rating === 2).length,
      good: logs.filter((l: any) => l.rating === 3).length,
      easy: logs.filter((l: any) => l.rating === 4).length,
    }

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
      .limit(10)
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
      .limit(10)
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
        totalSrsCardsTracked: srsStates.length,
        totalCardsDueToday: dueSrsCount,
        totalReviewsCount: logs.length,
        ratingCounts,
        totalSpeakingSubmissions: speakingSubs.length,
        totalParagraphSubmissions: paragraphSubs.length,
      },
      decks: userDecks,
      speakingSubmissions: speakingSubs,
      paragraphSubmissions: paragraphSubs,
      recentReviewLogs: logs.slice(0, 15),
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
