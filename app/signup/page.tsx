'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { signIn } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      const result = await signIn('credentials', {
        redirect: false,
        email: form.email,
        password: form.password,
      })

      if (result?.error) {
        setError('Signup successful, but login failed. Please try logging in.')
        router.push('/login')
      } else {
        router.push('/setup/company')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleKeycloak = () => {
    signIn('keycloak', { callbackUrl: '/dashboard' })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/50 p-4 font-sans">
      <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight mb-8 hover:opacity-80 transition-opacity">
        <Image src="/icon.svg" alt="PayrollPal Malta Logo" width={40} height={40} className="rounded-xl shadow-md" />
        <span>PayrollPal <span className="text-primary">Malta</span></span>
      </Link>

      <Card className="w-full max-w-md shadow-2xl border-slate-200 bg-white">
        <CardHeader className="space-y-1 text-center border-b border-slate-50 pb-8">
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">Initialize Account</CardTitle>
          <CardDescription className="font-medium">Secure payroll infrastructure for 2026.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 pt-8">
          <form onSubmit={handleSubmit} className="grid gap-4">
            {error && (
              <div className="text-sm text-destructive font-medium p-3 bg-destructive/5 border border-destructive/10 rounded-md text-center">
                {error}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-slate-400">Organization Administrator</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
                required
                className="h-12 border-slate-200 focus-visible:ring-primary"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-400">Corporate Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@company.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="h-12 border-slate-200 focus-visible:ring-primary"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-slate-400">Access Key</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className="h-12 border-slate-200 focus-visible:ring-primary"
              />
            </div>
            <Button type="submit" className="w-full h-12 font-bold shadow-lg shadow-primary/20 rounded-md" disabled={loading}>
              {loading ? 'Provisioning...' : 'Create Account'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.2em]">
              <span className="bg-white px-4 text-slate-300">Identity Gateway</span>
            </div>
          </div>

          <Button variant="outline" onClick={handleKeycloak} className="w-full h-12 border-2 border-slate-200 font-semibold text-slate-600 hover:bg-slate-50">
             Keycloak OIDC
          </Button>

          <p className="text-center text-sm text-slate-500">
            Existing organization?{' '}
            <Link href="/login" className="text-primary hover:underline font-bold">
              Access Portal
            </Link>
          </p>
        </CardContent>
      </Card>
      <div className="mt-8 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
        © 2026 PayrollPal Malta
      </div>
    </div>
  )
}
