import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import { calculatePayrollEntry } from '@/lib/payrollCalculator'

async function getCompanyIdFromUser(req: NextRequest): Promise<string | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: { headers: { cookie: req.headers.get('cookie') ?? '' } },
  })
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  const appUser = await prisma.user.findUnique({ where: { email: user.email } })
  if (!appUser || appUser.companies.length === 0) return null
  const company = appUser.companies[0]
  if (company.status !== 'ACTIVE') return null
  return company.id
}

// GET /api/dashboard/payroll/[id] — returns run + entries with employee names
export async function GET(req: NextRequest) {
  const { id } = req.params as { id: string }
  const companyId = await getCompanyIdFromUser(req)
  if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const run = await prisma.payrollRun.findFirst({
    where: { id, companyId },
    include: { entries: { include: { employee: true } } },
  })
  if (!run) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ run, entries: run.entries })
}

// POST /api/dashboard/payroll/[id]/calculate — recalc all entries using AI
export async function POST(req: NextRequest) {
  const { id } = req.params as { id: string }
  const companyId = await getCompanyIdFromUser(req)
  if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
        benefits: emp.benefits,
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
