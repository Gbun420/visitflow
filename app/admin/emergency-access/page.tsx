'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function EmergencyAccessPage() {
  const [adminKey, setAdminKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleEmergencyOverride = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    // In a real application, this would verify a physical key, a master password, 
    // or trigger a multi-admin approval workflow.
    try {
      if (adminKey !== 'EMERGENCY_OVERRIDE_TEST') {
        throw new Error('Invalid emergency access key')
      }
      
      // Simulate API call to disable MFA or grant temporary access
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setSuccess('Emergency access granted. MFA requirements temporarily bypassed.')
    } catch (err: any) {
      setError(err.message || 'Emergency override failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-red-600">Emergency Access</h1>
      
      <Card className="border-red-200">
        <CardHeader className="bg-red-50 text-red-900">
          <CardTitle>Break-Glass Protocol</CardTitle>
          <CardDescription className="text-red-700">
            Use this protocol only when standard access mechanisms (including MFA) are unavailable. All emergency actions are strictly audited and alerted.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {error && <div className="text-sm text-destructive font-medium p-2 bg-destructive/10 rounded mb-4">{error}</div>}
          {success && <div className="text-sm text-green-600 font-medium p-2 bg-green-50 rounded mb-4">{success}</div>}

          <form onSubmit={handleEmergencyOverride} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminKey">Master Emergency Key</Label>
              <Input 
                id="adminKey" 
                type="password" 
                placeholder="Enter 64-character master key" 
                value={adminKey} 
                onChange={(e) => setAdminKey(e.target.value)} 
                required 
              />
            </div>
            
            <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-md text-yellow-800 text-sm">
              <p className="font-bold">Warning:</p>
              <p>Activating this will send immediate alerts to all board members and trigger a mandatory security review.</p>
            </div>

            <Button type="submit" variant="destructive" className="w-full" disabled={loading}>
              {loading ? 'Activating Protocol...' : 'Activate Emergency Access'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
