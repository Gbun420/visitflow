'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
    // In the new Multi-Tenant Keycloak setup, password resets are handled 
    // directly by the Identity Provider.
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
              Wait a moment! VisitFlow now uses <strong>Keycloak</strong> for secure identity management. 
              Please check your inbox for instructions from our identity server or contact your administrator 
              to reset your credentials.
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
            <Button type="submit" className="w-full py-6 font-semibold">
              Send reset link
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
