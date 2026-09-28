import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { decks, cards, users } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { seedDatabase, seedStarterDecksForUser } from '@/lib/db/seed'
import { eq, sql } from 'drizzle-orm'

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

    let userDecks = await db
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

    if (userDecks.length === 0) {
      await seedStarterDecksForUser(userId)
      userDecks = await db
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
    }

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
