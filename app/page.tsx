import Link from 'next/link'
import { Header } from '@/components/header'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            AI Payroll for Malta, <span className="text-primary">Simplified</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Fully automated payroll, tax, and social security compliance for Maltese SMEs. 
            AI does the math, submissions, and optimizations. You focus on your business.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/signup" className="rounded-md bg-primary px-6 py-3 text-primary-foreground font-medium">
              Get Started Free
            </Link>
            <Link href="/login" className="rounded-md border border-border px-6 py-3">
              Log in
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16 text-left">
            <div className="rounded-lg border border-border p-6">
              <h3 className="font-bold mb-2">AI-Powered Calculations</h3>
              <p className="text-muted-foreground text-sm">
                GPT-4o calculates taxes, MSSS contributions, and net pay using Malta's latest brackets. 
                No spreadsheets, no manual errors.
              </p>
            </div>
            <div className="rounded-lg border border-border p-6">
              <h3 className="font-bold mb-2">One-Click Submissions</h3>
              <p className="text-muted-foreground text-sm">
                Generate FS3/FS5 forms and submit to the Malta Commissioner for Revenue automatically. 
                Stay compliant without the paperwork.
              </p>
            </div>
            <div className="rounded-lg border border-border p-6">
              <h3 className="font-bold mb-2">Natural Language Queries</h3>
              <p className="text-muted-foreground text-sm">
                Ask: "What if I give a €2K bonus?" AI predicts tax impact, suggests optimizations, 
                and recalculates instantly.
              </p>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Built for Malta's 40,000 SMEs. Starting at €2 per employee per month.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
