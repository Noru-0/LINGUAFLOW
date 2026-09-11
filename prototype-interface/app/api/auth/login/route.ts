import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { verifyPassword } from '@/lib/auth/password'
import { createSession } from '@/lib/auth/session'
import { seedDatabase } from '@/lib/db/seed'
import { eq } from 'drizzle-orm'

export async function POST(request: Request) {
  try {
    await seedDatabase()

    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const foundUsers = await db.select().from(users).where(eq(users.email, email)).limit(1)
    const user = foundUsers[0]

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const isMatch = await verifyPassword(password, user.passwordHash)
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
