import { NextResponse } from 'next/server'
import { db, fallbackToSqlite } from '@/lib/db'
import { translationParagraphs, translationParagraphSubmissions } from '@/lib/db/schema'
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
    const levelParam = searchParams.get('level') || searchParams.get('targetBand')

    let activeDb = db
    let paragraphs = []
    let completedParagraphIds: string[] = []

    const userCondition =
      userId === 'user_demo_alex_lee'
        ? eq(translationParagraphSubmissions.userId, userId)
        : or(
            eq(translationParagraphSubmissions.userId, userId),
            eq(translationParagraphSubmissions.userId, 'user_demo_alex_lee')
          )

    try {
      paragraphs = await activeDb.select().from(translationParagraphs).orderBy(asc(translationParagraphs.createdAt))
      const userSubs = await activeDb
        .select({ paragraphId: translationParagraphSubmissions.paragraphId })
        .from(translationParagraphSubmissions)
        .where(userCondition)
      completedParagraphIds = Array.from(new Set(userSubs.map((s: any) => s.paragraphId)))
    } catch (err: any) {
      console.warn('PostgreSQL translationParagraphs query failed, falling back to local SQLite:', err?.message || err)
      activeDb = fallbackToSqlite()
      await seedDatabase()
      paragraphs = await activeDb.select().from(translationParagraphs).orderBy(asc(translationParagraphs.createdAt))
      const userSubs = await activeDb
        .select({ paragraphId: translationParagraphSubmissions.paragraphId })
        .from(translationParagraphSubmissions)
        .where(userCondition)
      completedParagraphIds = Array.from(new Set(userSubs.map((s: any) => s.paragraphId)))
    }

    if (levelParam && levelParam.toUpperCase() !== 'ALL') {
      paragraphs = paragraphs.filter((p: any) => (p.targetBand || '').toUpperCase() === levelParam.toUpperCase())
    }

    const formatted = paragraphs.map((p: any) => ({
      id: p.id,
      themeCategory: p.themeCategory,
      subTopic: p.subTopic,
      targetBand: p.targetBand,
      vietnameseParagraph: p.vietnameseParagraph,
      targetCollocations: safeJsonParse(p.targetCollocationsJson, []),
      modelTranslation: p.modelTranslation,
      grammarBreakdown: p.grammarBreakdown,
      createdAt: p.createdAt,
    }))

    return NextResponse.json({
      paragraphs: formatted,
      completedParagraphIds,
      count: formatted.length,
    })
  } catch (error) {
    console.error('Fetch translation paragraph prompts error:', error)
    return NextResponse.json({ error: 'Failed to fetch paragraph prompts' }, { status: 500 })
  }
}
