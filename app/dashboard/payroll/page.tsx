import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PayrollList } from '@/components/payroll-list'

export default async function PayrollPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  const company = user.company

  if (!company) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Company Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You need to create a company before you can manage payroll.
            </p>
          </CardContent>
        </Card>
      </div>
    )
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
