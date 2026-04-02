'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { signIn } from 'next-auth/react'

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
      callbackUrl: '/dashboard',
    })

    if (result?.error) {
      setError(result.error)
    } else if (result?.url) {
      router.push(result.url)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-2">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-center">PayrollPal Malta</CardTitle>
          <p className="text-center text-sm text-muted-foreground">Sign in with your Keycloak identity or credentials</p>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button variant="outline" onClick={handleKeycloak} disabled={loading} className="w-full py-6">
            Continue with Keycloak
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or use credentials</span>
            </div>
          </div>

          <form onSubmit={handleCredentials} className="grid gap-4">
            {error && (
              <div className="text-sm text-destructive font-medium p-3 bg-destructive/10 border border-destructive/20 rounded-md text-center">
                {error}
              </div>
            )}
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                className="py-5"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
                className="py-5"
              />
            </div>
            <Button type="submit" className="w-full py-6 font-semibold" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
