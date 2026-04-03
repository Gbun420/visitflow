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

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleKeycloak = () => {
    signIn('keycloak', { callbackUrl: '/dashboard' })
  }

  const handleCredentials = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    })

    if (result?.error) {
      setError(result.error)
    } else {
      router.push('/dashboard')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/50 p-4 font-sans">
      <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight mb-8 hover:opacity-80 transition-opacity">
        <Image src="/icon.svg" alt="PayrollPal Malta Logo" width={40} height={40} className="rounded-xl shadow-md" />
        <span>PayrollPal <span className="text-primary">Malta</span></span>
      </Link>

      <Card className="w-full max-w-md shadow-2xl border-slate-200 bg-white">
        <CardHeader className="space-y-1 text-center border-b border-slate-50 pb-8">
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">Access Portal</CardTitle>
          <CardDescription className="font-medium">Secure workforce infrastructure.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 pt-8">
          <form onSubmit={handleCredentials} className="grid gap-4">
            {error && (
              <div className="text-sm text-destructive font-medium p-3 bg-destructive/5 border border-destructive/10 rounded-md text-center">
                {error}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-400">Organization Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                className="h-12 border-slate-200 focus-visible:ring-primary"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-slate-400">Secret Key</Label>
                <Link href="/forgot-password" className="text-xs font-bold text-primary hover:underline">
                  Reset
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
                className="h-12 border-slate-200 focus-visible:ring-primary"
              />
            </div>
            <Button type="submit" className="w-full h-12 font-bold shadow-lg shadow-primary/20 rounded-md" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
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

          <Button variant="outline" onClick={handleKeycloak} disabled={loading} className="w-full h-12 border-2 border-slate-200 font-semibold text-slate-600 hover:bg-slate-50">
            Keycloak SSO
          </Button>

          <p className="text-center text-sm text-slate-500">
            New organization?{' '}
            <Link href="/signup" className="text-primary hover:underline font-bold">
              Initialize Account
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
