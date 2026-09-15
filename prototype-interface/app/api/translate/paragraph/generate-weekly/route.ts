import { NextResponse } from 'next/server'
import { generateParagraphBatch } from '@/services/gemini-paragraph-generator'
import { db, fallbackToSqlite } from '@/lib/db'
import { translationParagraphs } from '@/lib/db/schema'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    let count = 25
    try {
      const body = await request.json()
      if (body?.count && typeof body.count === 'number') {
        count = Math.min(Math.max(body.count, 5), 30)
      }
    } catch {}

    console.log(`[Weekly Ingestion API] Triggering batch generation for ${count} new weekly exercises...`)
    const generated = await generateParagraphBatch(count)

    // Get current total count in DB
    let totalCount = 0
    try {
      const allParas = await db.select().from(translationParagraphs)
      totalCount = allParas.length
    } catch {
      const sqliteDb = fallbackToSqlite()
      const allParas = await sqliteDb.select().from(translationParagraphs)
      totalCount = allParas.length
    }

    return NextResponse.json({
      success: true,
      addedCount: generated.length,
      totalExercisesInDatabase: totalCount,
      message: `Đã tự động bổ sung thành công ${generated.length} bài tập mới vào kho dữ liệu. Tổng số bài tập hiện tại: ${totalCount}.`,
      generatedSample: generated.slice(0, 3).map((p: any) => ({
        subTopic: p.subTopic,
        targetBand: p.targetBand,
        themeCategory: p.themeCategory,
      })),
    })
  } catch (error: any) {
    console.error('Weekly paragraph generation error:', error)
    return NextResponse.json(
      { error: error?.message || 'Không thể tự động bổ sung bài tập mới.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    let totalCount = 0
    try {
      const allParas = await db.select().from(translationParagraphs)
      totalCount = allParas.length
    } catch {
      const sqliteDb = fallbackToSqlite()
      const allParas = await sqliteDb.select().from(translationParagraphs)
      totalCount = allParas.length
    }

    return NextResponse.json({
      totalExercises: totalCount,
      status: 'active',
      scheduleRecommendation: 'Tự động bổ sung 20-30 bài tập mới hàng tuần qua POST /api/translate/paragraph/generate-weekly',
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to query database status' }, { status: 500 })
  }
}
