import { NextResponse } from 'next/server'
import { db, fallbackToSqlite } from '@/lib/db'
import { cards, decks, cardTopics, cardTopicReviewHistory, topics } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { seedDatabase } from '@/lib/db/seed'
import { eq, inArray } from 'drizzle-orm'
import { ALL_TAXONOMY_TOPICS } from '@/lib/db/initial_topics'
import { batchClassifyWords } from '@/services/gemini-service'
import { classifyCardsWithVocabClassifierDetailed } from '@/services/vocab-classifier-client'
import { safeJsonParse } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

async function ensureTaxonomyTopicsExist(activeDb: any) {
  try {
    const existing = await activeDb.select({ id: topics.id }).from(topics)
    const existingIds = new Set(existing.map((t: any) => t.id))
    let order = existingIds.size
    const missingRows: any[] = []

    for (const major of ALL_TAXONOMY_TOPICS) {
      order++
      if (!existingIds.has(major.id)) {
        missingRows.push({
          id: major.id,
          parentId: null,
          nameEn: major.nameEn,
          nameVi: major.nameVi,
          description: major.description,
          icon: major.icon,
          color: major.color,
          orderIndex: order,
        })
      }
      for (const sub of major.subtopics) {
        order++
        if (!existingIds.has(sub.id)) {
          missingRows.push({
            id: sub.id,
            parentId: sub.parentId,
            nameEn: sub.nameEn,
            nameVi: sub.nameVi,
            description: sub.description,
            icon: sub.icon || 'Folder',
            color: major.color,
            orderIndex: order,
          })
        }
      }
    }

    for (const chunk of chunkArray(missingRows, 50)) {
      await activeDb.insert(topics).values(chunk).onConflictDoNothing?.().catch(async () => {
        for (const row of chunk) {
          await activeDb.insert(topics).values(row).catch(() => {})
        }
      })
    }
  } catch {}
}

