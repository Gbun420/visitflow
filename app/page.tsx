import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getAuthenticatedLandingPath } from '@/lib/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, ShieldCheck, Bot, Calculator, Landmark } from 'lucide-react'

export default async function HomePage() {
  const user = await getCurrentUser()
  
  // If user is logged in and has a company, send them to dashboard
  if (user?.company) {
    redirect(getAuthenticatedLandingPath(user))
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 lg:py-32 bg-muted/30">
          <div className="container px-4 text-center space-y-8">
            <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-primary/10 text-primary border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Bot className="w-4 h-4 mr-2" />
              AI-Powered Payroll for Malta
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
              Maltese Payroll, <span className="text-primary">Fully Automated</span> with AI.
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The first AI-native payroll platform built specifically for Maltese SMEs. Tax, Social Security (MSSS), and FS3/FS5 submissions handled in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/signup">
                <Button size="lg" className="px-8 py-6 text-lg font-semibold w-full sm:w-auto">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg font-semibold w-full sm:w-auto">
                  Book a Demo
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 container px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Built for Malta Compliance</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Everything you need to stay compliant with the Commissioner for Revenue and Social Security Department.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Calculator className="w-10 h-10 text-primary mb-2" />
                <CardTitle>AI Calculations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">GPT-4o powered calculations that handle partial months, benefits-in-kind, and complex tax brackets with 100% precision.</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Landmark className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Automatic Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Generate FS3, FS5, and FS7 reports automatically. One-click submission to Maltese authorities coming soon.</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <ShieldCheck className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Secure & Private</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">End-to-end encryption for sensitive employee data. Fully GDPR compliant with local Malta data residency options.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Highlight Section */}
        <section className="bg-primary text-primary-foreground py-24">
          <div className="container px-4 flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">Stop calculating MSSS on spreadsheets.</h2>
              <p className="text-primary-foreground/80 text-lg">
                Our AI understands the Maltese Social Security rates, weekly caps, and maternity fund contributions so you don&apos;t have to.
              </p>
              <ul className="space-y-3">
                {[
                  "Cumulative Tax Calculation",
                  "MSSS Weekly Capping",
                  "Benefit-in-Kind Valuations",
                  "Automatic Pro-rata for new joins"
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 bg-background/10 rounded-2xl p-8 backdrop-blur-sm border border-white/10 w-full">
               <div className="space-y-4">
                  <div className="h-4 w-3/4 bg-white/20 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-white/20 rounded animate-pulse" />
                  <div className="pt-4 grid grid-cols-2 gap-4">
                    <div className="h-20 bg-white/10 rounded" />
                    <div className="h-20 bg-white/10 rounded" />
                  </div>
                  <div className="h-40 bg-white/10 rounded" />
               </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 container px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Scales with your business. No hidden fees.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Basic</CardTitle>
                <div className="pt-2">
                  <span className="text-4xl font-bold">€19</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <p className="text-sm text-muted-foreground">For small teams starting out.</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Up to 5 employees</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> AI Calculations</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Email Support</li>
                </ul>
              </CardContent>
              <div className="p-6 pt-0 mt-auto">
                <Button className="w-full" variant="outline">Choose Basic</Button>
              </div>
            </Card>

            <Card className="flex flex-col border-primary border-2 relative">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] px-2 py-1 rounded-bl-lg font-bold uppercase tracking-wider">Most Popular</div>
              <CardHeader>
                <CardTitle>Professional</CardTitle>
                <div className="pt-2">
                  <span className="text-4xl font-bold">€49</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <p className="text-sm text-muted-foreground">For growing Maltese SMEs.</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Up to 25 employees</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Automatic FS3/FS5</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Priority AI Chat</li>
                </ul>
              </CardContent>
              <div className="p-6 pt-0 mt-auto">
                <Button className="w-full">Choose Pro</Button>
              </div>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <div className="pt-2">
                  <span className="text-4xl font-bold">€149</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <p className="text-sm text-muted-foreground">For larger organizations.</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Unlimited employees</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Dedicated Account Manager</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Custom API Access</li>
                </ul>
              </CardContent>
              <div className="p-6 pt-0 mt-auto">
                <Button className="w-full" variant="outline">Contact Sales</Button>
              </div>
            </Card>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-muted/50 text-center">
          <div className="container px-4 space-y-8">
            <h2 className="text-3xl font-bold sm:text-4xl">Ready to automate your payroll?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Join dozens of Maltese businesses saving hours every month with AI-powered payroll.</p>
            <Link href="/signup">
              <Button size="lg" className="px-10 h-14 text-lg font-bold">
                Get Started for Free
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-background">
        <div className="container px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-bold text-xl">PayrollPal Malta</div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} PayrollPal Malta. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-primary underline-offset-4 hover:underline">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary underline-offset-4 hover:underline">Terms of Service</Link>
            <Link href="#" className="hover:text-primary underline-offset-4 hover:underline">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
