import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { collocations } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const list = await db.select().from(collocations).orderBy(desc(collocations.createdAt))
    return NextResponse.json({ success: true, collocations: list })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { headWord, tailChunk, fullPhrase, meaningVi, exampleSentence, cefrLevel, ieltsTopic } = body

    if (!headWord || !tailChunk || !fullPhrase || !meaningVi || !exampleSentence) {
      return NextResponse.json({ success: false, error: 'Thiếu trường dữ liệu bắt buộc!' }, { status: 400 })
    }

    const newId = `colloc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`

    await db.insert(collocations).values({
      id: newId,
      headWord,
      tailChunk,
      fullPhrase,
      meaningVi,
      exampleSentence,
      cefrLevel: cefrLevel || 'C1',
      ieltsTopic: ieltsTopic || 'General IELTS',
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, message: 'Đã thêm Collocation mới thành công!' })
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

    await db.delete(collocations).where(eq(collocations.id, id))
    return NextResponse.json({ success: true, message: 'Đã xóa Collocation thành công!' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
