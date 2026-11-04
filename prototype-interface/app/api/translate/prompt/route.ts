import { NextResponse } from 'next/server'
import { db, fallbackToSqlite } from '@/lib/db'
import { translationPrompts, translationLogs } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { seedDatabase } from '@/lib/db/seed'
import { safeJsonParse } from '@/lib/utils'
import { eq, or, asc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    await seedDatabase()
    const session = await getSession()
    const userId = session?.userId || 'user_demo_alex_lee'

    const { searchParams } = new URL(request.url)
    const levelParam = searchParams.get('level') || searchParams.get('difficulty')

    let activeDb = db
    let prompts = []
    let completedPromptIds: string[] = []

    const userCondition =
      userId === 'user_demo_alex_lee'
        ? eq(translationLogs.userId, userId)
        : or(eq(translationLogs.userId, userId), eq(translationLogs.userId, 'user_demo_alex_lee'))

    try {
      prompts = await activeDb.select().from(translationPrompts).orderBy(asc(translationPrompts.id))
      const userLogs = await activeDb
        .select({ promptId: translationLogs.promptId })
        .from(translationLogs)
        .where(userCondition)
      completedPromptIds = Array.from(new Set(userLogs.map((l: any) => l.promptId)))
    } catch {
      activeDb = fallbackToSqlite()
      prompts = await activeDb.select().from(translationPrompts).orderBy(asc(translationPrompts.id))
      const userLogs = await activeDb
        .select({ promptId: translationLogs.promptId })
        .from(translationLogs)
        .where(userCondition)
      completedPromptIds = Array.from(new Set(userLogs.map((l: any) => l.promptId)))
    }

    if (levelParam && levelParam.toUpperCase() !== 'ALL') {
      prompts = prompts.filter((p: any) => (p.difficulty || '').toUpperCase() === levelParam.toUpperCase())
    }

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
      completedPromptIds,
      count: formattedPrompts.length,
    })
  } catch (error) {
    console.error('Fetch translation prompts error:', error)
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 })
  }
}
