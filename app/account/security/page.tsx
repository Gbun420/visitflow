'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { auth } from '@/lib/firebase'
import { multiFactor, PhoneAuthProvider, PhoneMultiFactorGenerator, RecaptchaVerifier, User } from 'firebase/auth'

export default function SecurityPage() {
  const [user, setUser] = useState<User | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationId, setVerificationId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [mfaEnabled, setMfaEnabled] = useState(false)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u)
      if (u) {
        const mfa = multiFactor(u)
        setMfaEnabled(mfa.enrolledFactors.length > 0)
      }
    })
    return () => unsubscribe()
  }, [])

  const startMfaEnrollment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    setError(null)
    
    try {
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container-id', {
        size: 'invisible'
      })
      const mfa = multiFactor(user)
      const session = await mfa.getSession()
      
      const phoneAuthProvider = new PhoneAuthProvider(auth)
      const phoneInfoOptions = {
        phoneNumber,
        session
      }
      const vid = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier)
      setVerificationId(vid)
      setSuccess('Verification code sent to your phone.')
    } catch (err: any) {
      setError(err.message || 'Failed to start MFA enrollment')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const completeMfaEnrollment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !verificationId) return
    setLoading(true)
    setError(null)

    try {
      const phoneAuthCredential = PhoneAuthProvider.credential(verificationId, verificationCode)
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(phoneAuthCredential)
      
      await multiFactor(user).enroll(multiFactorAssertion, 'Personal Phone')
      setMfaEnabled(true)
      setSuccess('MFA successfully enabled!')
      setVerificationId('')
    } catch (err: any) {
      setError(err.message || 'Failed to verify code')
    } finally {
      setLoading(false)
    }
  }

  const unenrollMfa = async () => {
    if (!user) return
    setLoading(true)
    try {
      const mfa = multiFactor(user)
      const factors = mfa.enrolledFactors
      if (factors.length > 0) {
        await mfa.unenroll(factors[0])
        setMfaEnabled(false)
        setSuccess('MFA disabled successfully')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to disable MFA')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Account Security</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Multi-Factor Authentication (MFA)</CardTitle>
          <CardDescription>
            Protect your account with two-step verification. We require this for sensitive actions like payroll submission.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="text-sm text-destructive font-medium p-2 bg-destructive/10 rounded mb-4">{error}</div>}
          {success && <div className="text-sm text-green-600 font-medium p-2 bg-green-50 rounded mb-4">{success}</div>}

          {mfaEnabled ? (
            <div className="space-y-4">
              <div className="p-4 border border-green-200 bg-green-50 rounded-md text-green-800">
                <p className="font-semibold">MFA is currently enabled</p>
                <p className="text-sm mt-1">Your account is protected by SMS verification.</p>
              </div>
              <Button variant="destructive" onClick={unenrollMfa} disabled={loading}>
                {loading ? 'Disabling...' : 'Disable MFA'}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {!verificationId ? (
                <form onSubmit={startMfaEnrollment} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="+356 79123456" 
                      value={phoneNumber} 
                      onChange={(e) => setPhoneNumber(e.target.value)} 
                      required 
                    />
                    <p className="text-xs text-muted-foreground">Include country code (e.g. +356 for Malta)</p>
                  </div>
                  <div id="recaptcha-container-id"></div>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Sending code...' : 'Add Phone Number'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={completeMfaEnrollment} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Verification Code</Label>
                    <Input 
                      id="code" 
                      type="text" 
                      placeholder="123456" 
                      value={verificationCode} 
                      onChange={(e) => setVerificationCode(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Verifying...' : 'Verify Code'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setVerificationId('')}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
