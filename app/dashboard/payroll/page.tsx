import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getAuthenticatedLandingPath } from '@/lib/navigation'
import { redirect } from 'next/navigation'
import { PayrollList } from '@/components/payroll-list'

export default async function PayrollPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const destination = getAuthenticatedLandingPath(user)
  if (destination !== '/dashboard') {
    redirect(destination)
  }

  const company = user.company
  if (!company) {
    redirect('/setup/company')
  }

  const runs = await prisma.payrollRun.findMany({
    where: { companyId: company.id },
    orderBy: { periodStart: 'desc' },
    include: { entries: true }
  })

  const formattedRuns = runs.map((run: any) => ({
    id: run.id,
    periodStart: run.periodStart,
    periodEnd: run.periodEnd,
    status: run.status,
    totalCost: run.entries.reduce((sum: number, entry: any) => sum + Number(entry.totalCost), 0)
  }))

  return (
    <PayrollList initialRuns={formattedRuns} />
  )
}
