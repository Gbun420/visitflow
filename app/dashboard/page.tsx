'use client'

import { useUser } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Link from 'next/link'

export default function Dashboard() {
  const { user, isLoading } = useUser()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    if (!user) return
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(console.error)
  }, [user])

  useEffect(() => {
    if (!isLoading && !user) router.push('/login')
  }, [user, isLoading, router])

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-muted-foreground">Loading...</div>
    </div>
  )
  if (!user) return null

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Manage your payroll and employees.</p>
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
            <div className="text-3xl font-bold">{stats?.employeeCount ?? '—'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Payroll Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.payrollRunCount ?? '—'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">€{stats?.monthlyCost ? Number(stats.monthlyCost).toLocaleString() : '—'}</div>
          </CardContent>
        </Card>
      </div>

      {stats?.recentRuns?.length > 0 && (
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
                {stats.recentRuns.map((run: any) => (
                  <TableRow key={run.id}>
                    <TableCell>
                      {new Date(run.periodStart).toLocaleDateString()} - {new Date(run.periodEnd).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${run.status === 'SUBMITTED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {run.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">€{(run.totalCost || 0).toFixed(2)}</TableCell>
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
