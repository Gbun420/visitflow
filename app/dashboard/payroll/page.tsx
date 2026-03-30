'use client'

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface PayrollRun {
  id: string
  periodStart: string
  periodEnd: string
  status: string
  totalCost?: number
}

export default function PayrollPage() {
  const router = useRouter()
  const [runs, setRuns] = useState<PayrollRun[]>([])
  const [companyId, setCompanyId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/dashboard/me')
      .then(r => r.json())
      .then(data => {
        setCompanyId(data.companyId)
        return fetch('/api/dashboard/payroll')
      })
      .then(r => r.json())
      .then(setRuns)
      .catch(console.error)
  }, [])

  const createRun = async () => {
    const periodStart = prompt('Period start (YYYY-MM-DD)?')
    const periodEnd = prompt('Period end (YYYY-MM-DD)?')
    if (!periodStart || !periodEnd) return
    const res = await fetch('/api/dashboard/payroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ periodStart, periodEnd }),
    })
    if (res.ok) {
      const run = await res.json()
      router.push(`/dashboard/payroll/${run.id}`)
    } else {
      alert('Failed to create payroll run')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Payroll Runs</h1>
        <button onClick={createRun} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">New Run</button>
      </div>

      <div className="rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-2">Period</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-right px-4 py-2">Total Cost</th>
              <th className="text-center px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {runs.map(run => (
              <tr key={run.id} className="border-t">
                <td className="px-4 py-2">{new Date(run.periodStart).toLocaleDateString()} — {new Date(run.periodEnd).toLocaleDateString()}</td>
                <td className="px-4 py-2"><span className={`inline-block px-2 py-1 rounded text-xs ${run.status === 'SUBMITTED' ? 'bg-green-900 text-green-200' : run.status === 'CALCULATED' ? 'bg-blue-900 text-blue-200' : 'bg-yellow-900 text-yellow-200'}`}>{run.status}</span></td>
                <td className="text-right px-4 py-2">€{run.totalCost ? Number(run.totalCost).toFixed(2) : '—'}</td>
                <td className="text-center px-4 py-2">
                  <a href={`/dashboard/payroll/${run.id}`} className="text-sm underline">View</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
