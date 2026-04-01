'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'

interface PayrollRun {
  id: string
  periodStart: Date
  periodEnd: Date
  status: string
  totalCost: number
}

export function PayrollList({ initialRuns }: { initialRuns: PayrollRun[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const createRun = async () => {
    const periodStart = prompt('Period start (YYYY-MM-DD)?')
    const periodEnd = prompt('Period end (YYYY-MM-DD)?')
    if (!periodStart || !periodEnd) return
    
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodStart, periodEnd }),
      })
      if (res.ok) {
        router.refresh()
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to create payroll run')
      }
    } catch (err) {
      console.error(err)
      alert('Error creating payroll run')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll Runs</h1>
          <p className="text-muted-foreground text-sm mt-1">Create and manage payroll periods</p>
        </div>
        <Button onClick={createRun} disabled={loading}>
          {loading ? 'Creating...' : 'New Payroll Run'}
        </Button>
      </div>

      {initialRuns.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border rounded-lg bg-card">
          No payroll runs yet. Create your first run to get started.
        </div>
      ) : (
        <div className="border rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Cost</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialRuns.map(run => (
                <TableRow key={run.id}>
                  <TableCell className="font-medium">
                    {new Date(run.periodStart).toLocaleDateString()} - {new Date(run.periodEnd).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={run.status === 'SUBMITTED' ? 'default' : 'secondary'}>{run.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">€{Number(run.totalCost).toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <a href={`/dashboard/payroll/${run.id}`} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                      View
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
