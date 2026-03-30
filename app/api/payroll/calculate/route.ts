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

// POST /api/payroll/calculate
// Pure calculation endpoint — does NOT persist anything.
export async function POST(req: NextRequest) {
  try {
    const companyIdFromUser = await getCompanyIdFromUser(req)
    if (!companyIdFromUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { companyId, employeeId, periodStart, periodEnd, salaryGross, benefits, oneTimeAdjustments } = body

    if (companyId !== companyIdFromUser) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const result = await calculatePayrollEntry({
      companyId,
      employeeId,
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
      salaryGross: Number(salaryGross),
      benefits,
      oneTimeAdjustments,
    })

    return NextResponse.json({ success: true, ...result })
  } catch (error: any) {
    console.error('Payroll calculation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
