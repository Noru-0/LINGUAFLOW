import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cards, cardSrsStates, decks } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { seedDatabase } from '@/lib/db/seed'
import { eq, lte, and } from 'drizzle-orm'
import { safeJsonParse } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await seedDatabase()
    const session = await getSession()
    const userId = session?.userId || 'user_demo_alex_lee'

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

    let dueCards: any[] = []
    let allUserCards: any[] = []

    try {
      dueCards = await db
        .select(fullSelectFields)
        .from(cards)
        .innerJoin(cardSrsStates, eq(cards.id, cardSrsStates.cardId))
        .innerJoin(decks, eq(cards.deckId, decks.id))
        .where(and(eq(cardSrsStates.userId, userId), lte(cardSrsStates.dueDate, nowIso)))
        .limit(30)
    } catch {
      dueCards = await db
        .select(baseSelectFields)
        .from(cards)
        .innerJoin(cardSrsStates, eq(cards.id, cardSrsStates.cardId))
        .innerJoin(decks, eq(cards.deckId, decks.id))
        .where(and(eq(cardSrsStates.userId, userId), lte(cardSrsStates.dueDate, nowIso)))
        .limit(30)
    }

    let result = dueCards
    if (result.length === 0) {
      try {
        allUserCards = await db
          .select(fullSelectFields)
          .from(cards)
          .innerJoin(cardSrsStates, eq(cards.id, cardSrsStates.cardId))
          .innerJoin(decks, eq(cards.deckId, decks.id))
          .where(eq(cardSrsStates.userId, userId))
          .limit(30)
      } catch {
        allUserCards = await db
          .select(baseSelectFields)
          .from(cards)
          .innerJoin(cardSrsStates, eq(cards.id, cardSrsStates.cardId))
          .innerJoin(decks, eq(cards.deckId, decks.id))
          .where(eq(cardSrsStates.userId, userId))
          .limit(30)
      }
      result = allUserCards
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