export async function POST(request: Request) {
  let activeDb = db
  try {
    await seedDatabase()
    const session = await getSession()
    const userId = session?.userId || 'user_demo_alex_lee'

    const body = await request.json().catch(() => ({}))
    const { scope = 'all_decks', deckId = null } = body

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
    let deckCards: any[] = []
    try {
      deckCards = await activeDb
        .select({
          id: cards.id,
          term: cards.term,
          partOfSpeech: cards.partOfSpeech,
          vietnameseDefinition: cards.vietnameseDefinition,
          englishMeaning: cards.englishMeaning,
          exampleSentence: cards.exampleSentence,
          collocationsJson: cards.collocationsJson,
        })
        .from(cards)
        .where(inArray(cards.deckId, targetDeckIds))
    } catch {
      deckCards = await activeDb
        .select({
          id: cards.id,
          term: cards.term,
          partOfSpeech: cards.partOfSpeech,
          vietnameseDefinition: cards.vietnameseDefinition,
          exampleSentence: cards.exampleSentence,
          collocationsJson: cards.collocationsJson,
        })
        .from(cards)
        .where(inArray(cards.deckId, targetDeckIds))
    }

    if (deckCards.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No cards found to cluster',
        processedCount: 0,
        classifiedCount: 0,
      })
    }

    // 3. Strictly filter to cards that do NOT yet have any entry in card_topics
    let cardsToClassify = deckCards
    try {
      const existingCardTopics = await activeDb
        .select({ cardId: cardTopics.cardId })
        .from(cardTopics)
        .where(inArray(cardTopics.cardId, deckCards.map((c: any) => c.id)))

      const alreadyClassifiedSet = new Set(existingCardTopics.map((ct: any) => ct.cardId))
      cardsToClassify = deckCards.filter((c: any) => !alreadyClassifiedSet.has(c.id))
    } catch (ctErr) {
      console.warn('[AutoCluster] Could not read existing card_topics, proceeding:', ctErr)
    }

    if (cardsToClassify.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All cards are already classified',
        processedCount: deckCards.length,
        newlyClassifiedCount: 0,
        alreadyClassified: true,
      })
    }

    // 4. Prefer production Python vocab_classifier service; fall back cleanly to TypeScript/Gemini engine
    const mlResult = await classifyCardsWithVocabClassifierDetailed(
      cardsToClassify.map((c: any) => ({
        id: c.id,
        term: c.term,
        partOfSpeech: c.partOfSpeech,
        englishMeaning: c.englishMeaning,
        vietnameseMeaning: c.vietnameseDefinition,
        exampleSentence: c.exampleSentence,
        collocations: safeJsonParse(c.collocationsJson, []),
      }))
    )
    const mlPredictions = mlResult.predictions

    const fallbackCards = mlPredictions
      ? cardsToClassify.filter((c: any) => !mlPredictions.has(c.id))
      : cardsToClassify

    const fallbackResults =
      fallbackCards.length > 0
        ? await batchClassifyWords(
            fallbackCards.map((c: any) => ({
              id: c.id,
              term: c.term,
              vietnameseMeaning: c.vietnameseDefinition,
              exampleSentence: c.exampleSentence,
            }))
          )
        : new Map()

    // 5. Persist classifications in batches (replaces ~1,200+ sequential round-trips)
    await ensureTaxonomyTopicsExist(activeDb)

    const nowIso = new Date().toISOString()
    let acceptedCount = 0
    let needsReviewCount = 0
    const summaryDistribution: Record<string, number> = {}
    const cardTopicRows: any[] = []
    const historyRows: any[] = []
    const targetCardIds: string[] = []

    for (const card of cardsToClassify) {
      const mlPred = mlPredictions?.get(card.id)
      const fb = fallbackResults.get(card.id)

      const mainTopicId = mlPred ? mlPred.prediction.main_topic.id : fb?.majorTopicId
      const subtopicId = mlPred ? mlPred.prediction.subtopic.id : fb?.subtopicId
      const confidence = mlPred ? mlPred.joint_confidence : fb?.confidence || 0.9
      const status = mlPred ? mlPred.status : confidence >= 0.3 ? 'accepted' : 'needs_review'
      const modelVersion = mlPred ? mlPred.model_version : 'gemini-fallback'

      if (!subtopicId || !mainTopicId) continue

      const rand = Math.random().toString(36).substring(2, 7)
      targetCardIds.push(card.id)
      cardTopicRows.push({
        id: `ct_${Date.now()}_${cardTopicRows.length}_${rand}`,
        cardId: card.id,
        topicId: subtopicId,
        isPrimary: true,
        confidence,
        assignedBy: mlPred ? 'ml_model' : 'ai',
        predictedMainTopic: mainTopicId,
        predictedSubtopic: subtopicId,
        humanVerified: false,
        predictionStatus: status,
        modelVersion,
        createdAt: nowIso,
      })
      historyRows.push({
        id: `cth_${Date.now()}_${historyRows.length}_${rand}`,
        cardId: card.id,
        action: 'auto_classified',
        previousTopicId: null,
        newTopicId: subtopicId,
        actor: modelVersion,
        createdAt: nowIso,
      })

      if (status === 'needs_review') needsReviewCount++
      else acceptedCount++
      summaryDistribution[subtopicId] = (summaryDistribution[subtopicId] || 0) + 1
    }

    let successfullyClassified = 0
    for (const ctChunk of chunkArray(cardTopicRows, 100)) {
      try {
        await activeDb.insert(cardTopics).values(ctChunk)
        successfullyClassified += ctChunk.length
      } catch (chunkErr) {
        console.warn('[AutoCluster] Batch insert failed, retrying rows individually:', chunkErr)
        for (const row of ctChunk) {
          try {
            await activeDb.insert(cardTopics).values(row)
            successfullyClassified++
          } catch {}
        }
      }
    }

    for (const histChunk of chunkArray(historyRows, 100)) {
      try {
        await activeDb.insert(cardTopicReviewHistory).values(histChunk)
      } catch {}
    }

    const usedEngine = mlPredictions ? 'vocab_classifier_v1' : 'fallback'

    return NextResponse.json({
      success: true,
      processedCount: deckCards.length,
      newlyClassifiedCount: successfullyClassified,
      acceptedCount,
      needsReviewCount,
      engine: usedEngine,
      mlError: mlResult.error,
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
