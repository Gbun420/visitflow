import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, CreditCard, Zap } from 'lucide-react';
import { UpgradeButton } from '@/components/upgrade-button';

export default async function BillingPage() {
  const user = await getCurrentUser();
  if (!user || !user.company) {
    redirect('/login');
  }

  const company = user.company;
  const isPro = company.subscriptionTier !== 'FREE' && 
                company.subscriptionStatus === 'ACTIVE' && 
                company.subscriptionCurrentPeriodEnd && 
                new Date(company.subscriptionCurrentPeriodEnd) > new Date();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your company plan and payment methods.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Current Plan Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Your organization is currently on the {company.subscriptionTier} plan.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={isPro ? "default" : "secondary"} className="text-lg px-3 py-1">
                {isPro ? 'Pro' : 'Free'}
              </Badge>
              {isPro && company.subscriptionCurrentPeriodEnd && (
                <span className="text-sm text-muted-foreground">
                  Renews on {new Date(company.subscriptionCurrentPeriodEnd).toLocaleDateString()}
                </span>
              )}
            </div>
            
            <ul className="space-y-2 text-sm pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Up to {company.subscriptionTier === 'FREE' ? '5' : 'Unlimited'} employees</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>AI-powered payroll calculations</span>
              </li>
              {isPro && (
                <>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Automatic FS3/FS5 submissions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Priority email support</span>
                  </li>
                </>
              )}
            </ul>
          </CardContent>
          <CardFooter className="border-t pt-6">
            {!isPro && <UpgradeButton tier="PRO" />}
            {isPro && (
              <Button variant="outline" className="w-full" disabled>
                <CreditCard className="mr-2 h-4 w-4" />
                Manage in Stripe
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Why Upgrade? */}
        {!isPro && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Why upgrade to Pro?</h2>
            <div className="grid gap-4">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Unlimited Growth</h3>
                  <p className="text-sm text-muted-foreground">Scale your business without worrying about employee limits.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Full Compliance</h3>
                  <p className="text-sm text-muted-foreground">Automatic generation and one-click submission of mandatory Maltese tax documents.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
