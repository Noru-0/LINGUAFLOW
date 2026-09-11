import { db, fallbackToSqlite } from './index'
import { users, decks, cards, cardSrsStates, translationPrompts, userStreaks } from './schema'
import { hashPassword } from '../auth/password'

export async function seedDatabase() {
  let activeDb = db

  try {
    const existingUsers = await activeDb.select().from(users).limit(1)
    if (existingUsers.length > 0) {
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
      },
      {
        id: deck2Id,
        userId: demoUserId,
        title: 'Academic Word List (AWL)',
        description: 'High-yield words for academic writing, IELTS, and TOEFL.',
        isPublic: true,
      },
      {
        id: deck3Id,
        userId: demoUserId,
        title: 'Everyday Conversations',
        description: 'Idiomatic expressions and common phrases.',
        isPublic: true,
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
        exampleSentence: 'He is a reliable team member who always delivers on time.',
        collocationsJson: JSON.stringify(['reliable partner', 'reliable source of information']),
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

    // Initialize SRS state for each card for the demo user
    const now = new Date()
    const todayIso = now.toISOString()

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

    // 4. Create Grammar Translation Prompts
    const prompts = [
      {
        id: 'prompt_inversion_1',
        vietnameseText: 'Chỉ khi cô ấy đến, chúng tôi mới bắt đầu cuộc họp.',
        canonicalAnswersJson: JSON.stringify([
          'Only when she arrived did we start the meeting',
          'Only when she arrived did we begin the meeting',
          'Only when she came did we start the meeting',
        ]),
        grammarCategory: 'Inversion',
        grammarNotes: 'After "only when", use inverted structure: auxiliary + subject + verb (did we start).',
        difficulty: 'intermediate',
      },
      {
        id: 'prompt_conditional_1',
        vietnameseText: 'Nếu tôi biết trước điều đó, tôi đã không đưa ra quyết định sai lầm.',
        canonicalAnswersJson: JSON.stringify([
          'If I had known that beforehand, I would not have made a mistake',
          'If I had known that in advance, I would not have made the wrong decision',
          'Had I known that in advance, I would not have made the wrong decision',
        ]),
        grammarCategory: 'Conditionals (Third)',
        grammarNotes: 'Third conditional requires: If + past perfect (had known), main clause: would have + V3/ed.',
        difficulty: 'advanced',
      },
      {
        id: 'prompt_inversion_2',
        vietnameseText: 'Ngay khi anh ấy vừa bước vào phòng, đèn phụt tắt.',
        canonicalAnswersJson: JSON.stringify([
          'No sooner had he entered the room than the lights went out',
          'Hardly had he entered the room when the lights went out',
          'Scarcely had he entered the room when the lights went out',
        ]),
        grammarCategory: 'Inversion',
        grammarNotes: 'No sooner + had + S + V3/ed + than + S + V2/ed. Note that "No sooner" pairs with "than".',
        difficulty: 'advanced',
      },
      {
        id: 'prompt_gerund_1',
        vietnameseText: 'Cô ấy quen với việc dậy sớm vào buổi sáng.',
        canonicalAnswersJson: JSON.stringify([
          'She is used to waking up early in the morning',
          'She is accustomed to waking up early in the morning',
          'She is used to getting up early in the morning',
        ]),
        grammarCategory: 'Gerunds & Infinitives',
        grammarNotes: 'Be used to + V-ing (gerund) denotes habituation, unlike "used to + infinitive" (past habit).',
        difficulty: 'intermediate',
      },
      {
        id: 'prompt_subjunctive_1',
        vietnameseText: 'Anh ấy đề nghị chúng tôi nên hoãn cuộc họp lại.',
        canonicalAnswersJson: JSON.stringify([
          'He suggested that we postpone the meeting',
          'He suggested that we should postpone the meeting',
          'He proposed that we postpone the meeting',
        ]),
        grammarCategory: 'Subjunctive Mood',
        grammarNotes: 'Suggest + that + clause uses base verb (postpone) in subjunctive mood.',
        difficulty: 'intermediate',
      },
    ]

    await activeDb.insert(translationPrompts).values(prompts)
  } catch (insertErr) {
    console.warn('[Database Seed Warning] Non-critical error during initial data insert:', insertErr)
  }

  return { status: 'seeded', userCount: 1 }
}
