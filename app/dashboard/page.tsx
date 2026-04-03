import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getAuthenticatedLandingPath } from '@/lib/navigation'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Link from 'next/link'
import { RunPayrollButton } from '@/components/run-payroll-button'
import { PayrollChart } from '@/components/payroll-chart'
import { format, subMonths, startOfMonth } from 'date-fns'

export default async function DashboardPage() {
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

  const companyId = company.id

  // Stats for cards
  const employeeCount = await prisma.employee.count({ where: { companyId } })
  const payrollRunCount = await prisma.payrollRun.count({ where: { companyId } })
  
  const totalCostAgg = await prisma.payrollEntry.aggregate({
    where: { payrollRun: { companyId } },
    _sum: { totalCost: true },
  })
  const totalCostValue = totalCostAgg._sum.totalCost ? Number(totalCostAgg._sum.totalCost) : 0
  const monthlyCost = (totalCostValue / 12).toFixed(2)

  // Fetch recent runs for the table
  const payrollRuns = await prisma.payrollRun.findMany({
    where: { companyId },
    orderBy: { periodStart: 'desc' },
    take: 5,
    include: { entries: true },
  })

  const recentRuns = payrollRuns.map((run: any) => ({
    id: run.id,
    periodStart: run.periodStart,
    periodEnd: run.periodEnd,
    status: run.status,
    totalCost: run.entries.reduce((sum: number, entry: any) => sum + Number(entry.totalCost), 0),
  }))

  // Fetch historical data for the chart (last 6 months)
  const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5))
  const historicalRuns = await prisma.payrollRun.findMany({
    where: {
      companyId,
      periodStart: { gte: sixMonthsAgo },
    },
    include: { entries: true },
    orderBy: { periodStart: 'asc' },
  })

  // Group by month
  const chartData = Array.from({ length: 6 }).map((_, i) => {
    const monthDate = startOfMonth(subMonths(new Date(), 5 - i))
    const monthLabel = format(monthDate, 'MMM yyyy')
    
    const monthTotal = historicalRuns
      .filter(run => format(new Date(run.periodStart), 'MMM yyyy') === monthLabel)
      .reduce((sum, run) => sum + run.entries.reduce((eSum, entry) => eSum + Number(entry.totalCost), 0), 0)

    return {
      month: monthLabel,
      total: monthTotal,
    }
  })

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Manage payroll for {company.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/employees/new"><Button variant="outline">Add Employee</Button></Link>
          <RunPayrollButton />
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="w-full">
        <PayrollChart data={chartData} />
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
                  <TableHead className="text-right">Action</TableHead>
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
                    <TableCell className="text-right">
                      <Link href={`/dashboard/payroll/${run.id}`}>
                        <Button variant="ghost" size="sm">View Details</Button>
                      </Link>
                    </TableCell>
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
