import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cards, decks, cardSrsStates, users, cardTopics, topics, cardMemoryState, cardReviewHistory, cardDsrStates, reviewLogs } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { seedDatabase } from '@/lib/db/seed'
import { eq, inArray } from 'drizzle-orm'
import { safeJsonParse } from '@/lib/utils'
import { enrichVocabulary } from '@/services/vocabulary-pipeline'
import { fetchContextualImage } from '@/services/unsplash-service'
import { getFallbackAudio } from '@/services/audio-fallback'

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await seedDatabase()
    const { id: deckId } = await params

    let deckCards: any[] = []

    try {
      // Try selecting extended enriched columns
      deckCards = await db
        .select({
          id: cards.id,
          term: cards.term,
          vietnameseDefinition: cards.vietnameseDefinition,
          englishMeaning: cards.englishMeaning,
          phonetic: cards.phonetic,
          partOfSpeech: cards.partOfSpeech,
          exampleSentence: cards.exampleSentence,
          cefrLevel: cards.cefrLevel,
          audioUrl: cards.audioUrl,
          imageUrl: cards.imageUrl,
          allDefinitionsJson: cards.allDefinitionsJson,
          collocationsJson: cards.collocationsJson,
          createdAt: cards.createdAt,
        })
        .from(cards)
        .where(eq(cards.deckId, deckId))
    } catch {
      // Fallback query for Postgres database without extended columns
      deckCards = await db
        .select({
          id: cards.id,
          term: cards.term,
          vietnameseDefinition: cards.vietnameseDefinition,
          phonetic: cards.phonetic,
          partOfSpeech: cards.partOfSpeech,
          exampleSentence: cards.exampleSentence,
          collocationsJson: cards.collocationsJson,
          createdAt: cards.createdAt,
        })
        .from(cards)
        .where(eq(cards.deckId, deckId))
    }

    // Attach topic information if available
    const cardTopicsMap: Record<string, any> = {}
    try {
      const cardIds = deckCards.map((c: any) => c.id)
      if (cardIds.length > 0) {
        const ctList = await db
          .select({
            cardId: cardTopics.cardId,
            topicId: cardTopics.topicId,
            nameEn: topics.nameEn,
            nameVi: topics.nameVi,
            icon: topics.icon,
            color: topics.color,
            parentId: topics.parentId,
          })
          .from(cardTopics)
          .leftJoin(topics, eq(cardTopics.topicId, topics.id))
          .where(inArray(cardTopics.cardId, cardIds))

        ctList.forEach((ct: any) => {
          if (ct.cardId) {
            cardTopicsMap[ct.cardId] = {
              id: ct.topicId,
              nameEn: ct.nameEn,
              nameVi: ct.nameVi,
              icon: ct.icon,
              color: ct.color,
              parentId: ct.parentId,
            }
          }
        })
      }
    } catch {}

    const formattedCards = deckCards.map((c: any) => ({
      ...c,
      topic: cardTopicsMap[c.id] || null,
      collocations: safeJsonParse(c.collocationsJson, []),
      allDefinitions: safeJsonParse(c.allDefinitionsJson, []),
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
    await ensureUserExists(userId, session?.email, session?.name)
    const { id: deckId } = await params

    const body = await request.json()

    // Support single card creation or bulk import array
    const cardItems = Array.isArray(body) ? body : [body]
    const nowIso = new Date().toISOString()

    // Query existing terms across ALL decks belonging to this user account
    const existingTermsSet = new Set<string>()
    try {
      const userDecks = await db.select({ id: decks.id }).from(decks).where(eq(decks.userId, userId))
      const userDeckIds = userDecks.map((d: any) => d.id)

      if (userDeckIds.length > 0) {
        const userExistingCards = await db
          .select({ term: cards.term })
          .from(cards)
          .where(inArray(cards.deckId, userDeckIds))

        userExistingCards.forEach((c: any) => {
          if (c.term) existingTermsSet.add(c.term.trim().toLowerCase())
        })
      }
    } catch {
      try {
        const allCards = await db.select({ term: cards.term }).from(cards)
        allCards.forEach((c: any) => {
          if (c.term) existingTermsSet.add(c.term.trim().toLowerCase())
        })
      } catch {}
    }

    const validItemsToProcess: any[] = []
    const skippedCards: any[] = []

    for (const item of cardItems) {
      if (!item.term || !item.term.trim()) continue

      const cleanTerm = item.term.trim().toLowerCase()

      // DUPLICATION CHECK: If the term already exists in ANY of the user's decks, DO NOT ADD IT AGAIN!
      if (existingTermsSet.has(cleanTerm)) {
        skippedCards.push({ term: item.term, reason: 'Duplicate word already exists in user account' })
        continue
      }

      // Mark as existing in current batch to avoid internal duplicates
      existingTermsSet.add(cleanTerm)
      validItemsToProcess.push(item)
    }

    // Process valid cards in parallel
    const insertedCards = await Promise.all(
      validItemsToProcess.map(async (item) => {
        const term = item.term.trim()
        const cardId = `card_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

        const isPlaceholderViet = !item.vietnameseDefinition || item.vietnameseDefinition.startsWith('Nghĩa')
        const missingAudioOrImage = !item.audioUrl || !item.imageUrl
        const missingDefinitions = !item.allDefinitions || !Array.isArray(item.allDefinitions) || item.allDefinitions.length === 0
        const needsEnrichment = isPlaceholderViet || missingAudioOrImage || missingDefinitions || (!item.englishMeaning && !item.phonetic)

        let enriched: any = null
        if (needsEnrichment) {
          try {
            enriched = await enrichVocabulary(term, item.partOfSpeech)
          } catch {
            // Safe fallback
          }
        }

        const primaryDef = enriched?.definitions?.[0]
        const vietnameseDefinition = !isPlaceholderViet
          ? item.vietnameseDefinition
          : primaryDef?.vietnameseMeaning || primaryDef?.englishMeaning || `Nghĩa tiếng Việt của ${term}`
        const englishMeaning = item.englishMeaning || item.collocations?.englishDefinition || primaryDef?.englishMeaning || enriched?.englishMeaning || ''
        const phonetic = item.phonetic || enriched?.ipaUk || enriched?.ipaUs || `/${term}/`
        const partOfSpeech = (item.partOfSpeech && item.partOfSpeech !== 'noun') ? item.partOfSpeech : (enriched?.partOfSpeech || item.partOfSpeech || 'noun')
        const exampleSentence = item.exampleSentence || primaryDef?.examples?.[0] || enriched?.examples?.[0] || ''
        const cefrLevel = item.cefrLevel || item.collocations?.level || primaryDef?.cefrLevel || enriched?.cefrLevel || 'B1'

        // Resolve audioUrl (never null)
        let audioUrl = item.audioUrl || enriched?.audioUkUrl || enriched?.audioUsUrl || null
        if (!audioUrl) {
          try {
            audioUrl = await getFallbackAudio(term)
          } catch {}
        }

        // Resolve imageUrl (never null)
        let imageUrl = item.imageUrl || enriched?.imageUrl || null
        if (!imageUrl) {
          try {
            const imgRes = await fetchContextualImage(term, englishMeaning || vietnameseDefinition)
            imageUrl = imgRes?.imageUrl || null
          } catch {}
        }

        // Resolve allDefinitions (never empty)
        const finalDefinitions = (item.allDefinitions && Array.isArray(item.allDefinitions) && item.allDefinitions.length > 0)
          ? item.allDefinitions
          : (enriched?.definitions && enriched.definitions.length > 0)
            ? enriched.definitions
            : [
                {
                  cefrLevel,
                  englishMeaning,
                  vietnameseMeaning: vietnameseDefinition,
                  examples: exampleSentence ? [exampleSentence] : [],
                },
              ]
        const allDefinitionsJson = JSON.stringify(finalDefinitions)
        const collocationsJson = JSON.stringify(item.collocations || item.collocationsJson || [])

        try {
          await db.insert(cards).values({
            id: cardId,
            deckId,
            term,
            vietnameseDefinition,
            englishMeaning,
            phonetic,
            partOfSpeech,
            exampleSentence,
            cefrLevel,
            audioUrl,
            imageUrl,
            allDefinitionsJson,
            collocationsJson,
          })
        } catch (insertError: any) {
          console.warn('Extended insert failed, attempting table migration / raw insert fallback:', insertError?.message)
          try {
            if (typeof (db as any).execute === 'function') {
              await (db as any).execute(
                `ALTER TABLE cards ADD COLUMN IF NOT EXISTS english_meaning TEXT;
                 ALTER TABLE cards ADD COLUMN IF NOT EXISTS cefr_level TEXT;
                 ALTER TABLE cards ADD COLUMN IF NOT EXISTS audio_url TEXT;
                 ALTER TABLE cards ADD COLUMN IF NOT EXISTS image_url TEXT;
                 ALTER TABLE cards ADD COLUMN IF NOT EXISTS all_definitions_json TEXT;`
              )
              await db.insert(cards).values({
                id: cardId,
                deckId,
                term,
                vietnameseDefinition,
                englishMeaning,
                phonetic,
                partOfSpeech,
                exampleSentence,
                cefrLevel,
                audioUrl,
                imageUrl,
                allDefinitionsJson,
                collocationsJson,
              })
            }
          } catch {
            if (typeof (db as any).execute === 'function') {
              await (db as any).execute(
                `INSERT INTO cards (id, deck_id, term, vietnamese_definition, phonetic, part_of_speech, example_sentence, collocations_json, audio_url, image_url, all_definitions_json) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                [cardId, deckId, term, vietnameseDefinition, phonetic, partOfSpeech, exampleSentence, collocationsJson, audioUrl, imageUrl, allDefinitionsJson]
              )
            }
          }
        }

        // Initialize SRS state
        try {
          await db.insert(cardSrsStates).values({
            id: `srs_${cardId}_${userId}`,
            userId,
            cardId,
            repetition: 0,
            interval: 0,
            easeFactor: 2.5,
            dueDate: nowIso,
          })
        } catch {}

        return {
          id: cardId,
          term,
          vietnameseDefinition,
          englishMeaning,
          phonetic,
          partOfSpeech,
          exampleSentence,
          cefrLevel,
          audioUrl,
          imageUrl,
          topic: null,
          allDefinitions: finalDefinitions,
        }
      })
    )

    return NextResponse.json({
      success: true,
      count: insertedCards.length,
      skippedCount: skippedCards.length,
      skippedTerms: skippedCards.map((s) => s.term),
      cards: insertedCards,
    })
  } catch (error) {
    console.error('Create card error:', error)
    return NextResponse.json({ error: 'Failed to create cards' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request
) {
  try {
    const { searchParams } = new URL(request.url)
    const cardId = searchParams.get('cardId')
    if (!cardId) {
      return NextResponse.json({ error: 'Card ID required' }, { status: 400 })
    }

    // Cascade clean all tables referencing this card
    try {
      await db.delete(cardTopics).where(eq(cardTopics.cardId, cardId))
    } catch {}
    try {
      await db.delete(cardMemoryState).where(eq(cardMemoryState.cardId, cardId))
    } catch {}
    try {
      await db.delete(cardReviewHistory).where(eq(cardReviewHistory.cardId, cardId))
    } catch {}
    try {
      await db.delete(cardDsrStates).where(eq(cardDsrStates.cardId, cardId))
    } catch {}
    try {
      await db.delete(cardSrsStates).where(eq(cardSrsStates.cardId, cardId))
    } catch {}
    try {
      await db.delete(reviewLogs).where(eq(reviewLogs.cardId, cardId))
    } catch {}
    await db.delete(cards).where(eq(cards.id, cardId))

    return NextResponse.json({ success: true, deletedId: cardId })
  } catch (error) {
    console.error('Delete card error:', error)
    return NextResponse.json({ error: 'Failed to delete card' }, { status: 500 })
  }
}
