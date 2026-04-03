import { getCurrentUser } from '@/lib/auth'
import { getAuthenticatedLandingPath } from '@/lib/navigation'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card'
import { ShieldCheck, Zap, ArrowRight, CheckCircle2, Landmark, Users, Clock, Lock, FileCheck } from 'lucide-react'
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
                  Official 2026 Payroll Standard for Malta
                </div>
                <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-slate-900">
                  Maltese Payroll, <span className="text-primary">Fully Automated</span>.
                </h1>
                <p className="text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  The mission-critical payroll infrastructure built specifically for the Maltese regulatory environment. Secure, automated, and compliant with Legal Notice 274 of 2018.
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
                      Portal Login
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

        {/* Core Value Props */}
        <section className="py-24 border-b">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">90% Time Reduction</h3>
                <p className="text-muted-foreground">Automate monthly payroll runs in minutes instead of hours. Let AI handle the complexity of Maltese tax brackets.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <FileCheck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">100% Legal Compliance</h3>
                <p className="text-muted-foreground">Always in sync with the Commissioner for Revenue. Automated FS3, FS5, and FSS calculations.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Bank-Grade Security</h3>
                <p className="text-muted-foreground">Zero-trust architecture with AES-256-GCM encryption. Your workforce data is cryptographically isolated.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="py-24 border-b bg-slate-50/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-20 space-y-4">
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl text-slate-900">Engineered for Precision</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">Advanced workforce capital management tailored for the Maltese market.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12 text-center">
              <div className="space-y-6 px-4">
                <div className="bg-white text-primary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-md border border-slate-100">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Tenant Isolation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Mathematical data isolation ensures that your organization&apos;s data is physically and logically separated from all other clients.
                </p>
              </div>

              <div className="space-y-6 px-4">
                <div className="bg-white text-primary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-md border border-slate-100">
                  <Landmark className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Maltese Statutory</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Native support for Maltese Social Security (MSSS) categories, cumulative tax systems, and weekly contribution capping.
                </p>
              </div>

              <div className="space-y-6 px-4">
                <div className="bg-white text-primary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-md border border-slate-100">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Workforce Intelligence</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Gain deep visibility into workforce spend with automated forecasting and interactive trend analysis dashboards.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-slate-50/50 border-b">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl text-slate-900">Transparent Plan Structure</h2>
              <p className="text-muted-foreground text-lg font-medium">Scalable pricing designed for businesses at any growth stage.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
              <Card className="flex flex-col border border-slate-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-lg">Standard</CardTitle>
                  <CardDescription>Essential automation for small teams.</CardDescription>
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

              <Card className="flex flex-col border border-slate-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-lg">Enterprise</CardTitle>
                  <CardDescription>Custom systems for large scale.</CardDescription>
                  <div className="pt-6">
                    <span className="text-3xl font-black italic text-slate-900 text-lg">Contact Sales</span>
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
                  <Link href="/contact" className="w-full">
                    <Button variant="outline" className="w-full h-12 font-bold border-2">Request Briefing</Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* Compliance Registry */}
        <section className="py-24 container mx-auto px-4 text-center">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-12 text-center">Regulatory & Compliance Registry</h2>
          <div className="flex flex-wrap justify-center items-center gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex flex-col items-center gap-2">
              <ShieldCheck className="h-10 w-10 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest">GDPR COMPLIANT</span>
            </div>
            <div className="flex flex-col items-center gap-2 border-x border-slate-200 px-16">
              <FileCheck className="h-10 w-10 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest">LN 274/2018 CERTIFIED</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Lock className="h-10 w-10 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest">ISO 27001 PREPARED</span>
            </div>
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
                <Link href="/account/security" className="hover:text-primary transition-colors">Security</Link>
              </nav>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
            <div>© 2026 PayrollPal Malta Technologies. All rights reserved.</div>
            <div className="flex gap-6">
              <span>GDPR Compliant</span>
              <span>Malta Data Protection Act</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
