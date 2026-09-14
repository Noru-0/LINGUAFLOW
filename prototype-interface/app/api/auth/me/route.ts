import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { seedDatabase } from '@/lib/db/seed'

export const dynamic = 'force-dynamic'

export async function GET() {
  await seedDatabase()
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ user: null, isDemo: false })
  }

  return NextResponse.json({ user: session, isDemo: false })
}
