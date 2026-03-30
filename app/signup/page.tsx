'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    companyName: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      router.push('/dashboard')
    } else {
      const data = await res.json()
      setError(data.error || 'Signup failed')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">PayrollPal Malta</h1>
          <p className="text-muted-foreground">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" type="text" placeholder="Your Name" value={form.name} onChange={handleChange} required className="w-full rounded-md border border-input bg-background px-3 py-2" />
          <input name="email" type="email" placeholder="Work Email" value={form.email} onChange={handleChange} required className="w-full rounded-md border border-input bg-background px-3 py-2" />
          <input name="companyName" type="text" placeholder="Company Name" value={form.companyName} onChange={handleChange} required className="w-full rounded-md border border-input bg-background px-3 py-2" />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required minLength={6} className="w-full rounded-md border border-input bg-background px-3 py-2" />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={saving} className="w-full rounded-md bg-primary px-3 py-2 font-medium text-primary-foreground disabled:opacity-50">
            {saving ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">Already have an account? <a href="/login" className="underline">Log in</a></p>
      </div>
    </div>
  )
}
