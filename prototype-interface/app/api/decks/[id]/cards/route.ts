import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cards, cardSrsStates } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { seedDatabase } from '@/lib/db/seed'
import { eq } from 'drizzle-orm'
import { safeJsonParse } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await seedDatabase()
    const { id: deckId } = await params

    const deckCards = await db
      .select({
        id: cards.id,
        term: cards.term,
        vietnameseDefinition: cards.vietnameseDefinition,
        phonetic: cards.phonetic,
        partOfSpeech: cards.partOfSpeech,
        exampleSentence: cards.exampleSentence,
        collocationsJson: cards.collocationsJson,
        dueDate: cardSrsStates.dueDate,
      })
      .from(cards)
      .leftJoin(cardSrsStates, eq(cards.id, cardSrsStates.cardId))
      .where(eq(cards.deckId, deckId))

    const formattedCards = deckCards.map((c: any) => ({
      ...c,
      collocations: safeJsonParse(c.collocationsJson, []),
    }))

    return NextResponse.json({ cards: formattedCards })
  } catch (error) {
    console.error('Fetch deck cards error:', error)
    return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    const userId = session?.userId || 'user_demo_alex_lee'
    const { id: deckId } = await params

    const body = await request.json()

    // Support single card creation or bulk import array
    const cardItems = Array.isArray(body) ? body : [body]
    const nowIso = new Date().toISOString()
    const insertedCards = []

    for (const item of cardItems) {
      if (!item.term || !item.vietnameseDefinition) {
        continue
      }

      const cardId = `card_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
      const collocationsJson = JSON.stringify(item.collocations || item.collocationsJson || [])

      await db.insert(cards).values({
        id: cardId,
        deckId,
        term: item.term,
        vietnameseDefinition: item.vietnameseDefinition,
        phonetic: item.phonetic || '',
        partOfSpeech: item.partOfSpeech || 'noun',
        exampleSentence: item.exampleSentence || '',
        collocationsJson,
      })

      // Initialize SRS state
      await db.insert(cardSrsStates).values({
        id: `srs_${cardId}_${userId}`,
        userId,
        cardId,
        repetition: 0,
        interval: 0,
        easeFactor: 2.5,
        dueDate: nowIso,
      })

      insertedCards.push({
        id: cardId,
        term: item.term,
        vietnameseDefinition: item.vietnameseDefinition,
      })
    }

    return NextResponse.json({
      success: true,
      count: insertedCards.length,
      cards: insertedCards,
    })
  } catch (error) {
    console.error('Create card error:', error)
    return NextResponse.json({ error: 'Failed to create cards' }, { status: 500 })
  }
}
