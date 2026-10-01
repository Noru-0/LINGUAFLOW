import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cards, cardSrsStates, reviewLogs, translationLogs, userStreaks, translationPrompts, decks, translationParagraphs, translationParagraphSubmissions } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { seedDatabase } from '@/lib/db/seed'
import { eq, lte, count, and, desc, inArray } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

function extractDateStr(createdAt: any): string {
  if (!createdAt) return ''
  if (typeof createdAt === 'string') {
    const match = createdAt.match(/^\d{4}-\d{2}-\d{2}/)
    if (match) return match[0]
  }
  try {
    return new Date(createdAt).toISOString().split('T')[0]
  } catch {
    return ''
  }
}

export async function GET() {
  try {
    await seedDatabase()
    const session = await getSession()
    const userId = session?.userId || 'user_demo_alex_lee'
    const nowIso = new Date().toISOString()
    const todayStr = extractDateStr(nowIso)

    // Fetch user deck IDs to filter card count per user
    const userDecks = await db.select({ id: decks.id }).from(decks).where(eq(decks.userId, userId))
    const userDeckIds = userDecks.map((d: any) => d.id)

    const userCards = userDeckIds.length > 0
      ? await db.select({ id: cards.id }).from(cards).where(inArray(cards.deckId, userDeckIds))
      : []
    const userCardIds = userCards.map((c: any) => c.id)
    const totalCardsInDb = userCardIds.length

    // Fetch all analytics datasets in parallel
    const [
      streaks,
      dueCountRes,
      totalDecksRes,
      srsStates,
      sentenceLogs,
      paragraphLogsRes,
      userReviewLogs,
    ] = await Promise.all([
      db.select().from(userStreaks).where(eq(userStreaks.userId, userId)).limit(1),
      userCardIds.length > 0
        ? db
            .select({ val: count() })
            .from(cardSrsStates)
            .where(and(eq(cardSrsStates.userId, userId), inArray(cardSrsStates.cardId, userCardIds), lte(cardSrsStates.dueDate, nowIso)))
        : Promise.resolve([{ val: 0 }]),
      db
        .select({ val: count() })
        .from(decks)
        .where(eq(decks.userId, userId)),
      userCardIds.length > 0
        ? db.select().from(cardSrsStates).where(and(eq(cardSrsStates.userId, userId), inArray(cardSrsStates.cardId, userCardIds)))
        : Promise.resolve([]),
      db
        .select({
          id: translationLogs.id,
          promptId: translationLogs.promptId,
          userSubmission: translationLogs.userSubmission,
          isCorrect: translationLogs.isCorrect,
          matchedCanonical: translationLogs.matchedCanonical,
          createdAt: translationLogs.createdAt,
          vietnameseText: translationPrompts.vietnameseText,
          grammarCategory: translationPrompts.grammarCategory,
          grammarNotes: translationPrompts.grammarNotes,
          difficulty: translationPrompts.difficulty,
        })
        .from(translationLogs)
        .innerJoin(translationPrompts, eq(translationLogs.promptId, translationPrompts.id))
        .where(eq(translationLogs.userId, userId))
        .orderBy(desc(translationLogs.createdAt)),
      db
        .select({
          id: translationParagraphSubmissions.id,
          paragraphId: translationParagraphSubmissions.paragraphId,
          userTranslation: translationParagraphSubmissions.userTranslation,
          overallFeedback: translationParagraphSubmissions.overallFeedback,
          estimatedCefr: translationParagraphSubmissions.estimatedCefr,
          grammarErrorsJson: translationParagraphSubmissions.grammarErrorsJson,
          betterAlternativesJson: translationParagraphSubmissions.betterAlternativesJson,
          createdAt: translationParagraphSubmissions.createdAt,
          themeCategory: translationParagraphs.themeCategory,
          subTopic: translationParagraphs.subTopic,
          targetBand: translationParagraphs.targetBand,
          vietnameseParagraph: translationParagraphs.vietnameseParagraph,
          modelTranslation: translationParagraphs.modelTranslation,
        })
        .from(translationParagraphSubmissions)
        .innerJoin(translationParagraphs, eq(translationParagraphSubmissions.paragraphId, translationParagraphs.id))
        .where(eq(translationParagraphSubmissions.userId, userId))
        .orderBy(desc(translationParagraphSubmissions.createdAt))
        .catch(() => []),
      db.select().from(reviewLogs).where(eq(reviewLogs.userId, userId)),
    ])

    const streakInfo = streaks[0] || { currentStreak: 0, longestStreak: 0 }
    const dueCount = dueCountRes[0]?.val || 0
    const totalDecks = totalDecksRes[0]?.val || 0
    const paragraphLogs = paragraphLogsRes || []

    let masteredCount = 0
    let reviewingCount = 0
    let learningCount = 0

    for (const s of srsStates) {
      if (s.repetition > 0) {
        if (s.interval >= 30) masteredCount++
        else if (s.interval >= 2) reviewingCount++
        else learningCount++
      }
    }

    const newCardsCount = Math.max(0, totalCardsInDb - (masteredCount + reviewingCount + learningCount))
    const userTranslationLogs = sentenceLogs

    const goodReviews = userReviewLogs.filter((r: any) => r.rating >= 3).length
    const goodTranslations = userTranslationLogs.filter((t: any) => t.isCorrect).length
    const totalAttempts = userReviewLogs.length + userTranslationLogs.length + paragraphLogs.length
    const successfulAttempts = goodReviews + goodTranslations + paragraphLogs.length
    const retentionRate = totalAttempts > 0 ? ((successfulAttempts / totalAttempts) * 100).toFixed(1) : '100.0'

    // Aggregating by Sentence Pattern
    const patternMap: Record<string, { count: number; correctCount: number }> = {}
    sentenceLogs.forEach((log: any) => {
      const cat = log.grammarCategory || 'Chưa phân loại'
      if (!patternMap[cat]) patternMap[cat] = { count: 0, correctCount: 0 }
      patternMap[cat].count++
      if (log.isCorrect) patternMap[cat].correctCount++
    })
    const byPattern = Object.entries(patternMap).map(([name, data]) => ({
      name,
      count: data.count,
      correctCount: data.correctCount,
      accuracy: data.count > 0 ? Math.round((data.correctCount / data.count) * 100) : 0,
    }))

    // Aggregating by Paragraph Topic
    const topicMap: Record<string, { count: number }> = {}
    paragraphLogs.forEach((log: any) => {
      const topic = log.themeCategory || 'Chủ đề chung'
      if (!topicMap[topic]) topicMap[topic] = { count: 0 }
      topicMap[topic].count++
    })
    const byTopic = Object.entries(topicMap).map(([name, data]) => ({
      name,
      count: data.count,
    }))

    // Aggregating by Level (A2, B1, B2, C1, C2)
    const levelMap: Record<string, { sentenceCount: number; paragraphCount: number }> = {
      A2: { sentenceCount: 0, paragraphCount: 0 },
      B1: { sentenceCount: 0, paragraphCount: 0 },
      B2: { sentenceCount: 0, paragraphCount: 0 },
      C1: { sentenceCount: 0, paragraphCount: 0 },
      C2: { sentenceCount: 0, paragraphCount: 0 },
    }

    sentenceLogs.forEach((log: any) => {
      const lvl = (log.difficulty || 'B1').toUpperCase()
      const key = levelMap[lvl] ? lvl : 'B1'
      levelMap[key].sentenceCount++
    })

    paragraphLogs.forEach((log: any) => {
      const lvl = (log.targetBand || log.estimatedCefr || 'B2').toUpperCase()
      const key = levelMap[lvl] ? lvl : 'B2'
      levelMap[key].paragraphCount++
    })

    const byLevel = Object.entries(levelMap).map(([level, data]) => ({
      level,
      sentenceCount: data.sentenceCount,
      paragraphCount: data.paragraphCount,
      totalCount: data.sentenceCount + data.paragraphCount,
    }))

    // 7. Extract Dates & Streak
    const reviewDates = userReviewLogs.map((l: any) => extractDateStr(l.createdAt)).filter(Boolean)
    const translationDates = sentenceLogs.map((l: any) => extractDateStr(l.createdAt)).filter(Boolean)
    const paragraphDates = paragraphLogs.map((l: any) => extractDateStr(l.createdAt)).filter(Boolean)

    const todayUniqueCards = new Set(
      userReviewLogs
        .filter((l: any) => extractDateStr(l.createdAt) === todayStr && l.cardId)
        .map((l: any) => l.cardId)
    )
    const reviewedToday = todayUniqueCards.size

    const allActivityDates = Array.from(new Set([
      ...reviewDates,
      ...translationDates,
      ...paragraphDates,
    ])).sort()

    let realCurrentStreak = 0
    let realLongestStreak = 0

    if (allActivityDates.length > 0) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = extractDateStr(yesterday.toISOString())

      const hasToday = allActivityDates.includes(todayStr)
      const hasYesterday = allActivityDates.includes(yesterdayStr)

      if (hasToday || hasYesterday) {
        let checkDate = new Date(hasToday ? todayStr : yesterdayStr)
        while (true) {
          const dateStr = extractDateStr(checkDate.toISOString())
          if (allActivityDates.includes(dateStr)) {
            realCurrentStreak++
            checkDate.setDate(checkDate.getDate() - 1)
          } else {
            break
          }
        }
      }

      let tempStreak = 0
      let prevDate: Date | null = null
      for (const dStr of allActivityDates) {
        const d = new Date(dStr)
        if (!prevDate) {
          tempStreak = 1
        } else {
          const diffDays = Math.round((d.getTime() - prevDate.getTime()) / (1000 * 3600 * 24))
          if (diffDays === 1) {
            tempStreak++
          } else if (diffDays > 1) {
            tempStreak = 1
          }
        }
        if (tempStreak > realLongestStreak) realLongestStreak = tempStreak
        prevDate = d
      }
    }

    // 8. Heatmap Activity
    const uniqueCardsByDate: Record<string, Set<string>> = {}
    const now = new Date()
    for (let i = 0; i < 364; i++) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dateKey = extractDateStr(d.toISOString())
      uniqueCardsByDate[dateKey] = new Set<string>()
    }

    userReviewLogs.forEach((l: any) => {
      const key = extractDateStr(l.createdAt)
      if (key && uniqueCardsByDate[key] && l.cardId) {
        uniqueCardsByDate[key].add(l.cardId)
      }
    })

    sentenceLogs.forEach((l: any) => {
      const key = extractDateStr(l.createdAt)
      if (key && uniqueCardsByDate[key]) {
        uniqueCardsByDate[key].add(`trans_${l.id}`)
      }
    })

    paragraphLogs.forEach((l: any) => {
      const key = extractDateStr(l.createdAt)
      if (key && uniqueCardsByDate[key]) {
        uniqueCardsByDate[key].add(`para_${l.id}`)
      }
    })

    let activityMap = Object.keys(uniqueCardsByDate)
      .sort()
      .map((dateKey) => uniqueCardsByDate[dateKey].size)

    return NextResponse.json({
      streak: {
        current: realCurrentStreak,
        longest: realLongestStreak,
      },
      cardsDue: dueCount,
      reviewedToday,
      totalCards: totalCardsInDb,
      totalDecks,
      retentionRate: `${retentionRate}%`,
      totalSessions: totalAttempts,
      cardHealth: {
        learning: learningCount,
        young: reviewingCount,
        mature: masteredCount,
      },
      memoryStatus: {
        mastered: masteredCount,
        reviewing: reviewingCount,
        learning: learningCount,
        new: newCardsCount,
      },
      recentTranslations: sentenceLogs.slice(0, 10),
      activityMap,
      collocationsMastered: 12,
      speakingPracticedCount: 4,
      translationAnalytics: {
        totals: {
          sentenceCount: sentenceLogs.length,
          paragraphCount: paragraphLogs.length,
          totalPracticed: sentenceLogs.length + paragraphLogs.length,
          sentenceCorrectCount: sentenceLogs.filter((s: any) => s.isCorrect).length,
        },
        byPattern,
        byTopic,
        byLevel,
        sentenceLogs,
        paragraphLogs,
      },
    })
  } catch (error) {
    console.error('Fetch analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}

