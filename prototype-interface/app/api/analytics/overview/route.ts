import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cards, cardSrsStates, reviewLogs, translationLogs, userStreaks, translationPrompts, decks } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { seedDatabase } from '@/lib/db/seed'
import { eq, lte, count, and, desc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await seedDatabase()
    const session = await getSession()
    const userId = session?.userId || 'user_demo_alex_lee'
    const nowIso = new Date().toISOString()

    // 1. Fetch Streak
    const streaks = await db.select().from(userStreaks).where(eq(userStreaks.userId, userId)).limit(1)
    const streakInfo = streaks[0] || { currentStreak: 0, longestStreak: 0 }

    // 2. Fetch Cards Due Today
    const dueCountRes = await db
      .select({ val: count() })
      .from(cardSrsStates)
      .where(and(eq(cardSrsStates.userId, userId), lte(cardSrsStates.dueDate, nowIso)))
    const dueCount = dueCountRes[0]?.val || 0

    // 3. Fetch Total Decks
    const totalDecksRes = await db
      .select({ val: count() })
      .from(decks)
      .where(eq(decks.userId, userId))
    const totalDecks = totalDecksRes[0]?.val || 0

    // 4. Fetch Stability Breakdown & Total Cards
    const srsStates = await db.select().from(cardSrsStates).where(eq(cardSrsStates.userId, userId))
    let learning = 0
    let young = 0
    let mature = 0

    for (const s of srsStates) {
      if (s.interval <= 1) learning++
      else if (s.interval <= 21) young++
      else mature++
    }

    // 5. Fetch Recent Translation Logs
    const recentLogs = await db
      .select({
        id: translationLogs.id,
        userSubmission: translationLogs.userSubmission,
        isCorrect: translationLogs.isCorrect,
        matchedCanonical: translationLogs.matchedCanonical,
        createdAt: translationLogs.createdAt,
        vietnameseText: translationPrompts.vietnameseText,
        grammarCategory: translationPrompts.grammarCategory,
        grammarNotes: translationPrompts.grammarNotes,
      })
      .from(translationLogs)
      .innerJoin(translationPrompts, eq(translationLogs.promptId, translationPrompts.id))
      .where(eq(translationLogs.userId, userId))
      .orderBy(desc(translationLogs.createdAt))
      .limit(10)

    // 6. Real Retention Rate & Activity Sessions
    const userReviewLogs = await db.select().from(reviewLogs).where(eq(reviewLogs.userId, userId))
    const userTranslationLogs = await db.select().from(translationLogs).where(eq(translationLogs.userId, userId))

    const goodReviews = userReviewLogs.filter((r: any) => r.rating >= 3).length
    const goodTranslations = userTranslationLogs.filter((t: any) => t.isCorrect).length
    const totalAttempts = userReviewLogs.length + userTranslationLogs.length
    const successfulAttempts = goodReviews + goodTranslations
    const retentionRate = totalAttempts > 0 ? ((successfulAttempts / totalAttempts) * 100).toFixed(1) : '100.0'

    // 7. Calculate Real Streak from Activity Dates
    const allActivityDates = Array.from(new Set([
      ...userReviewLogs.map((l: any) => l.createdAt.split('T')[0]),
      ...userTranslationLogs.map((l: any) => l.createdAt.split('T')[0]),
    ])).sort()

    let realCurrentStreak = 0
    let realLongestStreak = 0

    if (allActivityDates.length > 0) {
      const todayStr = new Date().toISOString().split('T')[0]
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      const hasToday = allActivityDates.includes(todayStr)
      const hasYesterday = allActivityDates.includes(yesterdayStr)

      if (hasToday || hasYesterday) {
        let checkDate = new Date(hasToday ? todayStr : yesterdayStr)
        while (true) {
          const dateStr = checkDate.toISOString().split('T')[0]
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

    // 8. Heatmap Activity (Past 112 days)
    const dateCounts: Record<string, number> = {}
    const now = new Date()
    for (let i = 0; i < 112; i++) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dateKey = d.toISOString().split('T')[0]
      dateCounts[dateKey] = 0
    }

    userReviewLogs.forEach((l: any) => {
      const key = l.createdAt.split('T')[0]
      if (dateCounts[key] !== undefined) dateCounts[key]++
    })
    userTranslationLogs.forEach((l: any) => {
      const key = l.createdAt.split('T')[0]
      if (dateCounts[key] !== undefined) dateCounts[key]++
    })

    const activityMap = Object.keys(dateCounts)
      .sort()
      .map((date) => dateCounts[date])

    return NextResponse.json({
      streak: {
        current: realCurrentStreak,
        longest: realLongestStreak,
      },
      cardsDue: dueCount,
      totalCards: srsStates.length,
      totalDecks,
      retentionRate: `${retentionRate}%`,
      totalSessions: totalAttempts,
      cardHealth: {
        learning,
        young,
        mature,
      },
      recentTranslations: recentLogs,
      activityMap,
    })
  } catch (error) {
    console.error('Fetch analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
