import { NextResponse } from 'next/server'
import { db, fallbackToSqlite } from '@/lib/db'
import { cards, cardSrsStates, decks, cardTopics } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { seedDatabase } from '@/lib/db/seed'
import { eq, lte, and, inArray } from 'drizzle-orm'
import { safeJsonParse } from '@/lib/utils'
import { INITIAL_TOPICS } from '@/lib/db/initial_topics'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  let activeDb = db
  try {
    await seedDatabase()
    const session = await getSession()
    const userId = session?.userId || 'user_demo_alex_lee'

    const { searchParams } = new URL(request.url)
    const includeAll = searchParams.get('all') === 'true'
    const topicId = searchParams.get('topicId')

    const nowIso = new Date().toISOString()

    const fullSelectFields = {
      cardId: cards.id,
      term: cards.term,
      vietnameseDefinition: cards.vietnameseDefinition,
      englishMeaning: cards.englishMeaning,
      phonetic: cards.phonetic,
      partOfSpeech: cards.partOfSpeech,
      exampleSentence: cards.exampleSentence,
      collocationsJson: cards.collocationsJson,
      cefrLevel: cards.cefrLevel,
      audioUrl: cards.audioUrl,
      imageUrl: cards.imageUrl,
      allDefinitionsJson: cards.allDefinitionsJson,
      deckTitle: decks.title,
      repetition: cardSrsStates.repetition,
      interval: cardSrsStates.interval,
      easeFactor: cardSrsStates.easeFactor,
      dueDate: cardSrsStates.dueDate,
    }

    const baseSelectFields = {
      cardId: cards.id,
      term: cards.term,
      vietnameseDefinition: cards.vietnameseDefinition,
      phonetic: cards.phonetic,
      partOfSpeech: cards.partOfSpeech,
      exampleSentence: cards.exampleSentence,
      collocationsJson: cards.collocationsJson,
      deckTitle: decks.title,
      repetition: cardSrsStates.repetition,
      interval: cardSrsStates.interval,
      easeFactor: cardSrsStates.easeFactor,
      dueDate: cardSrsStates.dueDate,
    }

    // 1. If topicId is specified, fetch cards belonging to that topic/subtopic
    if (topicId) {
      let subtopicIdsToQuery: string[] = [topicId]
      for (const major of INITIAL_TOPICS) {
        if (major.id === topicId) {
          major.subtopics.forEach((s) => subtopicIdsToQuery.push(s.id))
          break
        }
      }

      let matchedCardIds: string[] = []
      try {
        const matchingCardTopics = await activeDb
          .select({ cardId: cardTopics.cardId })
          .from(cardTopics)
          .where(inArray(cardTopics.topicId, subtopicIdsToQuery))
        matchedCardIds = matchingCardTopics.map((ct: any) => ct.cardId)
      } catch (ctErr) {
        console.warn('Queue topic query failed, falling back to SQLite:', ctErr)
        activeDb = fallbackToSqlite()
        try {
          const matchingCardTopics = await activeDb
            .select({ cardId: cardTopics.cardId })
            .from(cardTopics)
            .where(inArray(cardTopics.topicId, subtopicIdsToQuery))
          matchedCardIds = matchingCardTopics.map((ct: any) => ct.cardId)
        } catch {}
      }

      if (matchedCardIds.length === 0) {
        return NextResponse.json({
          totalDue: 0,
          queue: [],
          topicId,
        })
      }

      let topicCards: any[] = []
      try {
        topicCards = await activeDb
          .select(fullSelectFields)
          .from(cards)
          .innerJoin(decks, eq(cards.deckId, decks.id))
          .leftJoin(
            cardSrsStates,
            and(eq(cards.id, cardSrsStates.cardId), eq(cardSrsStates.userId, userId))
          )
          .where(inArray(cards.id, matchedCardIds))
          .limit(100)
      } catch {
        topicCards = await activeDb
          .select(baseSelectFields)
          .from(cards)
          .innerJoin(decks, eq(cards.deckId, decks.id))
          .leftJoin(
            cardSrsStates,
            and(eq(cards.id, cardSrsStates.cardId), eq(cardSrsStates.userId, userId))
          )
          .where(inArray(cards.id, matchedCardIds))
          .limit(100)
      }

      // Sort cards: due cards first, then other cards in topic
      const dueCardsInTopic = topicCards.filter((c: any) => c.dueDate && c.dueDate <= nowIso)
      const otherCardsInTopic = topicCards.filter((c: any) => !c.dueDate || c.dueDate > nowIso)
      const sortedTopicCards = [...dueCardsInTopic, ...otherCardsInTopic]

      const formattedQueue = sortedTopicCards.map((item: any) => ({
        ...item,
        repetition: item.repetition ?? 0,
        interval: item.interval ?? 0,
        easeFactor: item.easeFactor ?? 2.5,
        dueDate: item.dueDate || nowIso,
        collocations: safeJsonParse(item.collocationsJson, []),
        allDefinitions: safeJsonParse(item.allDefinitionsJson, []),
      }))

      return NextResponse.json({
        totalDue: dueCardsInTopic.length,
        queue: formattedQueue,
        topicId,
      })
    }

    // 2. Default SRS Queue Flow (All Decks)
    let dueCards: any[] = []

    try {
      dueCards = await activeDb
        .select(fullSelectFields)
        .from(cards)
        .innerJoin(cardSrsStates, eq(cards.id, cardSrsStates.cardId))
        .innerJoin(decks, eq(cards.deckId, decks.id))
        .where(and(eq(cardSrsStates.userId, userId), lte(cardSrsStates.dueDate, nowIso)))
        .limit(30)
    } catch (dbErr) {
      console.warn('Queue default query failed, falling back to SQLite:', dbErr)
      activeDb = fallbackToSqlite()
      try {
        dueCards = await activeDb
          .select(baseSelectFields)
          .from(cards)
          .innerJoin(cardSrsStates, eq(cards.id, cardSrsStates.cardId))
          .innerJoin(decks, eq(cards.deckId, decks.id))
          .where(and(eq(cardSrsStates.userId, userId), lte(cardSrsStates.dueDate, nowIso)))
          .limit(30)
      } catch {}
    }

    let result = dueCards

    if (includeAll && result.length === 0) {
      try {
        result = await activeDb
          .select(fullSelectFields)
          .from(cards)
          .innerJoin(cardSrsStates, eq(cards.id, cardSrsStates.cardId))
          .innerJoin(decks, eq(cards.deckId, decks.id))
          .where(eq(cardSrsStates.userId, userId))
          .limit(30)
      } catch {
        try {
          result = await activeDb
            .select(baseSelectFields)
            .from(cards)
            .innerJoin(cardSrsStates, eq(cards.id, cardSrsStates.cardId))
            .innerJoin(decks, eq(cards.deckId, decks.id))
            .where(eq(cardSrsStates.userId, userId))
            .limit(30)
        } catch {}
      }
    }

    const formattedQueue = result.map((item: any) => ({
      ...item,
      collocations: safeJsonParse(item.collocationsJson, []),
      allDefinitions: safeJsonParse(item.allDefinitionsJson, []),
    }))

    return NextResponse.json({
      totalDue: dueCards.length,
      queue: formattedQueue,
    })
  } catch (error) {
    console.error('Fetch SRS queue error:', error)
    return NextResponse.json({ error: 'Failed to fetch review queue' }, { status: 500 })
  }
}
