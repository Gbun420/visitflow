'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1. Initial Firebase Login
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      // 2. Extract ID Token
      const idToken = await userCredential.user.getIdToken()
      
      // 3. POST token to session API
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })

      if (response.ok) {
        // 4. Redirect and Refresh upon 200 OK
        router.push('/dashboard')
        router.refresh()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create session')
      }
    } catch (err: any) {
      console.error("Firebase Auth Error:", err.code, err.message)
      // 5. Robust error parsing
      switch (err.code) {
        case 'auth/invalid-email':
          setError("Please enter a valid email address.")
          break;
        case 'auth/invalid-credential':
          setError("Incorrect email or password. Please try again.")
          break;
        case 'auth/user-not-found':
          setError("No account found with this email.")
          break;
        case 'auth/wrong-password':
          setError("Incorrect password. Please try again.")
          break;
        case 'auth/too-many-requests':
          setError("Too many failed attempts. Please try again later.")
          break;
        case 'auth/operation-not-allowed':
          setError("Email/Password login is not enabled. Please contact support.")
          break;
        default:
          setError(err.message || "Login failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login to PayrollPal Malta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && <div className="text-sm text-destructive font-medium p-2 bg-destructive/10 rounded">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="email@example.com" autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Log in'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account? <a href="/signup" className="underline">Sign up</a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
