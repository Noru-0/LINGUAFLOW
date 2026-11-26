import { db, fallbackToSqlite } from './index'
import { users, decks, cards, cardSrsStates, translationPrompts, translationParagraphs, userStreaks, collocations, speakingPrompts, topics } from './schema'
import { eq } from 'drizzle-orm'
import { hashPassword } from '../auth/password'
import { initial100Paragraphs } from './initial_100_paragraphs'
import { initial500Sentences } from './initial_500_sentences'
import { INITIAL_COLLOCATIONS } from './initial_collocations'
import { INITIAL_SPEAKING_PROMPTS } from './initial_speaking_prompts'
import { ALL_TAXONOMY_TOPICS } from './initial_topics'

export const sampleParagraphs = initial100Paragraphs
export const sampleSentences = initial500Sentences

let isSeededInMemory = false

async function ensureTopicsSeeded(targetDb: any) {
  try {
    const existingTopics = await targetDb.select({ id: topics.id }).from(topics).limit(1)
    if (existingTopics.length === 0) {
      let order = 0
      for (const major of ALL_TAXONOMY_TOPICS) {
        order++
        await targetDb.insert(topics).values({
          id: major.id,
          parentId: null,
          nameEn: major.nameEn,
          nameVi: major.nameVi,
          description: major.description,
          icon: major.icon,
          color: major.color,
          orderIndex: order,
        }).catch(() => {})
        for (const sub of major.subtopics) {
          order++
          await targetDb.insert(topics).values({
            id: sub.id,
            parentId: sub.parentId,
            nameEn: sub.nameEn,
            nameVi: sub.nameVi,
            description: sub.description,
            icon: sub.icon || 'Folder',
            color: major.color,
            orderIndex: order,
          }).catch(() => {})
        }
      }
    }
  } catch {}
}

