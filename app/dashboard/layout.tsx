import Link from 'next/link'
import Image from 'next/image'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg tracking-tight hover:opacity-80 transition-opacity">
            <Image src="/icon.svg" alt="VisitFlow Logo" width={28} height={28} className="rounded-md" />
            <span>VisitFlow</span>
          </Link>
          <nav className="space-x-6 flex items-center">
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">Dashboard</Link>
            <Link href="/dashboard/employees" className="text-sm font-medium hover:text-primary transition-colors">Workforce</Link>
            <Link href="/dashboard/payroll" className="text-sm font-medium hover:text-primary transition-colors">Ledger</Link>
            <Link href="/dashboard/billing" className="text-sm font-medium hover:text-primary transition-colors">Fiscal</Link>
            <Link href="/account/security" className="text-sm font-medium hover:text-primary transition-colors">Settings</Link>
            <form action="/api/auth/logout" method="POST" className="border-l pl-6">
              <button type="submit" className="text-sm font-bold hover:text-destructive transition-colors text-muted-foreground uppercase tracking-widest text-[10px]">Logout</button>
            </form>
          </nav>
        </div>
      </header>
      <main className="container mx-auto p-6 lg:p-10">
        {children}
      </main>
    </div>
  )
}
