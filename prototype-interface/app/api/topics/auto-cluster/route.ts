import { NextResponse } from 'next/server'
import { db, fallbackToSqlite } from '@/lib/db'
import { cards, decks, cardTopics, topics } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { seedDatabase } from '@/lib/db/seed'
import { eq, inArray } from 'drizzle-orm'
import { batchClassifyWords } from '@/services/gemini-service'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  let activeDb = db
  try {
    await seedDatabase()
    const session = await getSession()
    const userId = session?.userId || 'user_demo_alex_lee'

    const body = await request.json().catch(() => ({}))
    const { scope = 'all_decks', deckId = null, forceReclassify = false } = body

    // 1. Fetch relevant user decks with automatic fallback
    let targetDeckIds: string[] = []
    try {
      if (scope === 'specific_deck' && deckId) {
        targetDeckIds = [deckId]
      } else {
        const userDecks = await activeDb.select({ id: decks.id }).from(decks).where(eq(decks.userId, userId))
        targetDeckIds = userDecks.map((d: any) => d.id)
      }
    } catch (queryErr) {
      console.warn('[AutoCluster] Primary DB failed, falling back to SQLite:', queryErr)
      activeDb = fallbackToSqlite()
      if (scope === 'specific_deck' && deckId) {
        targetDeckIds = [deckId]
      } else {
        const userDecks = await activeDb.select({ id: decks.id }).from(decks).where(eq(decks.userId, userId))
        targetDeckIds = userDecks.map((d: any) => d.id)
      }
    }

    // If target user has no decks found, search across all available decks
    if (targetDeckIds.length === 0) {
      try {
        const allDecks = await activeDb.select({ id: decks.id }).from(decks)
        targetDeckIds = allDecks.map((d: any) => d.id)
      } catch {}
    }

    if (targetDeckIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No decks found to cluster',
        processedCount: 0,
        classifiedCount: 0,
      })
    }

    // 2. Fetch cards in target decks
    const deckCards = await activeDb
      .select({
        id: cards.id,
        term: cards.term,
        vietnameseDefinition: cards.vietnameseDefinition,
        exampleSentence: cards.exampleSentence,
      })
      .from(cards)
      .where(inArray(cards.deckId, targetDeckIds))

    if (deckCards.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No cards found to cluster',
        processedCount: 0,
        classifiedCount: 0,
      })
    }

    // 3. Determine which cards need classification
    let cardsToClassify = deckCards
    if (!forceReclassify) {
      try {
        const existingCardTopics = await activeDb
          .select({ cardId: cardTopics.cardId })
          .from(cardTopics)
          .where(inArray(cardTopics.cardId, deckCards.map((c: any) => c.id)))

        const alreadyClassifiedSet = new Set(existingCardTopics.map((ct: any) => ct.cardId))
        cardsToClassify = deckCards.filter((c: any) => !alreadyClassifiedSet.has(c.id))
      } catch (ctErr) {
        console.warn('[AutoCluster] Could not read existing card_topics, proceeding to reclassify:', ctErr)
      }
    }

    if (cardsToClassify.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All cards are already classified',
        processedCount: deckCards.length,
        classifiedCount: 0,
        alreadyClassified: true,
      })
    }

    // 4. Run Batch Classification Engine
    const classificationResults = await batchClassifyWords(
      cardsToClassify.map((c: any) => ({
        id: c.id,
        term: c.term,
        vietnameseMeaning: c.vietnameseDefinition,
        exampleSentence: c.exampleSentence,
      }))
    )

    // 5. Persist classifications into card_topics
    const nowIso = new Date().toISOString()
    let successfullyClassified = 0
    const summaryDistribution: Record<string, number> = {}

    for (const [cardId, topicInfo] of classificationResults.entries()) {
      if (!topicInfo?.subtopicId) continue

      // If forceReclassify, remove old link first
      if (forceReclassify) {
        try {
          await activeDb.delete(cardTopics).where(eq(cardTopics.cardId, cardId))
        } catch {}
      }

      try {
        const ctId = `ct_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
        await activeDb.insert(cardTopics).values({
          id: ctId,
          cardId,
          topicId: topicInfo.subtopicId,
          isPrimary: true,
          confidence: topicInfo.confidence || 0.9,
          assignedBy: 'ai',
          createdAt: nowIso,
        })
        successfullyClassified++
        summaryDistribution[topicInfo.subtopicId] = (summaryDistribution[topicInfo.subtopicId] || 0) + 1
      } catch (insertErr) {
        console.warn('Error inserting card_topic:', insertErr)
      }
    }

    return NextResponse.json({
      success: true,
      processedCount: deckCards.length,
      newlyClassifiedCount: successfullyClassified,
      summary: summaryDistribution,
    })
  } catch (error: any) {
    console.error('Auto cluster error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to auto-cluster vocabulary' },
      { status: 500 }
    )
  }
}
