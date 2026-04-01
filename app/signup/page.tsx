'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignupPage() {
  const router = useRouter()
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
      // 1. Initial Firebase Account Creation
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // 2. Extract ID Token
      const idToken = await userCredential.user.getIdToken()
      
      // 3. POST token to session API
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })

      if (response.ok) {
        setSuccess(true)
        // We will let the user click "Go to Dashboard" which will push/refresh
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create session')
      }
    } catch (err: any) {
      console.error("Firebase Auth Error:", err.code, err.message)
      // 4. Robust error parsing
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError("An account already exists with this email.")
          break;
        case 'auth/invalid-email':
          setError("Please enter a valid email address.")
          break;
        case 'auth/weak-password':
          setError("Password is too weak. Please use at least 6 characters.")
          break;
        case 'auth/too-many-requests':
          setError("Too many attempts. Please wait a few minutes and try again.")
          break;
        case 'auth/operation-not-allowed':
          setError("Email/Password signup is not enabled. Please contact support.")
          break;
        default:
          setError(err.message || "Signup failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Account created</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your account has been created successfully.
            </p>
            <Button className="mt-4 w-full" onClick={() => {
              router.push('/dashboard')
              router.refresh()
            }}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            {error && <div className="text-sm text-destructive font-medium p-2 bg-destructive/10 rounded">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="email@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <Input id="confirm" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required minLength={8} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign up'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account? <a href="/login" className="underline">Log in</a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
