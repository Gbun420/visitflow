'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function CompanySetupForm() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    registrationNumber: '',
    taxId: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || 'Unable to create company')
      }

      router.replace('/dashboard')
      router.refresh()
    } catch (submitError: any) {
      setError(submitError.message || 'Unable to create company')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg shadow-lg border-2">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-center">Set up your company</CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            Create the company record you&apos;ll use for payroll, employees, and billing.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            {error && <div className="text-sm text-destructive font-medium p-3 bg-destructive/10 border border-destructive/20 rounded-md text-center">{error}</div>}
            <div className="grid gap-2">
              <Label htmlFor="name">Company name</Label>
              <Input id="name" name="name" value={form.name} onChange={handleChange} required placeholder="VisitFlow Ltd" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="registrationNumber">Registration number</Label>
              <Input
                id="registrationNumber"
                name="registrationNumber"
                value={form.registrationNumber}
                onChange={handleChange}
                required
                placeholder="C12345"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="taxId">Tax ID</Label>
              <Input id="taxId" name="taxId" value={form.taxId} onChange={handleChange} required placeholder="MT12345678" />
            </div>
            <Button type="submit" className="w-full py-6 font-semibold" disabled={loading}>
              {loading ? 'Creating company...' : 'Create company'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
