import Link from 'next/link'
import Image from 'next/image'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg tracking-tight hover:opacity-80 transition-opacity">
            <Image src="/icon.svg" alt="PayrollPal Malta Logo" width={28} height={28} className="rounded-md" />
            <span>PayrollPal <span className="text-primary">Malta</span></span>
          </Link>
          <nav className="space-x-6 flex items-center">
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors text-slate-600">Dashboard</Link>
            <Link href="/dashboard/employees" className="text-sm font-medium hover:text-primary transition-colors text-slate-600">Workforce</Link>
            <Link href="/dashboard/payroll" className="text-sm font-medium hover:text-primary transition-colors text-slate-600">Ledger</Link>
            <Link href="/dashboard/billing" className="text-sm font-medium hover:text-primary transition-colors text-slate-600">Fiscal</Link>
            <Link href="/account/security" className="text-sm font-medium hover:text-primary transition-colors text-slate-600">Settings</Link>
            <form action="/api/auth/logout" method="POST" className="border-l pl-6 border-slate-200">
              <button type="submit" className="text-sm font-bold hover:text-destructive transition-colors text-slate-400 uppercase tracking-widest text-[10px]">Logout</button>
            </form>
          </nav>
        </div>
      </header>
      <main className="container mx-auto p-6 lg:p-10">
        {children}
      </main>
      <footer className="border-t border-slate-100 py-6">
        <div className="container mx-auto px-4 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          <div>© 2026 PayrollPal Malta</div>
          <div className="flex gap-4">
            <span>System Status: Optimal</span>
            <span>v1.4.2</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
