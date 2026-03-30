import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: {
      headers: {
        cookie: req.headers.get('cookie') ?? '',
      },
    },
  })

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const appUser = await prisma.user.findUnique({ where: { email: user.email } })
  if (!appUser || appUser.companies.length === 0) {
    return NextResponse.json({ employeeCount: 0, payrollRunCount: 0, monthlyCost: 0, recentRuns: [] })
  }

  const company = appUser.companies[0]
  if (company.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'Subscription inactive' }, { status: 403 })
  }

  const employeeCount = await prisma.employee.count({ where: { companyId: company.id } })
  const payrollRuns = await prisma.payrollRun.findMany({
    where: { companyId: company.id },
    orderBy: { periodStart: 'desc' },
    take: 5,
    include: { entries: { include: { employee: true } } },
  })
  const payrollRunCount = await prisma.payrollRun.count({ where: { companyId: company.id } })
  const totalMonthlyCost = await prisma.payrollEntry.aggregate({
    where: { payrollRun: { companyId: company.id } },
    _sum: { totalCost: true },
  })
  const recentRuns = payrollRuns.map(run => ({
    id: run.id,
    periodStart: run.periodStart,
    periodEnd: run.periodEnd,
    status: run.status,
    totalCost: run.entries.reduce((sum, entry) => sum + Number(entry.totalCost), 0),
  }))

  return NextResponse.json({
    employeeCount,
    payrollRunCount,
    monthlyCost: totalMonthlyCost._sum.totalCost ? (Number(totalMonthlyCost._sum.totalCost) / 12).toFixed(2) : 0,
    recentRuns,
  })
}
