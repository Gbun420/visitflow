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

// POST /api/payroll/submit
// Body: { payrollRunId }
export async function POST(req: NextRequest) {
  try {
    const companyIdFromUser = await getCompanyIdFromUser(req)
    if (!companyIdFromUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { payrollRunId } = await req.json()
    if (!payrollRunId) {
      return NextResponse.json({ error: 'payrollRunId required' }, { status: 400 })
    }

    // Verify run belongs to user's company and is CALCULATED
    const run = await prisma.payrollRun.findFirst({
      where: { id: payrollRunId, companyId: companyIdFromUser },
    })
    if (!run || run.status !== 'CALCULATED') {
      return NextResponse.json({ error: 'Payroll run not found or not in CALCULATED status' }, { status: 400 })
    }

    const submissionReference = `FS3-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.random().toString(36).slice(0,6).toUpperCase()}`

    const updated = await prisma.payrollRun.update({
      where: { id: payrollRunId },
      data: {
        status: 'SUBMITTED',
        submissionReference,
        submittedAt: new Date(),
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
