'use client'

import { useUser } from '@supabase/auth-helpers-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!user) return null // redirecting

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border p-4 flex justify-between items-center">
        <div className="font-bold text-lg">PayrollPal Malta</div>
        <nav className="space-x-4">
          <Link href="/dashboard" className="text-sm hover:underline">Dashboard</Link>
          <Link href="/dashboard/employees" className="text-sm hover:underline">Employees</Link>
          <Link href="/dashboard/payroll" className="text-sm hover:underline">Payroll</Link>
          <Link href="/dashboard/settings" className="text-sm hover:underline">Settings</Link>
        </nav>
        <div className="text-sm text-muted-foreground">{user.email}</div>
      </header>
      <main className="p-6">
        {children}
      </main>
    </div>
  )
}
