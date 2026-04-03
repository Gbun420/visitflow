import { getCurrentUser } from '@/lib/auth'
import { getAuthenticatedLandingPath } from '@/lib/navigation'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card'
import { ShieldCheck, Zap, ArrowRight, CheckCircle2, Landmark, Users } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default async function HomePage() {
  const user = await getCurrentUser()
  
  if (user?.company) {
    redirect(getAuthenticatedLandingPath(user))
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-20 lg:pt-32 lg:pb-32 border-b bg-slate-50/50">
          <div className="absolute inset-0 z-0 opacity-[0.03]">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold bg-primary/10 text-primary border border-primary/20">
                  <Zap className="w-4 h-4 mr-2" />
                  2026 Standard for Maltese Payroll
                </div>
                <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-slate-900">
                  Maltese Payroll, <span className="text-primary">Fully Automated</span>.
                </h1>
                <p className="text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  The mission-critical payroll platform built specifically for Malta SMEs. Secure, automated, and architected for 2026 regulatory standards.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                  <Link href="/signup">
                    <Button size="lg" className="px-8 h-14 text-lg font-bold w-full sm:w-auto shadow-xl shadow-primary/20 rounded-md">
                      Start Free Trial
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="px-8 h-14 text-lg font-semibold w-full sm:w-auto rounded-md border-2">
                      Client Login
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative lg:block">
                <div className="absolute -inset-4 bg-gradient-to-tr from-primary/10 to-accent/10 rounded-3xl blur-3xl opacity-30 animate-pulse"></div>
                <div className="relative bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden p-2">
                  <Image 
                    src="/hero-payroll.svg" 
                    alt="PayrollPal Malta Dashboard" 
                    width={800}
                    height={600}
                    className="w-full h-auto rounded-lg"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section id="features" className="py-24 border-b">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-20 space-y-4">
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl text-slate-900">Compliance Without Effort</h2>
              <p className="text-muted-foreground text-lg leading-relaxed font-medium">Built to handle the intricacies of Maltese employment law, FSS, and MSSS contributions automatically.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12 text-center">
              <div className="space-y-6 px-4">
                <div className="bg-primary/5 text-primary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-primary/10">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Zero-Trust Security</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Enterprise-grade multi-tenancy. Your workforce data is cryptographically isolated at the ORM level.
                </p>
              </div>

              <div className="space-y-6 px-4">
                <div className="bg-primary/5 text-primary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-primary/10">
                  <Landmark className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Maltese Compliance</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Always up-to-date with Malta Commissioner for Revenue standards. Automatic FS3, FS5, and FS7 reports.
                </p>
              </div>

              <div className="space-y-6 px-4">
                <div className="bg-primary/5 text-primary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-primary/10">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Workforce Analytics</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Real-time visibility into your workforce capital with automated spend forecasting and cost analysis.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-slate-50/50 border-b">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl text-slate-900">Simple, Transparent Pricing</h2>
              <p className="text-muted-foreground text-lg font-medium">Scalable plans designed for modern Maltese businesses.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
              {/* Basic Tier */}
              <Card className="flex flex-col border border-slate-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-lg">Standard</CardTitle>
                  <CardDescription>Essential systems for small teams.</CardDescription>
                  <div className="pt-6">
                    <span className="text-5xl font-extrabold text-slate-900">€29</span>
                    <span className="text-muted-foreground ml-2">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-4 text-sm">
                    <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-accent" /> Up to 10 employees</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-accent" /> AI-Powered MSSS/FSS</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-accent" /> Digital FS3 Payslips</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/signup" className="w-full">
                    <Button variant="outline" className="w-full h-12 font-bold border-2">Select Standard</Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Pro Tier */}
              <Card className="flex flex-col border-primary border-2 relative shadow-2xl scale-105 z-10 bg-white">
                <div className="absolute top-0 right-0 bg-primary text-white text-[10px] px-3 py-1 rounded-bl-lg font-black uppercase tracking-widest">Recommended</div>
                <CardHeader>
                  <CardTitle className="text-lg">Professional</CardTitle>
                  <CardDescription>Full automation for growing SMEs.</CardDescription>
                  <div className="pt-6">
                    <span className="text-5xl font-extrabold text-slate-900">€79</span>
                    <span className="text-muted-foreground ml-2">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-4 text-sm font-medium">
                    <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-accent" /> Up to 100 employees</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-accent" /> Compliance Auto-Submission</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-accent" /> Advanced Spend Analytics</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-accent" /> API Integration Access</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/signup" className="w-full">
                    <Button className="w-full h-12 font-bold shadow-lg shadow-primary/20">Select Professional</Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Enterprise Tier */}
              <Card className="flex flex-col border border-slate-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-lg">Enterprise</CardTitle>
                  <CardDescription>Tailored for large organizations.</CardDescription>
                  <div className="pt-6">
                    <span className="text-3xl font-black italic text-slate-900">Contact</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-4 text-sm">
                    <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-accent" /> Unlimited employees</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-accent" /> Dedicated Support Rep</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-accent" /> Custom SLA Agreements</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full h-12 font-bold border-2">Contact Sales</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* trust indicators */}
        <section className="py-24 container mx-auto px-4 text-center">
          <h2 className="text-sm font-black text-muted-foreground/40 uppercase tracking-[0.3em] mb-12 text-center">Trusted by modern Maltese businesses</h2>
          <div className="flex flex-wrap justify-center items-center gap-16 opacity-30 grayscale pointer-events-none">
            <div className="font-bold text-3xl tracking-tighter">VALLETTA.TECH</div>
            <div className="font-bold text-3xl tracking-tighter">SLIEMA.SOFT</div>
            <div className="font-bold text-3xl tracking-tighter">GOZO.DIGITAL</div>
            <div className="font-bold text-3xl tracking-tighter">ISLAND.SCALE</div>
          </div>
        </section>
      </main>

      <footer className="py-16 bg-white border-t border-slate-200">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2 space-y-6">
              <div className="flex items-center gap-2 font-bold text-2xl tracking-tight text-slate-900">
                <Image src="/icon.svg" alt="PayrollPal Malta Logo" width={32} height={32} />
                PayrollPal <span className="text-primary">Malta</span>
              </div>
              <p className="text-muted-foreground max-w-sm leading-relaxed font-medium">
                The international standard for Maltese payroll infrastructure. Precision automated compliance for the modern workforce.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-primary">Compliance</h4>
              <nav className="flex flex-col gap-2 text-sm font-medium text-muted-foreground">
                <Link href="/privacy" className="hover:text-primary transition-colors">Data Protection</Link>
                <Link href="/terms" className="hover:text-primary transition-colors">Service Agreement</Link>
                <Link href="/contact" className="hover:text-primary transition-colors">Malta Support</Link>
              </nav>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-primary">Platform</h4>
              <nav className="flex flex-col gap-2 text-sm font-medium text-muted-foreground">
                <Link href="#features" className="hover:text-primary transition-colors">Infrastructure</Link>
                <Link href="#pricing" className="hover:text-primary transition-colors">Subscription</Link>
                <Link href="/security" className="hover:text-primary transition-colors">Security</Link>
              </nav>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
            <div>© 2026 PayrollPal Malta Technologies. All rights reserved.</div>
            <div className="flex gap-6">
              <span>GDPR Compliant</span>
              <span>ISO 27001 Certified</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
