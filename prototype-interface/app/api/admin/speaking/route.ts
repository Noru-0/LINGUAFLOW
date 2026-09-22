import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { speakingPrompts } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const list = await db.select().from(speakingPrompts).orderBy(desc(speakingPrompts.createdAt))
    return NextResponse.json({ success: true, prompts: list })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { part, topic, questionPrompt, cuePoints, modelResponse, suggestedVocabulary } = body

    if (!part || !topic || !questionPrompt) {
      return NextResponse.json({ success: false, error: 'Thiếu trường dữ liệu bắt buộc!' }, { status: 400 })
    }

    const newId = `spk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`

    await db.insert(speakingPrompts).values({
      id: newId,
      part: parseInt(part, 10),
      topic,
      questionPrompt,
      cuePointsJson: typeof cuePoints === 'string' ? cuePoints : JSON.stringify(cuePoints || []),
      modelResponse: modelResponse || '',
      suggestedVocabularyJson: typeof suggestedVocabulary === 'string' ? suggestedVocabulary : JSON.stringify(suggestedVocabulary || []),
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, message: 'Đã thêm bài Speaking thành công!' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu ID' }, { status: 400 })
    }

    await db.delete(speakingPrompts).where(eq(speakingPrompts.id, id))
    return NextResponse.json({ success: true, message: 'Đã xóa bài Speaking thành công!' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
