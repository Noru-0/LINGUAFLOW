import { NextResponse } from 'next/server'
import { db, fallbackToSqlite } from '@/lib/db'
import { collocations, collocationDsrState } from '@/lib/db/schema'
import { INITIAL_COLLOCATIONS } from '@/lib/db/initial_collocations'
import { DSREngine, DSRRating, DSRState } from '@/lib/srs/dsr'
import { eq, and } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    let activeDb = db
    let rows: any[] = []
    try {
      rows = await activeDb.select().from(collocations)
    } catch {
      activeDb = fallbackToSqlite()
      rows = await activeDb.select().from(collocations)
    }

    if (rows && rows.length > 0) {
      const formatted = rows.map((r: any) => ({
        id: r.id,
        head_word: r.headWord || r.head_word,
        tail_chunk: r.tailChunk || r.tail_chunk,
        full_phrase: r.fullPhrase || r.full_phrase,
        meaning_vi: r.meaningVi || r.meaning_vi,
        example_sentence: r.exampleSentence || r.example_sentence,
        cefr_level: r.cefrLevel || r.cefr_level,
        ielts_topic: r.ieltsTopic || r.ielts_topic,
      }))
      return NextResponse.json({ collocations: formatted })
    }

    return NextResponse.json({ collocations: INITIAL_COLLOCATIONS })
  } catch (error) {
    console.error('Error fetching collocations:', error)
    return NextResponse.json({ collocations: INITIAL_COLLOCATIONS })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { collocationId, rating = 3 } = body
    const dsrRating = (rating >= 1 && rating <= 4 ? rating : 3) as DSRRating

    if (!collocationId) {
      return NextResponse.json({ error: 'collocationId is required' }, { status: 400 })
    }

    const userId = 'user_demo_alex_lee'
    let activeDb = db

    let existing: any = null
    try {
      const res = await activeDb
        .select()
        .from(collocationDsrState)
        .where(and(eq(collocationDsrState.userId, userId), eq(collocationDsrState.collocationId, collocationId)))
      existing = res[0] || null
    } catch {
      activeDb = fallbackToSqlite()
      const res = await activeDb
        .select()
        .from(collocationDsrState)
        .where(and(eq(collocationDsrState.userId, userId), eq(collocationDsrState.collocationId, collocationId)))
      existing = res[0] || null
    }

    const now = new Date()
    let nextDSR: DSRState

    if (existing) {
      const currentDSR: DSRState = {
        difficulty: existing.difficulty,
        stability: existing.stability,
        reps: existing.reps,
        lapses: existing.lapses,
        lastReviewed: existing.lastReviewedAt ? new Date(existing.lastReviewedAt) : now,
        dueDate: existing.dueDate ? new Date(existing.dueDate) : now,
      }
      nextDSR = DSREngine.reviewCard(currentDSR, dsrRating, now)
    } else {
      nextDSR = DSREngine.initializeCard(dsrRating, now)
    }

    const stateId = existing ? existing.id : `colloc_dsr_${collocationId}`

    await activeDb
      .insert(collocationDsrState)
      .values({
        id: stateId,
        userId,
        collocationId,
        difficulty: nextDSR.difficulty,
        stability: nextDSR.stability,
        reps: nextDSR.reps,
        lapses: nextDSR.lapses,
        dueDate: nextDSR.dueDate.toISOString(),
        lastReviewedAt: now.toISOString(),
      })
      .onConflictDoUpdate({
        target: collocationDsrState.id,
        set: {
          difficulty: nextDSR.difficulty,
          stability: nextDSR.stability,
          reps: nextDSR.reps,
          lapses: nextDSR.lapses,
          dueDate: nextDSR.dueDate.toISOString(),
          lastReviewedAt: now.toISOString(),
        },
      })

    return NextResponse.json({
      success: true,
      newState: {
        difficulty: nextDSR.difficulty,
        stability: nextDSR.stability,
        reps: nextDSR.reps,
        dueDate: nextDSR.dueDate.toISOString(),
      },
    })
  } catch (error) {
    console.error('Error recording collocation grade:', error)
    return NextResponse.json({ error: 'Failed to record collocation grade' }, { status: 500 })
  }
}
