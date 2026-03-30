'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function LoginPage() {
  const supabase = createClientComponentClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMessage(error.message)
    else setMessage('Logged in! Redirecting...')
    setLoading(false)
  }

  const handleOAuth = async (provider: 'google' | 'github') => {
    await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${location.origin}/api/auth/callback` } })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">PayrollPal Malta</h1>
          <p className="mt-2 text-muted-foreground">AI payroll for Maltese businesses</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary px-3 py-2 font-medium text-primary-foreground disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or continue with</span></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => handleOAuth('google')} className="rounded-md border px-3 py-2">Google</button>
          <button onClick={() => handleOAuth('github')} className="rounded-md border px-3 py-2">GitHub</button>
        </div>

        {message && <p className="text-center text-sm text-muted-foreground">{message}</p>}
      </div>
    </div>
  )
}
