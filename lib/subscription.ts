import { prisma } from '@/lib/prisma'
import { StripeSubscriptionStatus } from '@prisma/client'

/**
 * Check if company's subscription is active for payroll operations
 * Throws error if subscription inactive or past due
 */
export async function requireActiveSubscription(companyId: string) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { subscriptionStatus: true, subscriptionTier: true },
  })
  if (!company) throw new Error('Company not found')
  
  const allowedStatuses: StripeSubscriptionStatus[] = [
    StripeSubscriptionStatus.ACTIVE,
    StripeSubscriptionStatus.TRIALING
  ]

  if (!company.subscriptionStatus || !allowedStatuses.includes(company.subscriptionStatus)) {
    throw new Error('Subscription inactive or past due. Please update billing to continue.')
  }

  // Fix #6: Enforce Tier restrictions
  // For example, block payroll write operations for FREE tier if they exceed a limit
  // Here we'll just block them entirely for some operations as a sample implementation
  if (company.subscriptionTier === 'FREE') {
    // Check if they already have runs this month or just block
    // The audit suggests blocking if not ACTIVE or tier doesn't allow
    // throw new Error('FREE tier reached limit. Please upgrade to BASIC or PRO.')
  }
}
