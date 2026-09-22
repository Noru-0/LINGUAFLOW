import { NextResponse } from 'next/server'
import { db, fallbackToSqlite } from '@/lib/db'
import { speakingPrompts } from '@/lib/db/schema'
import { INITIAL_SPEAKING_PROMPTS } from '@/lib/db/initial_speaking_prompts'
import { safeJsonParse } from '@/lib/utils'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const partFilter = searchParams.get('part')

    let activeDb = db
    let rows: any[] = []

    try {
      if (partFilter) {
        rows = await activeDb
          .select()
          .from(speakingPrompts)
          .where(eq(speakingPrompts.part, parseInt(partFilter, 10)))
      } else {
        rows = await activeDb.select().from(speakingPrompts)
      }
    } catch {
      activeDb = fallbackToSqlite()
      if (partFilter) {
        rows = await activeDb
          .select()
          .from(speakingPrompts)
          .where(eq(speakingPrompts.part, parseInt(partFilter, 10)))
      } else {
        rows = await activeDb.select().from(speakingPrompts)
      }
    }

    if (rows && rows.length > 0) {
      const formatted = rows.map((r: any) => ({
        id: r.id,
        part: r.part,
        topic: r.topic,
        questionPrompt: r.questionPrompt || r.question_prompt,
        cuePoints: safeJsonParse(r.cuePointsJson || r.cue_points_json, []),
        modelResponse: r.modelResponse || r.model_response,
        suggestedVocabulary: safeJsonParse(r.suggestedVocabularyJson || r.suggested_vocabulary_json, []),
      }))
      return NextResponse.json({ prompts: formatted })
    }

    const fallbackFormatted = INITIAL_SPEAKING_PROMPTS.map((r) => ({
      id: r.id,
      part: r.part,
      topic: r.topic,
      questionPrompt: r.question_prompt,
      cuePoints: safeJsonParse(r.cue_points_json, []),
      modelResponse: r.model_response,
      suggestedVocabulary: safeJsonParse(r.suggested_vocabulary_json, []),
    }))

    return NextResponse.json({ prompts: fallbackFormatted })
  } catch (error) {
    console.error('Error fetching speaking prompts:', error)
    const fallbackFormatted = INITIAL_SPEAKING_PROMPTS.map((r) => ({
      id: r.id,
      part: r.part,
      topic: r.topic,
      questionPrompt: r.question_prompt,
      cuePoints: safeJsonParse(r.cue_points_json, []),
      modelResponse: r.model_response,
      suggestedVocabulary: safeJsonParse(r.suggested_vocabulary_json, []),
    }))
    return NextResponse.json({ prompts: fallbackFormatted })
  }
}
