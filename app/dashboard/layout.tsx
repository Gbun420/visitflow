import Link from 'next/link'
import Image from 'next/image'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border p-4 flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <Image src="/icon.svg" alt="PayrollPal Malta Logo" width={28} height={28} className="rounded-md" />
          <span>PayrollPal <span className="text-primary">Malta</span></span>
        </div>
        <nav className="space-x-4 flex items-center">
          <Link href="/dashboard" className="text-sm hover:underline">Dashboard</Link>
          <Link href="/dashboard/employees" className="text-sm hover:underline">Employees</Link>
          <Link href="/dashboard/payroll" className="text-sm hover:underline">Payroll</Link>
          <Link href="/account/security" className="text-sm hover:underline">Settings</Link>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="text-sm hover:underline text-destructive ml-4">Logout</button>
          </form>
        </nav>
      </header>
      <main className="p-6">
        {children}
      </main>
    </div>
  )
}
