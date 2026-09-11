import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { translationPrompts } from '@/lib/db/schema'
import { seedDatabase } from '@/lib/db/seed'
import { safeJsonParse } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await seedDatabase()

    const prompts = await db.select().from(translationPrompts)
    const formattedPrompts = prompts.map((p: any) => ({
      id: p.id,
      vietnameseText: p.vietnameseText,
      canonicalAnswers: safeJsonParse(p.canonicalAnswersJson, []),
      grammarCategory: p.grammarCategory,
      grammarNotes: p.grammarNotes,
      difficulty: p.difficulty,
    }))

    return NextResponse.json({
      prompts: formattedPrompts,
      count: formattedPrompts.length,
    })
  } catch (error) {
    console.error('Fetch translation prompts error:', error)
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 })
  }
}
