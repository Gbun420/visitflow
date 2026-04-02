import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!user.company) {
    return NextResponse.json({ error: 'No company found' }, { status: 404 })
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    companyId: user.company.id,
    company: {
      id: user.company.id,
      name: user.company.name,
      status: user.company.status,
      subscriptionTier: user.company.subscriptionTier,
    },
  })
}
