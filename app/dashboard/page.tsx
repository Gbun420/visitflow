import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getAuthenticatedLandingPath } from '@/lib/navigation'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Link from 'next/link'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  const destination = getAuthenticatedLandingPath(user)
  if (destination !== '/dashboard') {
    redirect(destination)
  }

  const company = user.company
  if (!company) {
    redirect('/setup/company')
  }

  const companyId = company.id

  const employeeCount = await prisma.employee.count({ where: { companyId } })
  const payrollRuns = await prisma.payrollRun.findMany({
    where: { companyId },
    orderBy: { periodStart: 'desc' },
    take: 5,
    include: { entries: true },
  })
  const payrollRunCount = await prisma.payrollRun.count({ where: { companyId } })
  
  const totalCostAgg = await prisma.payrollEntry.aggregate({
    where: { payrollRun: { companyId } },
    _sum: { totalCost: true },
  })
  const totalCostValue = totalCostAgg._sum.totalCost ? Number(totalCostAgg._sum.totalCost) : 0
  const monthlyCost = (totalCostValue / 12).toFixed(2)

  const recentRuns = payrollRuns.map((run: any) => ({
    id: run.id,
    periodStart: run.periodStart,
    periodEnd: run.periodEnd,
    status: run.status,
    totalCost: run.entries.reduce((sum: number, entry: any) => sum + Number(entry.totalCost), 0),
  }))

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Manage payroll for {company.name}</p>
        </div>
        <div className="space-x-2">
          <Link href="/dashboard/employees/new"><Button>Add Employee</Button></Link>
          <Link href="/dashboard/payroll"><Button variant="outline">Create Payroll</Button></Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{employeeCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Payroll Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{payrollRunCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Avg Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">€{Number(monthlyCost).toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {recentRuns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Payroll Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRuns.map((run: any) => (
                  <TableRow key={run.id}>
                    <TableCell>
                      {new Date(run.periodStart).toLocaleDateString()} - {new Date(run.periodEnd).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${run.status === 'SUBMITTED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {run.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">€{run.totalCost.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