export async function seedDatabase() {
  if (isSeededInMemory) return { status: 'already_seeded' }
  let activeDb = db

  try {
    const existingUsers = await activeDb.select({ id: users.id }).from(users).limit(1)
    if (existingUsers.length > 0) {
      await ensureTopicsSeeded(activeDb)
      isSeededInMemory = true
      return { status: 'already_seeded' }
    }
  } catch (err: any) {
    const isMissingTable = err?.message?.includes('relation "users" does not exist') || err?.message?.includes('no such table')
    if (isMissingTable) {
      console.info('[Supabase Setup Required] Table "users" does not exist in your Supabase database yet. Please run lib/db/supabase_schema.sql in your Supabase SQL Editor!')
    } else {
      console.warn('[Database Seed Info] Primary connection query error:', err?.message || err)
      if (err?.cause) console.warn('[Database Cause]:', err.cause)
    }

    activeDb = fallbackToSqlite()
    try {
      const existingUsers = await activeDb.select().from(users).limit(1)
      if (existingUsers.length > 0) {
        await ensureTopicsSeeded(activeDb)
        try {
          const existingParas = await activeDb.select().from(translationParagraphs)
          if (existingParas.length < 50) {
            const existingIds = new Set(existingParas.map((p: any) => p.id))
            const newParagraphs = initial100Paragraphs.filter((p) => !existingIds.has(p.id))
            if (newParagraphs.length > 0) {
              await activeDb.insert(translationParagraphs).values(newParagraphs)
            }
          }

          const existingPrompts = await activeDb.select().from(translationPrompts)
          if (existingPrompts.length < 50) {
            const existingIds = new Set(existingPrompts.map((p: any) => p.id))
            const newPrompts = initial500Sentences.filter((p) => !existingIds.has(p.id))
            if (newPrompts.length > 0) {
              await activeDb.insert(translationPrompts).values(newPrompts)
            }
          }
        } catch {}
        return { status: 'already_seeded' }
      }
    } catch {
      // Continue to seed
    }
  }

  const demoUserId = 'user_demo_alex_lee'
  const demoPasswordHash = await hashPassword('password123')

  try {
    // 1. Create Demo User
    await activeDb.insert(users).values({
      id: demoUserId,
      email: 'alex@linguaflow.internal',
      passwordHash: demoPasswordHash,
      name: 'Alex Lee',
      createdAt: new Date().toISOString(),
    })

    // Initialize streak
    await activeDb.insert(userStreaks).values({
      userId: demoUserId,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
    })

    // 2. Create Default Decks
    const deck1Id = 'deck_business_english'
    const deck2Id = 'deck_academic_vocabulary'
    const deck3Id = 'deck_everyday_conversations'

    await activeDb.insert(decks).values([
      {
        id: deck1Id,
        userId: demoUserId,
        title: 'Business English · Intermediate',
        description: 'Essential collocations, formal terms, and workplace vocabulary.',
        isPublic: true,
        createdAt: '2026-01-01T00:00:01.000Z',
      },
      {
        id: deck2Id,
        userId: demoUserId,
        title: 'Academic Word List (AWL)',
        description: 'High-yield words for academic writing, IELTS, and TOEFL.',
        isPublic: true,
        createdAt: '2026-01-01T00:00:02.000Z',
      },
      {
        id: deck3Id,
        userId: demoUserId,
        title: 'Everyday Conversations',
        description: 'Idiomatic expressions and common phrases.',
        isPublic: true,
        createdAt: '2026-01-01T00:00:03.000Z',
      },
    ])

    // 3. Create Sample Vocabulary Cards
    const sampleCards = [
      {
        id: 'card_accomplish',
        deckId: deck1Id,
        term: 'accomplish',
        vietnameseDefinition: 'Đạt được, hoàn thành một mục tiêu khó khăn',
        phonetic: '/əˈkʌm.plɪʃ/',
        partOfSpeech: 'verb',
        exampleSentence: 'She accomplished her research goal within 6 months.',
        collocationsJson: JSON.stringify(['accomplish a task', 'accomplish a mission', 'accomplish goals']),
      },
      {
        id: 'card_reliable',
        deckId: deck1Id,
        term: 'reliable',
        vietnameseDefinition: 'Đáng tin cậy, có thể dựa vào',
        phonetic: '/rɪˈlaɪ.ə.bəl/',
        partOfSpeech: 'adjective',
        exampleSentence: 'We need a reliable partner for this project.',
        collocationsJson: JSON.stringify(['highly reliable', 'reliable source', 'reliable service']),
      },
      {
        id: 'card_negotiate',
        deckId: deck1Id,
        term: 'negotiate',
        vietnameseDefinition: 'Đàm phán, thương lượng hợp đồng hoặc điều khoản',
        phonetic: '/nəˈɡəʊ.ʃi.eɪt/',
        partOfSpeech: 'verb',
        exampleSentence: 'The diplomats managed to negotiate a peace agreement.',
        collocationsJson: JSON.stringify(['negotiate a contract', 'negotiate terms', 'negotiate peace']),
      },
      {
        id: 'card_empirical',
        deckId: deck2Id,
        term: 'empirical',
        vietnameseDefinition: 'Dựa trên thực nghiệm, quan sát thực tế',
        phonetic: '/ɪmˈpɪr.ɪ.kəl/',
        partOfSpeech: 'adjective',
        exampleSentence: 'They gathered empirical evidence to support their research hypothesis.',
        collocationsJson: JSON.stringify(['empirical evidence', 'empirical study', 'empirical data']),
      },
      {
        id: 'card_coherent',
        deckId: deck2Id,
        term: 'coherent',
        vietnameseDefinition: 'Chặt chẽ, mạch lạc, có tính logic',
        phonetic: '/kəʊˈhɪə.rənt/',
        partOfSpeech: 'adjective',
        exampleSentence: 'The essay presented a coherent argument from start to finish.',
        collocationsJson: JSON.stringify(['coherent argument', 'coherent strategy', 'coherent system']),
      },
      {
        id: 'card_overcome',
        deckId: deck3Id,
        term: 'overcome',
        vietnameseDefinition: 'Vượt qua khó khăn, trở ngại',
        phonetic: '/ˌəʊ.vəˈkʌm/',
        partOfSpeech: 'verb',
        exampleSentence: 'She overcame many obstacles to achieve her dream.',
        collocationsJson: JSON.stringify(['overcome obstacles', 'overcome challenges', 'overcome fear']),
      },
    ]

    await activeDb.insert(cards).values(sampleCards)

    // Create default SRS states for demo cards
    const todayIso = new Date().toISOString().split('T')[0]
    for (const card of sampleCards) {
      await activeDb.insert(cardSrsStates).values({
        id: `srs_${card.id}`,
        userId: demoUserId,
        cardId: card.id,
        repetition: 0,
        interval: 0,
        easeFactor: 2.5,
        dueDate: todayIso,
      })
    }

    // 4. Create 500 Sentence Translation Prompts & 100 Paragraph Prompts
    await activeDb.insert(translationPrompts).values(initial500Sentences)
    await activeDb.insert(translationParagraphs).values(initial100Paragraphs)

    // 5. Seed Initial Topics & Subtopics
    try {
      const existingTopics = await activeDb.select({ id: topics.id }).from(topics).limit(1)
      if (existingTopics.length === 0) {
        let order = 0
        for (const major of ALL_TAXONOMY_TOPICS) {
          order++
          await activeDb.insert(topics).values({
            id: major.id,
            parentId: null,
            nameEn: major.nameEn,
            nameVi: major.nameVi,
            description: major.description,
            icon: major.icon,
            color: major.color,
            orderIndex: order,
          }).catch(() => {})
          for (const sub of major.subtopics) {
            order++
            await activeDb.insert(topics).values({
              id: sub.id,
              parentId: sub.parentId,
              nameEn: sub.nameEn,
              nameVi: sub.nameVi,
              description: sub.description,
              icon: sub.icon || 'Folder',
              color: major.color,
              orderIndex: order,
            }).catch(() => {})
          }
        }
      }
    } catch (topicErr) {
      console.warn('[Database Seed Warning] Error seeding topics:', topicErr)
    }
  } catch (insertErr) {
    console.warn('[Database Seed Warning] Non-critical error during initial data insert:', insertErr)
  }

  return { status: 'seeded', userCount: 1 }
}

