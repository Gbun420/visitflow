import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCompanyIdFromUser } from '@/lib/auth'
import { requireActiveSubscription } from '@/lib/subscription'

export const dynamic = 'force-dynamic'

// GET /api/dashboard/payroll
export async function GET() {
  const companyId = await getCompanyIdFromUser()

  if (!companyId) return NextResponse.json({ error: 'No company found' }, { status: 404 })

  const runs = await prisma.payrollRun.findMany({
    where: { companyId },
    orderBy: { periodStart: 'desc' },
    include: { entries: true },
  })
  const runsWithTotals = runs.map((run: any) => {
    const totalCost = run.entries.reduce((sum: number, e: any) => sum + Number(e.totalCost), 0)
    return { ...run, totalCost }
  })
  return NextResponse.json(runsWithTotals)
}

// POST /api/dashboard/payroll
// Creates a new payroll run (draft) with empty entries for all employees
export async function POST(req: NextRequest) {
  try {
    const companyId = await getCompanyIdFromUser()
    if (!companyId) return NextResponse.json({ error: 'No company found' }, { status: 404 })

    // Subscription check
    try {
      await requireActiveSubscription(companyId)
    } catch (subErr: any) {
      return NextResponse.json({ error: subErr.message }, { status: 402 })
    }

    const { periodStart, periodEnd } = await req.json()
    if (!periodStart || !periodEnd) {
      return NextResponse.json({ error: 'Missing periodStart or periodEnd' }, { status: 400 })
    }

    const run = await prisma.payrollRun.create({
      data: {
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        status: 'DRAFT',
        companyId,
      },
    })

    // Create placeholder entries for all employees
    const employees = await prisma.employee.findMany({ where: { companyId } })
    for (const emp of employees) {
      const grossPeriod = Number(emp.salaryGross) / 12
      await prisma.payrollEntry.create({
        data: {
          payrollRunId: run.id,
          employeeId: emp.id,
          salaryGross: grossPeriod,
          tax: 0,
          socialSecurity: 0,
          netPay: 0,
          totalCost: 0,
        },
      })
    }

    // Fix #8: Audit Logging
    await prisma.auditEvent.create({
      data: {
        companyId,
        action: 'payroll_created',
        resource: 'PayrollRun',
        resourceId: run.id,
        metadata: { periodStart, periodEnd },
        ip: req.headers.get('x-forwarded-for') || '0.0.0.0',
        userAgent: req.headers.get('user-agent'),
      },
    })

    return NextResponse.json(run)
  } catch (error: any) {
    console.error('Payroll list/create error:', error)
    return NextResponse.json({ error: 'Unable to load payroll right now' }, { status: 500 })
  }
}
