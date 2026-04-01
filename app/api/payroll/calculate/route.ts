import { NextRequest, NextResponse } from 'next/server'
import { calculatePayrollEntry } from '@/lib/payrollCalculator'
import { requireActiveSubscription } from '@/lib/subscription'
import { getCompanyIdFromUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST /api/payroll/calculate
// Pure calculation endpoint — does NOT persist anything.
export async function POST(req: NextRequest) {
  try {
    const companyIdFromUser = await getCompanyIdFromUser()
    if (!companyIdFromUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { companyId, employeeId, periodStart, periodEnd, salaryGross, benefits, oneTimeAdjustments } = await req.json()

    if (companyId !== companyIdFromUser) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Subscription check
    try {
      await requireActiveSubscription(companyId)
    } catch (subErr: any) {
      return NextResponse.json({ error: subErr.message }, { status: 402 })
    }

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
