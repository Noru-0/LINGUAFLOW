import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, userStreaks } from '@/lib/db/schema'
import { hashPassword } from '@/lib/auth/password'
import { createSession } from '@/lib/auth/session'
import { seedStarterDecksForUser } from '@/lib/db/seed'
import { eq } from 'drizzle-orm'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (existing.length > 0) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
    }

    const userId = `user_${Date.now()}`
    const passwordHash = await hashPassword(password)

    await db.insert(users).values({
      id: userId,
      email,
      passwordHash,
      name,
    })

    await db.insert(userStreaks).values({
      userId,
      currentStreak: 0,
      longestStreak: 0,
    })

    await seedStarterDecksForUser(userId)

    await createSession({
      userId,
      email,
      name,
    })

    return NextResponse.json({
      user: {
        id: userId,
        email,
        name,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
