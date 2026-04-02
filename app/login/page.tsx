'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getPublicAppUrl } from '@/lib/public-url'
import {
  getEmailDeliveryIssueMessage,
  isEmailConfirmationRequiredError,
  isEmailDeliveryBlockedError,
} from '@/lib/auth/confirmation'
import { LogIn } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showRecoveryActions, setShowRecoveryActions] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResendMessage(null)
    setShowRecoveryActions(false)

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (loginError) {
        if (isEmailConfirmationRequiredError(loginError)) {
          setError('Unable to sign in. Your account may still need email confirmation.')
        } else {
          setError('Unable to sign in. Please check your credentials and try again.')
        }

        setShowRecoveryActions(true)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: any) {
      console.error("Login error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    const normalizedEmail = email.trim()

    if (!normalizedEmail) {
      setResendMessage('Enter your email address first.')
      return
    }

    setResendLoading(true)
    setResendMessage(null)

    try {
      const callbackUrl = `${getPublicAppUrl()}/auth/callback`
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: normalizedEmail,
        options: {
          emailRedirectTo: callbackUrl,
        },
      })

      if (resendError) {
        setResendMessage(
          isEmailDeliveryBlockedError(resendError)
            ? getEmailDeliveryIssueMessage(resendError)
            : 'Unable to resend the confirmation email right now. Please try again.'
        )
      } else {
        setResendMessage('A new confirmation email has been sent.')
      }
    } catch {
      setResendMessage('Unable to resend the confirmation email right now. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)

    try {
      const callbackUrl = `${getPublicAppUrl()}/auth/callback`

      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
        },
      })

      if (googleError) {
        setError('Google sign-in failed. Please try again.')
      }
    } catch (err: any) {
      console.error("Google login error:", err)
      setError("Google sign-in failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-2">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-center">PayrollPal Malta</CardTitle>
          <p className="text-center text-sm text-muted-foreground">Enter your credentials to access your account</p>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 gap-2">
            <Button variant="outline" type="button" disabled={loading} onClick={handleGoogleLogin} className="w-full relative py-6">
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
              </svg>
              Sign in with Google
            </Button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>
          <form onSubmit={handleLogin} className="grid gap-4">
            {error && <div className="text-sm text-destructive font-medium p-3 bg-destructive/10 border border-destructive/20 rounded-md text-center">{error}</div>}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="email@example.com" autoComplete="email" className="py-5" />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" title="Forgot Password" className="text-xs text-muted-foreground hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" className="py-5" />
            </div>
            <Button type="submit" className="w-full py-6 font-semibold" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Please wait...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Log in
                </div>
              )}
            </Button>
          </form>
          {showRecoveryActions && (
            <div className="space-y-3 rounded-md border border-border/60 bg-muted/30 p-4 text-sm">
              <p className="text-center text-muted-foreground">
                Didn&apos;t get a confirmation email? Send a fresh one to the email address you entered.
              </p>
              {resendMessage && (
                <div className="text-center text-sm text-muted-foreground">{resendMessage}</div>
              )}
              <Button
                type="button"
                variant="outline"
                className="w-full py-6 font-semibold"
                onClick={handleResendConfirmation}
                disabled={resendLoading}
              >
                {resendLoading ? 'Sending confirmation email...' : 'Send confirmation email'}
              </Button>
            </div>
          )}
          <div className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline font-medium hover:text-primary transition-colors">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
