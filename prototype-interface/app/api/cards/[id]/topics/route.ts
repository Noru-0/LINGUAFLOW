import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cardTopics, topics } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { findTopicDetails } from '@/services/gemini-service'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cardId } = await params
    const body = await request.json()
    const { subtopicId } = body

    if (!subtopicId) {
      return NextResponse.json({ error: 'subtopicId is required' }, { status: 400 })
    }

    const topicDetails = findTopicDetails(subtopicId)
    if (!topicDetails) {
      return NextResponse.json({ error: 'Invalid subtopicId' }, { status: 400 })
    }

    const nowIso = new Date().toISOString()

    // Delete existing topic associations for this card
    await db.delete(cardTopics).where(eq(cardTopics.cardId, cardId))

    // Insert user override
    const ctId = `ct_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    await db.insert(cardTopics).values({
      id: ctId,
      cardId,
      topicId: subtopicId,
      isPrimary: true,
      confidence: 1.0,
      assignedBy: 'user',
      createdAt: nowIso,
    })

    return NextResponse.json({
      success: true,
      cardId,
      topic: {
        id: subtopicId,
        nameEn: topicDetails.subtopicName,
        majorTopicId: topicDetails.majorTopicId,
        majorTopicName: topicDetails.majorTopicName,
        assignedBy: 'user',
      },
    })
  } catch (error) {
    console.error('Update card topic error:', error)
    return NextResponse.json({ error: 'Failed to update card topic' }, { status: 500 })
  }
}

