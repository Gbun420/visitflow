import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculatePayrollEntry } from '@/lib/payrollCalculator'
import { requireActiveSubscription } from '@/lib/subscription'
import { getCompanyIdFromUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

function extractIdFromPath(req: NextRequest): string | null {
  const parts = req.nextUrl.pathname.split('/')
  return parts[parts.length - 1] || null
}

// GET /api/dashboard/payroll/[id] — returns run + entries with employee names
export async function GET(req: NextRequest) {
  const id = extractIdFromPath(req)
  if (!id) return NextResponse.json({ error: 'Missing payroll run ID' }, { status: 400 })
  const companyId = await getCompanyIdFromUser()
  if (!companyId) return NextResponse.json({ error: 'No company found' }, { status: 404 })

  const run = await prisma.payrollRun.findFirst({
    where: { id, companyId },
    include: { entries: { include: { employee: true } } },
  })
  if (!run) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ run, entries: run.entries })
}

// POST /api/dashboard/payroll/[id]/calculate — recalc all entries using AI
export async function POST(req: NextRequest) {
  const id = extractIdFromPath(req)
  if (!id) return NextResponse.json({ error: 'Missing payroll run ID' }, { status: 400 })
  const companyId = await getCompanyIdFromUser()

  if (!companyId) return NextResponse.json({ error: 'No company found' }, { status: 404 })

  try {
    await requireActiveSubscription(companyId)
  } catch (subErr: any) {
    return NextResponse.json({ error: subErr.message }, { status: 402 })
  }

  const run = await prisma.payrollRun.findFirst({
    where: { id, companyId },
    include: { entries: { include: { employee: true } } },
  })
  if (!run) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (run.status === 'SUBMITTED') return NextResponse.json({ error: 'Already submitted' }, { status: 400 })

  for (const entry of run.entries) {
    const emp = entry.employee
    try {
      const result = await calculatePayrollEntry({
        companyId: run.companyId,
        employeeId: emp.id,
        periodStart: run.periodStart,
        periodEnd: run.periodEnd,
        salaryGross: Number(emp.salaryGross),
        benefits: [], // not implemented yet
        oneTimeAdjustments: [],
      })

      await prisma.payrollEntry.update({
        where: { id: entry.id },
        data: {
          salaryGross: result.grossPeriod,
          tax: result.tax,
          socialSecurity: result.socialSecurityEmployee,
          netPay: result.netPay,
          totalCost: result.totalCost,
          notes: result.notes,
        },
      })

      await prisma.contribution.deleteMany({ where: { payrollEntryId: entry.id } })
      await prisma.contribution.createMany({
        data: [
          {
            payrollEntryId: entry.id,
            type: 'MSSS_EMPLOYEE',
            amount: result.socialSecurityEmployee,
            description: `Employee MSSS contribution`,
          },
          {
            payrollEntryId: entry.id,
            type: 'MSSS_EMPLOYER',
            amount: result.socialSecurityEmployer,
            description: `Employer MSSS contribution`,
          },
        ],
      })
    } catch (err: any) {
      console.error(`Failed to calculate entry ${entry.id}:`, err)
    }
  }

  await prisma.payrollRun.update({ where: { id }, data: { status: 'CALCULATED' } })
  return NextResponse.json({ success: true, message: 'Recalculated' })
}
