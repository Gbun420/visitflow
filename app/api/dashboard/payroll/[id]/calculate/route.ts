import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculatePayrollEntry } from '@/lib/payrollCalculator'
import { requireActiveSubscription } from '@/lib/subscription'
import { getCompanyIdFromUser } from '@/lib/auth'
import { recalculatePayrollRun } from '@/lib/payroll/recalculate-run'

export const dynamic = 'force-dynamic'

// POST /api/dashboard/payroll/[id]/calculate
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const companyId = await getCompanyIdFromUser()

  if (!companyId) return NextResponse.json({ error: 'No company found' }, { status: 404 })

  try {
    await requireActiveSubscription(companyId)
  } catch (subErr: any) {
    return NextResponse.json({ error: subErr.message }, { status: 402 })
  }

  const run = await prisma.payrollRun.findFirst({
    where: { id, companyId },
    select: { status: true },
  })
  if (!run) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (run.status === 'SUBMITTED') return NextResponse.json({ error: 'Already submitted' }, { status: 400 })

  try {
    await recalculatePayrollRun({
      prisma,
      companyId,
      runId: id,
      calculatePayrollEntry,
    })
  } catch (error: any) {
    console.error(`Failed to recalculate payroll run ${id}:`, error)
    return NextResponse.json({ error: 'Unable to recalculate payroll right now' }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: 'Recalculated' })
}
