import Link from 'next/link'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border p-4 flex justify-between items-center">
        <div className="font-bold text-lg">PayrollPal Malta</div>
        <nav className="space-x-4 flex items-center">
          <Link href="/dashboard" className="text-sm hover:underline">Dashboard</Link>
          <Link href="/dashboard/employees" className="text-sm hover:underline">Employees</Link>
          <Link href="/dashboard/payroll" className="text-sm hover:underline">Payroll</Link>
          <Link href="/dashboard/settings" className="text-sm hover:underline">Settings</Link>
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
