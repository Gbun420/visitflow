'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { signIn } from 'next-auth/react'
import Image from 'next/image'

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-2">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Image src="/icon.svg" alt="PayrollPal Malta Logo" width={48} height={48} className="rounded-xl shadow-sm" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-center">PayrollPal <span className="text-primary">Malta</span></CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            Bring your Keycloak realm into VisitFlow. Guests should request access directly through your Keycloak admin portal.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            onClick={() => void signIn('keycloak', { callbackUrl: '/dashboard' })}
            className="w-full py-6"
          >
            Continue with Keycloak
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Need credentials? Ask your admin to provision you in Keycloak or use the credentials tab once logged out.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
