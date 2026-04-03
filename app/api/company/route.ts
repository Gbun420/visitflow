import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.company) {
      return NextResponse.json({ error: 'Company already exists' }, { status: 409 })
    }

    const body = await req.json()
    const name = String(body.name ?? '').trim()
    const registrationNumber = String(body.registrationNumber ?? '').trim()
    const taxId = String(body.taxId ?? '').trim()

    if (!name || !registrationNumber || !taxId) {
      return NextResponse.json(
        { error: 'name, registrationNumber, and taxId are required' },
        { status: 400 }
      )
    }

    const company = await prisma.company.create({
      data: {
        name,
        registrationNumber,
        taxId,
        userId: user.id,
      },
    })

    // CRITICAL: Update user's companyId for ZenStack multi-tenant isolation
    await prisma.user.update({
      where: { id: user.id },
      data: { companyId: company.id },
    })

    await prisma.auditEvent.create({
      data: {
        companyId: company.id,
        userId: user.id,
        action: 'company_created',
        resource: 'Company',
        resourceId: company.id,
        metadata: { name: company.name, registrationNumber: company.registrationNumber },
        ip: req.headers.get('x-forwarded-for') || '0.0.0.0',
        userAgent: req.headers.get('user-agent'),
      },
    })

    return NextResponse.json({
      company: {
        id: company.id,
        name: company.name,
        status: company.status,
      },
    })
  } catch (error: any) {
    console.error('Company create error:', error)
    return NextResponse.json({ error: 'Unable to create company right now' }, { status: 500 })
  }
}
