import { NextResponse } from 'next/server'
import { generateSentenceBatch } from '@/services/gemini-sentence-generator'
import { db, fallbackToSqlite } from '@/lib/db'
import { translationPrompts } from '@/lib/db/schema'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    let count = 30
    try {
      const body = await request.json()
      if (body?.count && typeof body.count === 'number') {
        count = Math.min(Math.max(body.count, 5), 50)
      }
    } catch {}

    console.log(`[Weekly Sentence Ingestion API] Triggering generation for ${count} new sentences...`)
    const generated = await generateSentenceBatch(count)

    let totalCount = 0
    try {
      const allPrompts = await db.select().from(translationPrompts)
      totalCount = allPrompts.length
    } catch {
      const sqliteDb = fallbackToSqlite()
      const allPrompts = await sqliteDb.select().from(translationPrompts)
      totalCount = allPrompts.length
    }

    return NextResponse.json({
      success: true,
      addedCount: generated.length,
      totalSentencesInDatabase: totalCount,
      message: `Đã tự động bổ sung ${generated.length} câu bài tập mới vào kho. Tổng số câu hiện tại: ${totalCount}.`,
      sample: generated.slice(0, 3).map((p: any) => ({
        vietnameseText: p.vietnameseText,
        grammarCategory: p.grammarCategory,
        difficulty: p.difficulty,
      })),
    })
  } catch (error: any) {
    console.error('Weekly sentence generation error:', error)
    return NextResponse.json(
      { error: error?.message || 'Không thể tự động bổ sung câu bài tập mới.' },
      { status: 500 }
    )
  }
}
