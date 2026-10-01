import { NextResponse } from 'next/server'
import { db, fallbackToSqlite } from '@/lib/db'
import { collocations, collocationDsrState } from '@/lib/db/schema'
import { INITIAL_COLLOCATIONS } from '@/lib/db/initial_collocations'
import { DSREngine, DSRRating, DSRState } from '@/lib/srs/dsr'
import { getSession } from '@/lib/auth/session'
import { eq, and } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSession()
    const userId = session?.userId || 'user_demo_alex_lee'

    let activeDb = db
    let rows: any[] = []
    let userDsrRows: any[] = []

    try {
      rows = await activeDb.select().from(collocations)
      userDsrRows = await activeDb
        .select()
        .from(collocationDsrState)
        .where(eq(collocationDsrState.userId, userId))
    } catch {
      activeDb = fallbackToSqlite()
      try {
        rows = await activeDb.select().from(collocations)
        userDsrRows = await activeDb
          .select()
          .from(collocationDsrState)
          .where(eq(collocationDsrState.userId, userId))
      } catch {
        rows = []
        userDsrRows = []
      }
    }

    const dsrMap = new Map<string, any>(userDsrRows.map((r: any) => [r.collocationId || r.collocation_id, r]))
    const now = new Date()

    const rawList = rows && rows.length > 0 ? rows : INITIAL_COLLOCATIONS

    const formatted = rawList.map((r: any) => {
      let distractors: string[] = []
      try {
        if (r.distractorsJson) distractors = JSON.parse(r.distractorsJson)
        else if (r.distractors_json) distractors = JSON.parse(r.distractors_json)
        else if (Array.isArray(r.distractors)) distractors = r.distractors
      } catch {}

      const id = r.id
      const dsr = dsrMap.get(id)

      const reps = dsr?.reps || 0
      const stability = dsr?.stability || 0
      const isLearned = reps > 0
      const isMastered = reps >= 3 || stability >= 21
      const isDue = dsr?.dueDate ? new Date(dsr.dueDate) <= now : false

      return {
        id,
        category: r.category || r.ieltsTopic || r.ielts_topic || 'General',
        head_word: r.headWord || r.head_word,
        tail_chunk: r.tailChunk || r.tail_chunk,
        full_phrase: r.fullPhrase || r.full_phrase,
        meaning_vi: r.meaningVi || r.meaning_vi,
        example_sentence: r.exampleSentence || r.example_sentence,
        distractors,
        cefr_level: r.cefrLevel || r.cefr_level || 'B2',
        ielts_topic: r.ieltsTopic || r.ielts_topic || 'Academic',
        user_progress: dsr
          ? {
              reps,
              stability,
              difficulty: dsr.difficulty || 0.3,
              dueDate: dsr.dueDate || dsr.due_date,
              lastReviewedAt: dsr.lastReviewedAt || dsr.last_reviewed_at,
              isLearned,
              isMastered,
              isDue,
            }
          : null,
      }
    })

    const total = formatted.length
    const learned = formatted.filter((f) => f.user_progress?.isLearned).length
    const mastered = formatted.filter((f) => f.user_progress?.isMastered).length
    const dueToday = formatted.filter((f) => f.user_progress?.isDue).length
    const progressPercent = total > 0 ? Math.round((learned / total) * 100) : 0

    return NextResponse.json({
      collocations: formatted,
      stats: {
        total,
        learned,
        mastered,
        dueToday,
        progressPercent,
      },
    })
  } catch (error) {
    console.error('Error fetching collocations:', error)
    return NextResponse.json({
      collocations: INITIAL_COLLOCATIONS,
      stats: {
        total: INITIAL_COLLOCATIONS.length,
        learned: 0,
        mastered: 0,
        dueToday: 0,
        progressPercent: 0,
      },
    })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    const userId = session?.userId || 'user_demo_alex_lee'

    const body = await req.json()
    const { collocationId, rating = 3 } = body
    const dsrRating = (rating >= 1 && rating <= 4 ? rating : 3) as DSRRating

    if (!collocationId) {
      return NextResponse.json({ error: 'collocationId is required' }, { status: 400 })
    }

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

    const stateId = existing ? existing.id : `colloc_dsr_${collocationId}_${userId}`

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
        reps: nextDSR.reps,
        stability: nextDSR.stability,
        difficulty: nextDSR.difficulty,
        dueDate: nextDSR.dueDate.toISOString(),
        isLearned: true,
        isMastered: nextDSR.reps >= 3 || nextDSR.stability >= 21,
      },
    })
  } catch (error) {
    console.error('Error recording collocation grade:', error)
    return NextResponse.json({ error: 'Failed to record collocation grade' }, { status: 500 })
  }
}
