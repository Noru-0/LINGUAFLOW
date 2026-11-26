import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cardTopics, cardTopicReviewHistory } from '@/lib/db/schema'
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

    // Preserve original model predictions before replacing active assignment
    const existingRows = await db
      .select({
        topicId: cardTopics.topicId,
        predictedMainTopic: cardTopics.predictedMainTopic,
        predictedSubtopic: cardTopics.predictedSubtopic,
        predictionStatus: cardTopics.predictionStatus,
        modelVersion: cardTopics.modelVersion,
      })
      .from(cardTopics)
      .where(eq(cardTopics.cardId, cardId))

    const prev = existingRows[0]
    const preservedMain = prev?.predictedMainTopic || null
    const preservedSub = prev?.predictedSubtopic || prev?.topicId || null
    const preservedStatus = prev?.predictionStatus || 'accepted'
    const preservedModelVersion = prev?.modelVersion || null

    await db.delete(cardTopics).where(eq(cardTopics.cardId, cardId))

    const ctId = `ct_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    await db.insert(cardTopics).values({
      id: ctId,
      cardId,
      topicId: subtopicId,
      isPrimary: true,
      confidence: 1.0,
      assignedBy: 'user',
      predictedMainTopic: preservedMain,
      predictedSubtopic: preservedSub,
      humanVerified: true,
      predictionStatus: preservedStatus,
      modelVersion: preservedModelVersion,
      createdAt: nowIso,
    })

    try {
      const action = preservedSub && preservedSub === subtopicId ? 'human_verified' : 'human_corrected'
      await db.insert(cardTopicReviewHistory).values({
        id: `cth_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        cardId,
        action,
        previousTopicId: prev?.topicId || null,
        newTopicId: subtopicId,
        actor: 'user',
        createdAt: nowIso,
      })
    } catch {}

    return NextResponse.json({
      success: true,
      cardId,
      humanVerified: true,
      predictedMainTopic: preservedMain,
      predictedSubtopic: preservedSub,
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
