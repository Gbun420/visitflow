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

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const redirectTo = `${getPublicAppUrl()}/auth/callback?next=/reset-password`
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      })

      if (resetError) {
        setError(
          isEmailDeliveryBlockedError(resetError)
            ? getEmailDeliveryIssueMessage(resetError)
            : 'Unable to send the reset link right now. Please try again.'
        )
      } else {
        setSent(true)
      }
    } catch (submitError: any) {
      setError('Unable to send the reset link right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-lg border-2">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Check your email</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm text-muted-foreground">
              We sent password reset instructions to <strong>{email}</strong>. Use the link in the email to set a new password.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-2">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-center">Reset your password</CardTitle>
          <p className="text-center text-sm text-muted-foreground">We&apos;ll send you a secure reset link.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            {error && <div className="text-sm text-destructive font-medium p-3 bg-destructive/10 border border-destructive/20 rounded-md text-center">{error}</div>}
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
              {loading ? 'Sending reset link...' : 'Send reset link'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
