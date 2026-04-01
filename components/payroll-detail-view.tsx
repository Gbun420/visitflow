'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface PayrollEntry {
  id: string
  employee: { firstName: string; lastName: string }
  salaryGross: any
  tax: any
  socialSecurity: any
  netPay: any
  totalCost: any
  notes: string | null
}

interface PayrollRun {
  id: string
  periodStart: Date
  periodEnd: Date
  status: string
  companyId: string
  submissionReference?: string | null
}

export function PayrollDetailView({ run, entries }: { run: PayrollRun, entries: PayrollEntry[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const calculateAll = async () => {
    if (!confirm('Recalculate all entries with AI?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/dashboard/payroll/${run.id}/calculate`, { method: 'POST' })
      if (res.ok) {
        router.refresh()
      } else {
        alert('Failed to recalculate')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const submitRun = async () => {
    if (!confirm('Submit to Malta Commissioner for Revenue?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/payroll/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payrollRunId: run.id }),
      })
      if (res.ok) {
        alert('Submitted!')
        router.refresh()
      } else {
        alert('Failed to submit')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const totalCost = entries.reduce((sum, e) => sum + Number(e.totalCost), 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll Run</h1>
          <p className="text-muted-foreground">{new Date(run.periodStart).toLocaleDateString()} - {new Date(run.periodEnd).toLocaleDateString()}</p>
        </div>
        <div className="space-x-2">
          {run.status === 'DRAFT' || run.status === 'CALCULATED' ? (
            <>
              <Button onClick={calculateAll} disabled={loading} variant="outline">Recalculate</Button>
              {run.status === 'CALCULATED' && (
                <Button onClick={submitRun} disabled={loading}>Submit FS3</Button>
              )}
            </>
          ) : (
            <div className="flex flex-col items-end">
              <Badge>{run.status}</Badge>
              {run.submissionReference && <span className="text-xs text-muted-foreground mt-1">Ref: {run.submissionReference}</span>}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead className="text-right">Gross</TableHead>
              <TableHead className="text-right">Tax</TableHead>
              <TableHead className="text-right">SS Emp</TableHead>
              <TableHead className="text-right">Net Pay</TableHead>
              <TableHead className="text-right">Total Cost</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map(entry => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium">{entry.employee.firstName} {entry.employee.lastName}</TableCell>
                <TableCell className="text-right">€{Number(entry.salaryGross).toFixed(2)}</TableCell>
                <TableCell className="text-right">€{Number(entry.tax).toFixed(2)}</TableCell>
                <TableCell className="text-right">€{Number(entry.socialSecurity).toFixed(2)}</TableCell>
                <TableCell className="text-right">€{Number(entry.netPay).toFixed(2)}</TableCell>
                <TableCell className="text-right font-semibold">€{Number(entry.totalCost).toFixed(2)}</TableCell>
                <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">{entry.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <tfoot>
            <TableRow className="bg-muted/50 font-bold">
              <TableCell>Total</TableCell>
              <TableCell colSpan={4}></TableCell>
              <TableCell className="text-right">€{totalCost.toFixed(2)}</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </tfoot>
        </Table>
      </div>

      <div className="rounded-lg border border-border p-6 bg-card">
        <h3 className="text-lg font-semibold mb-2">AI Natural Language Query</h3>
        <p className="text-sm text-muted-foreground mb-4">Ask questions about this payroll run: “What if we give a bonus?” or “How much would tax change if salary increased by 10%?”</p>
        <AIQuery companyId={run.companyId} />
      </div>
    </div>
  )
}

function AIQuery({ companyId }: { companyId: string }) {
  const [q, setQ] = useState('')
  const [answer, setAnswer] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const ask = async () => {
    if (!q.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/payroll/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, companyId }),
      })
      const data = await res.json()
      setAnswer(data.answer)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input 
          value={q} 
          onChange={(e) => setQ(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && ask()}
          placeholder="Ask about payroll..." 
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
        />
        <Button onClick={ask} disabled={loading}>{loading ? 'Thinking...' : 'Ask AI'}</Button>
      </div>
      {answer && (
        <div className="p-4 rounded-md bg-muted text-sm leading-relaxed border border-border animate-in fade-in duration-300">
          {answer}
        </div>
      )}
    </div>
  )
}
