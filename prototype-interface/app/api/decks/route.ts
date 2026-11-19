import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { decks, cards, cardSrsStates, cardDsrStates, cardMemoryState, cardReviewHistory, reviewLogs, users } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { seedDatabase } from '@/lib/db/seed'
import { eq, and, inArray, sql, asc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

async function ensureUserExists(userId: string, email?: string, name?: string) {
  try {
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1)
    if (existing.length === 0) {
      await db.insert(users).values({
        id: userId,
        email: email || `${userId}@user.local`,
        passwordHash: 'auth_user_session',
        name: name || 'Learner',
        role: 'user',
        createdAt: new Date().toISOString(),
      }).catch(() => {})
    }
  } catch {}
}

export async function GET() {
  try {
    await seedDatabase()
    const session = await getSession()
    const userId = session?.userId || 'user_demo_alex_lee'
    await ensureUserExists(userId, session?.email, session?.name)

    const userDecks = await db
      .select({
        id: decks.id,
        title: decks.title,
        description: decks.description,
        isPublic: decks.isPublic,
        createdAt: decks.createdAt,
        cardCount: sql<number>`count(${cards.id})`,
      })
      .from(decks)
      .leftJoin(cards, eq(decks.id, cards.deckId))
      .where(eq(decks.userId, userId))
      .groupBy(decks.id, decks.title, decks.description, decks.isPublic, decks.createdAt)
      .orderBy(asc(decks.createdAt), asc(decks.id))

    return NextResponse.json({ decks: userDecks })
  } catch (error) {
    console.error('Fetch decks error:', error)
    return NextResponse.json({ error: 'Failed to fetch decks' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    const userId = session?.userId || 'user_demo_alex_lee'
    await ensureUserExists(userId, session?.email, session?.name)

    const body = await request.json()
    const { title, description } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const deckId = `deck_${Date.now()}`
    const createdAt = new Date().toISOString()
    await db.insert(decks).values({
      id: deckId,
      userId,
      title,
      description: description || '',
      createdAt,
    })

    return NextResponse.json({
      deck: {
        id: deckId,
        title,
        description,
      },
    })
  } catch (error) {
    console.error('Create deck error:', error)
    return NextResponse.json({ error: 'Failed to create deck' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession()
    const userId = session?.userId || 'user_demo_alex_lee'
    const { searchParams } = new URL(request.url)
    const deckId = searchParams.get('deckId') || searchParams.get('id')

    if (!deckId) {
      return NextResponse.json({ error: 'Deck ID is required' }, { status: 400 })
    }

    const deckCards = await db
      .select({ id: cards.id })
      .from(cards)
      .where(eq(cards.deckId, deckId))

    const cardIds = deckCards.map((c: any) => c.id)

    if (cardIds.length > 0) {
      try {
        await db.delete(cardMemoryState).where(inArray(cardMemoryState.cardId, cardIds))
      } catch {}
      try {
        await db.delete(cardReviewHistory).where(inArray(cardReviewHistory.cardId, cardIds))
      } catch {}
      try {
        await db.delete(cardDsrStates).where(inArray(cardDsrStates.cardId, cardIds))
      } catch {}
      try {
        await db.delete(cardSrsStates).where(inArray(cardSrsStates.cardId, cardIds))
      } catch {}
      try {
        await db.delete(reviewLogs).where(inArray(reviewLogs.cardId, cardIds))
      } catch {}
      try {
        await db.delete(cards).where(eq(cards.deckId, deckId))
      } catch {}
    }

    await db.delete(decks).where(and(eq(decks.id, deckId), eq(decks.userId, userId)))

    return NextResponse.json({ success: true, deletedDeckId: deckId, deletedCardsCount: cardIds.length })
  } catch (error: any) {
    console.error('Delete deck error:', error)
    return NextResponse.json({ error: error?.message || 'Failed to delete deck' }, { status: 500 })
  }
}
