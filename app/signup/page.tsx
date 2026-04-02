'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getPublicAppUrl } from '@/lib/public-url'
import { UserPlus } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirm) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const confirmUrl = `${getPublicAppUrl()}/auth/confirm`

      const { error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: confirmUrl,
        },
      })

      if (signupError) {
        setError(signupError.message)
      } else {
        setSuccess(true)
      }
    } catch (err: any) {
      console.error("Signup error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-lg border-2">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Check your email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              We&apos;ve sent a confirmation link to <strong>{email}</strong>. Please check your inbox and follow the instructions to complete your registration.
            </p>
            <Button className="w-full py-6 font-semibold" onClick={() => router.push('/login')}>
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-2">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-center">Create account</CardTitle>
          <p className="text-center text-sm text-muted-foreground">Sign up to start managing your payroll with PayrollPal Malta</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="grid gap-4">
            {error && <div className="text-sm text-destructive font-medium p-3 bg-destructive/10 border border-destructive/20 rounded-md text-center">{error}</div>}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="email@example.com" autoComplete="email" className="py-5" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" placeholder="At least 8 characters" className="py-5" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <Input id="confirm" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required minLength={8} autoComplete="new-password" placeholder="Repeat your password" className="py-5" />
            </div>
            <Button type="submit" className="w-full py-6 font-semibold" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Creating account...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Sign up
                </div>
              )}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            Already have an account? <a href="/login" className="underline font-medium hover:text-primary transition-colors">Log in</a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
