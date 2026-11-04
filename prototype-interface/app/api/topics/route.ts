import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { topics, cardTopics, cards, decks, cardSrsStates } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { seedDatabase } from '@/lib/db/seed'
import { eq, inArray, isNull } from 'drizzle-orm'
import { INITIAL_TOPICS } from '@/lib/db/initial_topics'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    await seedDatabase()
    const session = await getSession()
    const userId = session?.userId || 'user_demo_alex_lee'

    // 1. Fetch all topics from DB (or fallback to INITIAL_TOPICS)
    let allDbTopics: any[] = []
    try {
      allDbTopics = await db.select().from(topics)
    } catch {}

    // If database table is empty, seed topics on the fly
    if (allDbTopics.length === 0) {
      try {
        let order = 0
        for (const major of INITIAL_TOPICS) {
          order++
          await db.insert(topics).values({
            id: major.id,
            parentId: null,
            nameEn: major.nameEn,
            nameVi: major.nameVi,
            description: major.description,
            icon: major.icon,
            color: major.color,
            orderIndex: order,
          }).catch(() => {})

          for (const sub of major.subtopics) {
            order++
            await db.insert(topics).values({
              id: sub.id,
              parentId: sub.parentId,
              nameEn: sub.nameEn,
              nameVi: sub.nameVi,
              description: sub.description,
              icon: sub.icon || 'Folder',
              color: major.color,
              orderIndex: order,
            }).catch(() => {})
          }
        }
        allDbTopics = await db.select().from(topics)
      } catch {}
    }

    // 2. Fetch user's decks and card IDs to calculate personal stats
    const userDecks = await db.select({ id: decks.id }).from(decks).where(eq(decks.userId, userId))
    const userDeckIds = userDecks.map((d: any) => d.id)

    // Maps to aggregate card counts
    const topicCardCountMap: Record<string, number> = {}
    const topicMatureCountMap: Record<string, number> = {}
    const topicDueCountMap: Record<string, number> = {}
    let totalUnclassifiedCount = 0

    if (userDeckIds.length > 0) {
      const userCards = await db
        .select({ id: cards.id })
        .from(cards)
        .where(inArray(cards.deckId, userDeckIds))
      const userCardIds = userCards.map((c: any) => c.id)

      if (userCardIds.length > 0) {
        // Query card_topics for these cards
        const userCardTopics = await db
          .select({
            cardId: cardTopics.cardId,
            topicId: cardTopics.topicId,
          })
          .from(cardTopics)
          .where(inArray(cardTopics.cardId, userCardIds))

        const classifiedCardIds = new Set<string>()
        userCardTopics.forEach((ct: any) => {
          classifiedCardIds.add(ct.cardId)
          topicCardCountMap[ct.topicId] = (topicCardCountMap[ct.topicId] || 0) + 1
        })

        totalUnclassifiedCount = userCardIds.filter((id: string) => !classifiedCardIds.has(id)).length

        // Query SRS states to compute mature and due counts
        try {
          const srsList = await db
            .select({
              cardId: cardSrsStates.cardId,
              interval: cardSrsStates.interval,
              dueDate: cardSrsStates.dueDate,
            })
            .from(cardSrsStates)
            .where(eq(cardSrsStates.userId, userId))

          const srsMap: Record<string, { interval: number; dueDate: string }> = {}
          srsList.forEach((s: any) => {
            srsMap[s.cardId] = { interval: s.interval, dueDate: s.dueDate }
          })

          const todayIso = new Date().toISOString().split('T')[0]

          userCardTopics.forEach((ct: any) => {
            const srs = srsMap[ct.cardId]
            if (srs) {
              if (srs.interval >= 21) {
                topicMatureCountMap[ct.topicId] = (topicMatureCountMap[ct.topicId] || 0) + 1
              }
              if (srs.dueDate <= todayIso) {
                topicDueCountMap[ct.topicId] = (topicDueCountMap[ct.topicId] || 0) + 1
              }
            }
          })
        } catch {}
      }
    }

    // 3. Assemble Hierarchical Tree Structure
    const majors = INITIAL_TOPICS.map((major) => {
      let majorTotalCards = 0
      let majorMatureCards = 0
      let majorDueCards = 0

      const subtopics = major.subtopics.map((sub) => {
        const count = topicCardCountMap[sub.id] || 0
        const mature = topicMatureCountMap[sub.id] || 0
        const due = topicDueCountMap[sub.id] || 0

        majorTotalCards += count
        majorMatureCards += mature
        majorDueCards += due

        return {
          id: sub.id,
          parentId: sub.parentId,
          nameEn: sub.nameEn,
          nameVi: sub.nameVi,
          description: sub.description,
          icon: sub.icon || 'Folder',
          cardCount: count,
          matureCount: mature,
          dueCount: due,
        }
      })

      // Also add direct assignments to major ID if any
      const directMajorCount = topicCardCountMap[major.id] || 0
      majorTotalCards += directMajorCount

      return {
        id: major.id,
        nameEn: major.nameEn,
        nameVi: major.nameVi,
        description: major.description,
        icon: major.icon,
        color: major.color,
        totalCards: majorTotalCards,
        matureCards: majorMatureCards,
        dueCards: majorDueCards,
        retentionRate: majorTotalCards > 0 ? Math.round((majorMatureCards / majorTotalCards) * 100) : 0,
        subtopics,
      }
    })

    const totalUserCards = Object.values(topicCardCountMap).reduce((a, b) => a + b, 0) + totalUnclassifiedCount

    return NextResponse.json({
      topics: majors,
      stats: {
        totalUserCards,
        totalClassifiedCards: Object.values(topicCardCountMap).reduce((a, b) => a + b, 0),
        totalUnclassifiedCards: totalUnclassifiedCount,
        majorCount: majors.length,
      },
    })
  } catch (error) {
    console.error('Fetch topics error:', error)
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 })
  }
}

