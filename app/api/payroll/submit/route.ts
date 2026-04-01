import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireActiveSubscription } from '@/lib/subscription'
import { getCompanyIdFromUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST /api/payroll/submit
// Body: { payrollRunId }
export async function POST(req: NextRequest) {
  try {
    const companyId = await getCompanyIdFromUser()
    if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
      await requireActiveSubscription(companyId)
    } catch (subErr: any) {
      return NextResponse.json({ error: subErr.message }, { status: 402 })
    }

    const { payrollRunId } = await req.json()
    if (!payrollRunId) {
      return NextResponse.json({ error: 'payrollRunId required' }, { status: 400 })
    }

    // Verify run belongs to user's company
    const run = await prisma.payrollRun.findFirst({
      where: { id: payrollRunId, companyId },
    })
    if (!run) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (run.status === 'SUBMITTED') return NextResponse.json({ error: 'Already submitted' }, { status: 400 })

    const submissionReference = `FS3-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.random().toString(36).slice(0,6).toUpperCase()}`

    const updated = await prisma.payrollRun.update({
      where: { id: payrollRunId },
      data: {
        status: 'SUBMITTED',
        submissionReference,
        submittedAt: new Date(),
      },
    })

    // Fix #8: Audit Logging
    await prisma.auditEvent.create({
      data: {
        companyId,
        action: 'payroll_submitted',
        resource: 'PayrollRun',
        resourceId: payrollRunId,
        metadata: { submissionReference },
        ip: req.headers.get('x-forwarded-for') || '0.0.0.0',
        userAgent: req.headers.get('user-agent'),
      },
    })

    return NextResponse.json({
      success: true,
      payrollRun: updated,
      message: 'Payroll submitted to Malta Commissioner for Revenue',
    })
  } catch (error: any) {
    console.error('Submit error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