export async function seedStarterDecksForUser(userId: string) {
  if (!userId) return
  let activeDb = db

  try {
    // Ensure user row exists to prevent FK violation
    const userExist = await activeDb.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1)
    if (userExist.length === 0) {
      await activeDb.insert(users).values({
        id: userId,
        email: `${userId}@user.local`,
        passwordHash: 'seeded_user_account',
        name: 'Learner',
        role: 'user',
        createdAt: new Date().toISOString(),
      }).catch(() => {})
    }

    const userDecks = await activeDb.select({ id: decks.id }).from(decks).where(eq(decks.userId, userId)).limit(1)
    if (userDecks.length > 0) return
  } catch {
    activeDb = fallbackToSqlite()
    try {
      const userExist = await activeDb.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1)
      if (userExist.length === 0) {
        await activeDb.insert(users).values({
          id: userId,
          email: `${userId}@user.local`,
          passwordHash: 'seeded_user_account',
          name: 'Learner',
          role: 'user',
          createdAt: new Date().toISOString(),
        }).catch(() => {})
      }

      const userDecks = await activeDb.select({ id: decks.id }).from(decks).where(eq(decks.userId, userId)).limit(1)
      if (userDecks.length > 0) return
    } catch {
      return
    }
  }

  const suffix = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
  const deck1Id = `deck_biz_${suffix}`
  const deck2Id = `deck_awl_${suffix}`
  const deck3Id = `deck_everyday_${suffix}`

  try {
    await activeDb.insert(decks).values([
      {
        id: deck1Id,
        userId,
        title: 'Business English · Intermediate',
        description: 'Essential collocations, formal terms, and workplace vocabulary.',
        isPublic: true,
        createdAt: '2026-01-01T00:00:01.000Z',
      },
      {
        id: deck2Id,
        userId,
        title: 'Academic Word List (AWL)',
        description: 'High-yield words for academic writing, IELTS, and TOEFL.',
        isPublic: true,
        createdAt: '2026-01-01T00:00:02.000Z',
      },
      {
        id: deck3Id,
        userId,
        title: 'Everyday Conversations',
        description: 'Idiomatic expressions and common phrases.',
        isPublic: true,
        createdAt: '2026-01-01T00:00:03.000Z',
      },
    ])

    const sampleCards = [
      {
        id: `card_acc_${suffix}`,
        deckId: deck1Id,
        term: 'accomplish',
        vietnameseDefinition: 'Đạt được, hoàn thành một mục tiêu khó khăn',
        phonetic: '/əˈkʌm.plɪʃ/',
        partOfSpeech: 'verb',
        exampleSentence: 'She accomplished her research goal within 6 months.',
        collocationsJson: JSON.stringify(['accomplish a task', 'accomplish a mission', 'accomplish goals']),
      },
      {
        id: `card_rel_${suffix}`,
        deckId: deck1Id,
        term: 'reliable',
        vietnameseDefinition: 'Đáng tin cậy, có thể dựa vào',
        phonetic: '/rɪˈlaɪ.ə.bəl/',
        partOfSpeech: 'adjective',
        exampleSentence: 'We need a reliable partner for this project.',
        collocationsJson: JSON.stringify(['highly reliable', 'reliable source', 'reliable service']),
      },
      {
        id: `card_neg_${suffix}`,
        deckId: deck1Id,
        term: 'negotiate',
        vietnameseDefinition: 'Đàm phán, thương lượng hợp đồng hoặc điều khoản',
        phonetic: '/nəˈɡəʊ.ʃi.eɪt/',
        partOfSpeech: 'verb',
        exampleSentence: 'The diplomats managed to negotiate a peace agreement.',
        collocationsJson: JSON.stringify(['negotiate a contract', 'negotiate terms', 'negotiate peace']),
      },
      {
        id: `card_emp_${suffix}`,
        deckId: deck2Id,
        term: 'empirical',
        vietnameseDefinition: 'Dựa trên thực nghiệm, quan sát thực tế',
        phonetic: '/ɪmˈpɪr.ɪ.kəl/',
        partOfSpeech: 'adjective',
        exampleSentence: 'They gathered empirical evidence to support their research hypothesis.',
        collocationsJson: JSON.stringify(['empirical evidence', 'empirical study', 'empirical data']),
      },
      {
        id: `card_coh_${suffix}`,
        deckId: deck2Id,
        term: 'coherent',
        vietnameseDefinition: 'Chặt chẽ, mạch lạc, có tính logic',
        phonetic: '/kəʊˈhɪə.rənt/',
        partOfSpeech: 'adjective',
        exampleSentence: 'The essay presented a coherent argument from start to finish.',
        collocationsJson: JSON.stringify(['coherent argument', 'coherent strategy', 'coherent system']),
      },
      {
        id: `card_ovc_${suffix}`,
        deckId: deck3Id,
        term: 'overcome',
        vietnameseDefinition: 'Vượt qua khó khăn, trở ngại',
        phonetic: '/ˌəʊ.vəˈkʌm/',
        partOfSpeech: 'verb',
        exampleSentence: 'She overcame many obstacles to achieve her dream.',
        collocationsJson: JSON.stringify(['overcome obstacles', 'overcome challenges', 'overcome fear']),
      },
    ]

    await activeDb.insert(cards).values(sampleCards)

    const todayIso = new Date().toISOString().split('T')[0]
    for (const card of sampleCards) {
      await activeDb.insert(cardSrsStates).values({
        id: `srs_${card.id}`,
        userId,
        cardId: card.id,
        repetition: 0,
        interval: 0,
        easeFactor: 2.5,
        dueDate: todayIso,
      })
    }
  } catch (err) {
    console.warn('[Database Seed Warning] Error seeding starter decks for user:', err)
  }
}

