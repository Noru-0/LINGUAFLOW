import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cards, decks, cardTopics, topics, cardSrsStates, cardMemoryState } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { eq, inArray, or } from 'drizzle-orm'
import { safeJsonParse } from '@/lib/utils'
import { INITIAL_TOPICS } from '@/lib/db/initial_topics'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    const userId = session?.userId || 'user_demo_alex_lee'
    const { id: topicId } = await params

    // 1. Find topic details from taxonomy
    let targetTopicInfo: any = null
    const subtopicIdsToQuery: string[] = [topicId]

    for (const major of INITIAL_TOPICS) {
      if (major.id === topicId) {
        targetTopicInfo = {
          id: major.id,
          nameEn: major.nameEn,
          nameVi: major.nameVi,
          icon: major.icon,
          color: major.color,
          isMajor: true,
        }
        // Include all subtopics of this major topic
        major.subtopics.forEach((s) => subtopicIdsToQuery.push(s.id))
        break
      }
      for (const sub of major.subtopics) {
        if (sub.id === topicId) {
          targetTopicInfo = {
            id: sub.id,
            parentId: sub.parentId,
            nameEn: sub.nameEn,
            nameVi: sub.nameVi,
            icon: sub.icon || 'Folder',
            color: major.color,
            majorNameEn: major.nameEn,
            majorNameVi: major.nameVi,
            isMajor: false,
          }
          break
        }
      }
      if (targetTopicInfo) break
    }

    if (!targetTopicInfo) {
      targetTopicInfo = {
        id: topicId,
        nameEn: topicId,
        nameVi: topicId,
        icon: 'Folder',
        color: '#3B82F6',
        isMajor: false,
      }
    }

    // 2. Fetch user's decks
    const userDecks = await db.select().from(decks).where(eq(decks.userId, userId))
    const userDeckIds = userDecks.map((d: any) => d.id)
    const deckMap = new Map(userDecks.map((d: any) => [d.id, d.title]))

    if (userDeckIds.length === 0) {
      return NextResponse.json({
        topic: targetTopicInfo,
        totalCards: 0,
        cards: [],
      })
    }

    // 3. Find card_topics matching the subtopics
    const matchingCardTopics = await db
      .select({
        cardId: cardTopics.cardId,
        topicId: cardTopics.topicId,
        confidence: cardTopics.confidence,
        assignedBy: cardTopics.assignedBy,
      })
      .from(cardTopics)
      .where(inArray(cardTopics.topicId, subtopicIdsToQuery))

    const matchedCardIds = matchingCardTopics.map((ct: any) => ct.cardId)

    if (matchedCardIds.length === 0) {
      return NextResponse.json({
        topic: targetTopicInfo,
        totalCards: 0,
        cards: [],
      })
    }

    // 4. Fetch the cards themselves (restricted to user's decks)
    const topicCards = await db
      .select({
        id: cards.id,
        deckId: cards.deckId,
        term: cards.term,
        vietnameseDefinition: cards.vietnameseDefinition,
        englishMeaning: cards.englishMeaning,
        phonetic: cards.phonetic,
        partOfSpeech: cards.partOfSpeech,
        exampleSentence: cards.exampleSentence,
        cefrLevel: cards.cefrLevel,
        audioUrl: cards.audioUrl,
        imageUrl: cards.imageUrl,
        collocationsJson: cards.collocationsJson,
        createdAt: cards.createdAt,
      })
      .from(cards)
      .where(inArray(cards.id, matchedCardIds))

    // Filter to ensure only cards from user's decks are included
    const userOwnedCards = topicCards.filter((c: any) => userDeckIds.includes(c.deckId))

    // 5. Fetch SRS / Memory states for retention analysis
    const srsList = await db
      .select({
        cardId: cardSrsStates.cardId,
        repetition: cardSrsStates.repetition,
        interval: cardSrsStates.interval,
        easeFactor: cardSrsStates.easeFactor,
        dueDate: cardSrsStates.dueDate,
      })
      .from(cardSrsStates)
      .where(eq(cardSrsStates.userId, userId))

    const srsMap = new Map<string, any>(srsList.map((s: any) => [s.cardId, s]))

    const todayIso = new Date().toISOString().split('T')[0]

    const formattedCards = userOwnedCards.map((c: any) => {
      const srs: any = srsMap.get(c.id)
      const isDue = srs ? srs.dueDate <= todayIso : false
      const isMature = srs ? srs.interval >= 21 : false

      return {
        ...c,
        deckTitle: deckMap.get(c.deckId) || 'User Deck',
        collocations: safeJsonParse(c.collocationsJson, []),
        srs: srs || {
          repetition: 0,
          interval: 0,
          easeFactor: 2.5,
          dueDate: todayIso,
        },
        isDue,
        isMature,
      }
    })

    return NextResponse.json({
      topic: targetTopicInfo,
      totalCards: formattedCards.length,
      dueCardsCount: formattedCards.filter((c: any) => c.isDue).length,
      matureCardsCount: formattedCards.filter((c: any) => c.isMature).length,
      cards: formattedCards,
    })
  } catch (error) {
    console.error('Fetch topic cards error:', error)
    return NextResponse.json({ error: 'Failed to fetch topic cards' }, { status: 500 })
  }
}
