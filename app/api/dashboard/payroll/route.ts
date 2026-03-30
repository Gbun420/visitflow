import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

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

// GET /api/dashboard/payroll?companyId=...
export async function GET(req: NextRequest) {
  const companyId = await getCompanyIdFromUser(req)
  if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const runs = await prisma.payrollRun.findMany({
    where: { companyId },
    orderBy: { periodStart: 'desc' },
  })
  const runsWithTotals = await Promise.all(runs.map(async (run) => {
    const entries = await prisma.payrollEntry.findMany({ where: { payrollRunId: run.id } })
    const totalCost = entries.reduce((sum, e) => sum + Number(e.totalCost), 0)
    return { ...run, totalCost }
  }))
  return NextResponse.json(runsWithTotals)
}

// POST /api/dashboard/payroll
// Creates a new payroll run (draft) with empty entries for all active employees
export async function POST(req: NextRequest) {
  try {
    const companyId = await getCompanyIdFromUser(req)
    if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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

    // Create placeholder entries for all active employees
    const employees = await prisma.employee.findMany({ where: { companyId } })
    for (const emp of employees) {
      const grossPeriod = Number(emp.salaryGross) / 12 // simplistic; later will be recalculated
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

    return NextResponse.json(run)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
