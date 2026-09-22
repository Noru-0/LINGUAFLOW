import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { verifyAdminSession, unauthorizedAdminResponse } from '@/lib/auth/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { isAdmin } = await verifyAdminSession()
  if (!isAdmin) return unauthorizedAdminResponse()
  try {
    const userList = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))

    return NextResponse.json({ success: true, users: userList })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const { isAdmin } = await verifyAdminSession()
  if (!isAdmin) return unauthorizedAdminResponse()
  try {
    const body = await req.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'Thiếu thông tin người dùng!' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

    await db.insert(users).values({
      id: userId,
      name,
      email,
      passwordHash: hashedPassword,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, message: 'Đã tạo tài khoản người dùng thành công!' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const { isAdmin } = await verifyAdminSession()
  if (!isAdmin) return unauthorizedAdminResponse()
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu User ID' }, { status: 400 })
    }

    await db.delete(users).where(eq(users.id, id))

    return NextResponse.json({ success: true, message: 'Đã xóa người dùng thành công!' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
