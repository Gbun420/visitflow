'use client'

'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface PayrollEntry {
  id: string
  employee: { firstName: string; lastName: string }
  salaryGross: string
  tax: string
  socialSecurity: string
  netPay: string
  totalCost: string
  notes: string | null
}

export default function PayrollRunDetail() {
  const params = useParams()
  const runId = params.id as string
  const [run, setRun] = useState<any>(null)
  const [entries, setEntries] = useState<PayrollEntry[]>([])

  useEffect(() => {
    fetch(`/api/dashboard/payroll/${runId}`)
      .then(r => r.json())
      .then(data => {
        setRun(data.run)
        setEntries(data.entries)
      })
  }, [runId])

  const calculateAll = async () => {
    if (!confirm('Recalculate all entries with AI?')) return
    await fetch(`/api/dashboard/payroll/${runId}/calculate`, { method: 'POST' })
    window.location.reload()
  }

  const submitRun = async () => {
    if (!confirm('Submit to Malta Commissioner for Revenue?')) return
    const res = await fetch(`/api/payroll/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payrollRunId: runId }),
    })
    if (res.ok) {
      alert('Submitted!')
      window.location.reload()
    }
  }

  if (!run) return <div>Loading...</div>

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
              <button onClick={calculateAll} className="rounded-md bg-blue-600 px-3 py-2 text-white">Recalculate</button>
              {run.status === 'CALCULATED' && (
                <button onClick={submitRun} className="rounded-md bg-green-600 px-3 py-2 text-white">Submit FS3</button>
              )}
            </>
          ) : (
            <span className="text-sm text-muted-foreground">Status: {run.status} {run.submissionReference && `(Ref: ${run.submissionReference})`}</span>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-2">Employee</th>
              <th className="text-right px-4 py-2">Gross</th>
              <th className="text-right px-4 py-2">Tax</th>
              <th className="text-right px-4 py-2">SS Employee</th>
              <th className="text-right px-4 py-2">Net Pay</th>
              <th className="text-right px-4 py-2">Total Cost</th>
              <th className="px-4 py-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(entry => (
              <tr key={entry.id} className="border-t">
                <td className="px-4 py-2">{entry.employee.firstName} {entry.employee.lastName}</td>
                <td className="text-right px-4 py-2">€{Number(entry.salaryGross).toFixed(2)}</td>
                <td className="text-right px-4 py-2">€{Number(entry.tax).toFixed(2)}</td>
                <td className="text-right px-4 py-2">€{Number(entry.socialSecurity).toFixed(2)}</td>
                <td className="text-right px-4 py-2">€{Number(entry.netPay).toFixed(2)}</td>
                <td className="text-right px-4 py-2">€{Number(entry.totalCost).toFixed(2)}</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">{entry.notes}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-muted">
            <tr>
              <td colSpan={5} className="text-right px-4 py-2 font-medium">Total</td>
              <td className="text-right px-4 py-2 font-bold">€{totalCost.toFixed(2)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="rounded-lg border border-border p-4">
        <h3 className="font-medium mb-2">AI Natural Language Query</h3>
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
    setLoading(true)
    const res = await fetch('/api/payroll/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: q, companyId }),
    })
    const data = await res.json()
    setAnswer(data.answer)
    setLoading(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask about payroll..." className="flex-1 rounded-md border border-input bg-background px-3 py-2" />
        <button onClick={ask} disabled={loading} className="px-4 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50">Ask</button>
      </div>
      {answer && <div className="p-3 rounded-md bg-muted text-sm">{answer}</div>}
    </div>
  )
}
