import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculatePayrollEntry } from '@/lib/payrollCalculator'
import { requireActiveSubscription } from '@/lib/subscription'
import { getCompanyIdFromUser } from '@/lib/auth'
import { recalculatePayrollRun } from '@/lib/payroll/recalculate-run'

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
    include: { entries: { include: { employee: { select: { firstName: true, lastName: true } } } } },
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
