import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { seedDatabase } from '@/lib/db/seed'

export const dynamic = 'force-dynamic'

export async function GET() {
  await seedDatabase()
  const session = await getSession()

  // Default to demo user if no cookie present during dev/testing
  if (!session) {
    return NextResponse.json({
      user: {
        userId: 'user_demo_alex_lee',
        email: 'alex@linguaflow.internal',
        name: 'Alex Lee',
      },
      isDemo: true,
    })
  }

  return NextResponse.json({ user: session, isDemo: false })
}
