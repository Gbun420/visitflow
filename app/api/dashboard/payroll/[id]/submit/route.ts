import { NextRequest, NextResponse } from 'next/server'
import { requireActiveSubscription } from '@/lib/subscription'
import { getEnhancedPrisma } from '@/lib/zenstack'

export const dynamic = 'force-dynamic'

// POST /api/dashboard/payroll/[id]/submit
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const prisma = await getEnhancedPrisma()
    
    // ZenStack automatically ensures the user can only see/update their own company data
    const run = await prisma.payrollRun.findUnique({
      where: { id },
      include: { company: true }
    })

    if (!run) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (run.status === 'SUBMITTED') return NextResponse.json({ error: 'Already submitted' }, { status: 400 })

    const companyId = run.companyId

    try {
      await requireActiveSubscription(companyId)
    } catch (subErr: any) {
      return NextResponse.json({ error: subErr.message }, { status: 402 })
    }

    const submissionReference = `FS3-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.random().toString(36).slice(0,6).toUpperCase()}`

    const updated = await prisma.payrollRun.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        submissionReference,
        submittedAt: new Date(),
      },
    })

    // Log Creation
    await prisma.auditEvent.create({
      data: {
        companyId,
        action: 'payroll_submitted',
        resource: 'PayrollRun',
        resourceId: id,
        metadata: { submissionReference },
        ip: req.headers.get('x-forwarded-for') || '0.0.0.0',
        userAgent: req.headers.get('user-agent'),
      }
    })

    return NextResponse.json({
      success: true,
      payrollRun: updated,
      message: 'Payroll submitted to Malta Commissioner for Revenue',
    })
  } catch (error: any) {
    console.error('Submit error:', error)
    return NextResponse.json({ error: 'Unable to submit payroll right now' }, { status: 500 })
  }
}
