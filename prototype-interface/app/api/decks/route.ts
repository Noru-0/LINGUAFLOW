import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { decks, cards } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { seedDatabase } from '@/lib/db/seed'
import { eq, sql } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await seedDatabase()
    const session = await getSession()
    const userId = session?.userId || 'user_demo_alex_lee'

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

    const body = await request.json()
    const { title, description } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const deckId = `deck_${Date.now()}`
    await db.insert(decks).values({
      id: deckId,
      userId,
      title,
      description: description || '',
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
