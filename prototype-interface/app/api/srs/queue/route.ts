import { NextResponse } from 'next/server'
import { db, fallbackToSqlite } from '@/lib/db'
import { cards, cardSrsStates, decks, cardTopics } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { seedDatabase } from '@/lib/db/seed'
import { eq, lte, and, inArray } from 'drizzle-orm'
import { safeJsonParse } from '@/lib/utils'
import { ALL_TAXONOMY_TOPICS } from '@/lib/db/initial_topics'

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
    const deckId = searchParams.get('deckId')

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
      for (const major of ALL_TAXONOMY_TOPICS) {
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
          .limit(1000)
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
          .limit(1000)
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

    // 2. If deckId is specified, fetch cards belonging to that specific deck
    if (deckId) {
      let deckCards: any[] = []
      try {
        deckCards = await activeDb
          .select(fullSelectFields)
          .from(cards)
          .innerJoin(decks, eq(cards.deckId, decks.id))
          .leftJoin(
            cardSrsStates,
            and(eq(cards.id, cardSrsStates.cardId), eq(cardSrsStates.userId, userId))
          )
          .where(eq(cards.deckId, deckId))
          .limit(1000)
      } catch (dbErr) {
        console.warn('Queue deck query failed, falling back to SQLite:', dbErr)
        activeDb = fallbackToSqlite()
        try {
          deckCards = await activeDb
            .select(baseSelectFields)
            .from(cards)
            .innerJoin(decks, eq(cards.deckId, decks.id))
            .leftJoin(
              cardSrsStates,
              and(eq(cards.id, cardSrsStates.cardId), eq(cardSrsStates.userId, userId))
            )
            .where(eq(cards.deckId, deckId))
            .limit(1000)
        } catch {}
      }

      // Sort cards: due cards first, then other cards in deck
      const dueCardsInDeck = deckCards.filter((c: any) => c.dueDate && c.dueDate <= nowIso)
      const otherCardsInDeck = deckCards.filter((c: any) => !c.dueDate || c.dueDate > nowIso)
      const sortedDeckCards = [...dueCardsInDeck, ...otherCardsInDeck]

      const formattedQueue = sortedDeckCards.map((item: any) => ({
        ...item,
        repetition: item.repetition ?? 0,
        interval: item.interval ?? 0,
        easeFactor: item.easeFactor ?? 2.5,
        dueDate: item.dueDate || nowIso,
        collocations: safeJsonParse(item.collocationsJson, []),
        allDefinitions: safeJsonParse(item.allDefinitionsJson, []),
      }))

      return NextResponse.json({
        totalDue: dueCardsInDeck.length,
        queue: formattedQueue,
        deckId,
      })
    }

    // 3. Default SRS Queue Flow (All Decks)
    let allUserCards: any[] = []

    try {
      allUserCards = await activeDb
        .select(fullSelectFields)
        .from(cards)
        .innerJoin(decks, eq(cards.deckId, decks.id))
        .leftJoin(
          cardSrsStates,
          and(eq(cards.id, cardSrsStates.cardId), eq(cardSrsStates.userId, userId))
        )
        .limit(1000)
    } catch (dbErr) {
      console.warn('Queue default query failed, falling back to SQLite:', dbErr)
      activeDb = fallbackToSqlite()
      try {
        allUserCards = await activeDb
          .select(baseSelectFields)
          .from(cards)
          .innerJoin(decks, eq(cards.deckId, decks.id))
          .leftJoin(
            cardSrsStates,
            and(eq(cards.id, cardSrsStates.cardId), eq(cardSrsStates.userId, userId))
          )
          .limit(1000)
      } catch {}
    }

    const dueCards = allUserCards.filter((c: any) => c.dueDate && c.dueDate <= nowIso)
    const otherCards = allUserCards.filter((c: any) => !c.dueDate || c.dueDate > nowIso)

    // Sort: due cards first, then other cards
    const targetCards = includeAll ? [...dueCards, ...otherCards] : (dueCards.length > 0 ? dueCards : [...dueCards, ...otherCards])

    const formattedQueue = targetCards.map((item: any) => ({
      ...item,
      repetition: item.repetition ?? 0,
      interval: item.interval ?? 0,
      easeFactor: item.easeFactor ?? 2.5,
      dueDate: item.dueDate || nowIso,
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
