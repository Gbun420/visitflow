'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default function SecurityPage() {
  const [error] = useState<string | null>(null)
  
  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Account Security</h1>
      
      <Card className="border-2 shadow-md">
        <CardHeader className="bg-muted/30">
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>
            Manage your account&apos;s authentication and protection settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {error && <div className="text-sm text-destructive font-medium p-3 bg-destructive/10 rounded-md border border-destructive/20 mb-4 text-center">{error}</div>}

          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="rounded-full bg-primary/10 p-4 border border-primary/20">
                <AlertCircle className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
                <h3 className="text-lg font-semibold">Identity Management</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                    VisitFlow uses <strong>Keycloak</strong> for secure identity and access management.
                </p>
                <p className="text-sm text-muted-foreground max-w-sm">
                    To update your password, enable MFA, or manage sessions, please use your organization&apos;s identity management console or contact your administrator.
                </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
