import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { verifyAdminSession, unauthorizedAdminResponse } from '@/lib/auth/admin'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const { isAdmin } = await verifyAdminSession()
  if (!isAdmin) {
    return unauthorizedAdminResponse()
  }

  try {
    const body = await req.json()
    const { userId, role } = body

    if (!userId || !role || !['admin', 'user'].includes(role)) {
      return NextResponse.json({ success: false, error: 'Dữ liệu không hợp lệ!' }, { status: 400 })
    }

    await db.update(users).set({ role }).where(eq(users.id, userId))

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật phân quyền thành công: ${role.toUpperCase()}`,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
