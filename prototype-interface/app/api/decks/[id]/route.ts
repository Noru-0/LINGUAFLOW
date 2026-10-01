import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { decks, cards, cardSrsStates, cardDsrStates, cardMemoryState, cardReviewHistory, reviewLogs } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { eq, and, inArray } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    const userId = session?.userId || 'user_demo_alex_lee'
    const { id: deckId } = await params

    if (!deckId) {
      return NextResponse.json({ error: 'Deck ID is required' }, { status: 400 })
    }

    // 1. Find all cards in this deck
    const deckCards = await db
      .select({ id: cards.id })
      .from(cards)
      .where(eq(cards.deckId, deckId))

    const cardIds = deckCards.map((c: any) => c.id)

    // 2. Cascade delete all card-related records across all tables
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

    // 3. Delete the deck
    await db.delete(decks).where(and(eq(decks.id, deckId), eq(decks.userId, userId)))

    return NextResponse.json({ success: true, deletedDeckId: deckId, deletedCardsCount: cardIds.length })
  } catch (error: any) {
    console.error('Delete deck error:', error)
    return NextResponse.json({ error: error?.message || 'Failed to delete deck' }, { status: 500 })
  }
}
