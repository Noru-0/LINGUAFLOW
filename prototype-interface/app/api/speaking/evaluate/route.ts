import { NextResponse } from 'next/server'
import { db, fallbackToSqlite } from '@/lib/db'
import { speakingSubmissions } from '@/lib/db/schema'
import { evaluateSpeakingSubmission } from '@/services/gemini-speaking-evaluator'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { promptId, question, userTranscript, part = 2 } = body

    if (!userTranscript || !userTranscript.trim()) {
      return NextResponse.json({ error: 'userTranscript is required' }, { status: 400 })
    }

    // Call Gemini AI speaking evaluation engine
    const evaluation = await evaluateSpeakingSubmission(
      question || 'IELTS Speaking Practice',
      userTranscript,
      part
    )

    // Save to database
    try {
      const submissionId = `spk_sub_${Date.now()}`
      const userId = 'user_demo_alex_lee'

      let activeDb = db
      try {
        await activeDb.insert(speakingSubmissions).values({
          id: submissionId,
          userId,
          promptId: promptId || 'custom_prompt',
          transcribedText: userTranscript,
          estimatedBand: evaluation.estimatedBand,
          coherenceFeedback: evaluation.coherenceAndFluency,
          lexicalFeedback: JSON.stringify(evaluation.lexicalUpgrade),
          grammarFeedback: JSON.stringify(evaluation.grammarCorrection),
          improvedVersion: evaluation.improvedAnswer,
        })
      } catch {
        activeDb = fallbackToSqlite()
        await activeDb.insert(speakingSubmissions).values({
          id: submissionId,
          userId,
          promptId: promptId || 'custom_prompt',
          transcribedText: userTranscript,
          estimatedBand: evaluation.estimatedBand,
          coherenceFeedback: evaluation.coherenceAndFluency,
          lexicalFeedback: JSON.stringify(evaluation.lexicalUpgrade),
          grammarFeedback: JSON.stringify(evaluation.grammarCorrection),
          improvedVersion: evaluation.improvedAnswer,
        })
      }
    } catch (dbErr) {
      console.error('Error saving speaking submission to DB:', dbErr)
    }

    return NextResponse.json({
      success: true,
      evaluation,
    })
  } catch (error) {
    console.error('Error in /api/speaking/evaluate:', error)
    return NextResponse.json({ error: 'Failed to evaluate speaking submission' }, { status: 500 })
  }
}
