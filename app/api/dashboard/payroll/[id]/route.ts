import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCompanyIdFromUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/dashboard/payroll/[id] — returns run + entries with employee names
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const companyId = await getCompanyIdFromUser()
  if (!companyId) return NextResponse.json({ error: 'No company found' }, { status: 404 })

  const run = await prisma.payrollRun.findFirst({
    where: { id, companyId },
    include: { entries: { include: { employee: { select: { firstName: true, lastName: true } } } } },
  })
  if (!run) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ run, entries: run.entries })
}
