import { getCurrentUser } from '@/lib/auth'
import { getAuthenticatedLandingPath } from '@/lib/navigation'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/header'
import { ShieldCheck, Zap, FileText, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default async function HomePage() {
  const user = await getCurrentUser()
  
  // Redirect logged-in users to their appropriate dashboard path
  if (user?.company) {
    redirect(getAuthenticatedLandingPath(user))
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                <Zap className="w-4 h-4 mr-2" />
                The Future of Maltese Payroll
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight">
                Effortless <span className="text-primary">Multi-Tenant</span> Payroll for Malta.
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                Automate your compliance with Malta Legal Notice 274 of 2018. Secure, asynchronous, and built for modern Maltese SMEs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Link href="/signup">
                  <Button size="lg" className="px-8 py-7 text-lg font-bold w-full sm:w-auto shadow-lg shadow-primary/20">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="px-8 py-7 text-lg font-semibold w-full sm:w-auto">
                    Client Login
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/20 rounded-2xl blur opacity-20"></div>
              <Image 
                src="/hero-payroll.svg" 
                alt="VisitFlow Dashboard Visualization" 
                width={800}
                height={600}
                className="relative w-full drop-shadow-2xl rounded-xl border border-border bg-card"
                priority
              />
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="bg-muted/30 py-24 border-y border-border">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Enterprise-Grade by Design</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Every feature is built with three core pillars in mind: security, reliability, and local compliance.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-8 rounded-2xl border-2 border-border hover:border-primary/50 transition-all group">
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Zero-Trust Security</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Powered by ZenStack and Prisma. Mathematical data isolation ensures no tenant can ever access another company&apos;s records.
                </p>
              </div>

              <div className="bg-card p-8 rounded-2xl border-2 border-border hover:border-primary/50 transition-all group">
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Asynchronous Engine</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Complex payroll processing handled in the background via Trigger.dev. No timeouts, high durability, and real-time status updates.
                </p>
              </div>

              <div className="bg-card p-8 rounded-2xl border-2 border-border hover:border-primary/50 transition-all group">
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Legal Compliance</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Automated PDF payslip generation mapped perfectly to Malta Legal Notice 274 of 2018. FS3 and FS5 reports ready in one click.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-24 container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-12 text-muted-foreground/60 uppercase tracking-widest text-sm">Trusted by modern Maltese businesses</h2>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-40 grayscale contrast-200">
            <div className="font-black text-3xl italic tracking-tighter">VallettaTech</div>
            <div className="font-black text-3xl italic tracking-tighter">SliemaSoft</div>
            <div className="font-black text-3xl italic tracking-tighter">GozoDigital</div>
            <div className="font-black text-3xl italic tracking-tighter">IslandScale</div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2 font-bold text-xl">
              <Image src="/icon.svg" alt="PayrollPal Logo" width={24} height={24} />
              PayrollPal <span className="text-primary">Malta</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} PayrollPal Malta. All rights reserved.
            </div>
            <nav className="flex gap-8 text-sm font-medium">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
              <Link href="mailto:support@payrollpal.mt" className="text-muted-foreground hover:text-primary transition-colors">Support</Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
