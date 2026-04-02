'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getPublicAppUrl } from '@/lib/public-url'
import {
  getEmailDeliveryIssueMessage,
  isEmailDeliveryBlockedError,
} from '@/lib/auth/confirmation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type VerifyEmailClientProps = {
  initialEmail?: string
}

export default function VerifyEmailClient({
  initialEmail = '',
}: VerifyEmailClientProps) {
  const supabase = createClient()
  const [email, setEmail] = useState(initialEmail)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const normalizedEmail = email.trim()
    if (!normalizedEmail) {
      setError('Enter the email address used to create the account.')
      setLoading(false)
      return
    }

    try {
      const redirectTo = `${getPublicAppUrl()}/auth/callback`
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: normalizedEmail,
        options: {
          emailRedirectTo: redirectTo,
        },
      })

      if (resendError) {
        setError(
          isEmailDeliveryBlockedError(resendError)
            ? getEmailDeliveryIssueMessage(resendError)
            : 'Unable to resend the confirmation email right now. Please try again.'
        )
      } else {
        setSent(true)
      }
    } catch {
      setError('Unable to resend the confirmation email right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-2">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-center">Check your email</CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            We sent a confirmation link to your email address. If you did not receive it, resend the link below.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {sent && (
            <div className="text-sm text-emerald-700 font-medium p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-center">
              A new confirmation link has been sent.
            </div>
          )}
          {error && (
            <div className="text-sm text-destructive font-medium p-3 bg-destructive/10 border border-destructive/20 rounded-md text-center">
              {error}
            </div>
          )}
          <form onSubmit={handleResend} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="email@example.com"
                autoComplete="email"
              />
            </div>
            <Button type="submit" className="w-full py-6 font-semibold" disabled={loading}>
              {loading ? 'Resending confirmation link...' : 'Resend confirmation link'}
            </Button>
          </form>
          <Button asChild variant="outline" className="w-full py-6 font-semibold">
            <a href="/login">Back to Login</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
