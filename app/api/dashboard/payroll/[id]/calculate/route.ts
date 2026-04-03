import { NextRequest, NextResponse } from 'next/server'
import { requireActiveSubscription } from '@/lib/subscription'
import { recalculatePayrollRun } from '@/lib/payroll/recalculate-run'
import { getEnhancedPrisma } from '@/lib/zenstack'

export const dynamic = 'force-dynamic'

// POST /api/dashboard/payroll/[id]/calculate
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  
  try {
    const prisma = await getEnhancedPrisma()
    
    // Fetch run to check status and company access (ZenStack handles company)
    const run = await prisma.payrollRun.findUnique({
      where: { id },
      select: { id: true, status: true, companyId: true },
    })

    if (!run) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (run.status === 'SUBMITTED') return NextResponse.json({ error: 'Already submitted' }, { status: 400 })

    const companyId = run.companyId

    try {
      await requireActiveSubscription(companyId)
    } catch (subErr: any) {
      return NextResponse.json({ error: subErr.message }, { status: 402 })
    }

    // We'll use a mocked calculation internal to recalculatePayrollRun for now
    // until we unify the AI calculation logic.
    await recalculatePayrollRun({
      prisma,
      companyId,
      runId: id,
      calculatePayrollEntry: async (args: any) => {
        const monthlyGross = Number(args.salaryGross)
        const taxRate = 0.20
        const tax = monthlyGross * taxRate
        const netPay = monthlyGross - tax
        
        return {
          grossPeriod: monthlyGross,
          tax,
          socialSecurityEmployee: 0,
          socialSecurityEmployer: 0,
          netPay,
          totalCost: monthlyGross,
          notes: "Recalculated with standard rules"
        }
      },
    })

    return NextResponse.json({ success: true, message: 'Recalculated' })
  } catch (error: any) {
    console.error(`Failed to recalculate payroll run ${id}:`, error)
    return NextResponse.json({ error: 'Unable to recalculate payroll right now' }, { status: 500 })
  }
}
