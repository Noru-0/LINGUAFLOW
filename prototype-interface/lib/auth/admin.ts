import { NextResponse } from 'next/server'
import { getSession, UserSessionPayload } from './session'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function verifyAdminSession(): Promise<{ isAdmin: boolean; user: UserSessionPayload | null }> {
  const session = await getSession()
  if (!session) return { isAdmin: false, user: null }

  try {
    const foundUsers = await db.select().from(users).where(eq(users.id, session.userId)).limit(1)
    const user = foundUsers[0]

    if (user && (user.role === 'admin' || user.email === 'admin@linguaflow.com')) {
      return { isAdmin: true, user: { ...session, role: 'admin' } }
    }
  } catch {
    // If DB check fails, fallback to session role check
    if (session.role === 'admin' || session.email === 'admin@linguaflow.com') {
      return { isAdmin: true, user: session }
    }
  }

  return { isAdmin: false, user: session }
}

export function unauthorizedAdminResponse() {
  return NextResponse.json(
    { success: false, error: 'Truy cập bị từ chối! Chức năng này chỉ dành riêng cho Quản trị viên (Admin).' },
    { status: 403 }
  )
}
