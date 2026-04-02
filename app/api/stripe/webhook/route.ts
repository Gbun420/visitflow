import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { priceIdToTier } from '@/lib/stripe'
import { Tier, StripeSubscriptionStatus } from '@prisma/client'

// POST /api/stripe/webhook
// Verifies signature and handles subscription sync
export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const eventType = event.type
  const data = event.data.object as any

  // Handle subscription events
  if (eventType === 'customer.subscription.created' ||
      eventType === 'customer.subscription.updated' ||
      eventType === 'customer.subscription.deleted') {

    const subscription = data
    const customerId = subscription.customer as string
    const stripeSubscriptionId = subscription.id
    const status = subscription.status as string
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000)
    const cancelAtPeriodEnd = subscription.cancel_at_period_end

    // Find company by stripeCustomerId
    const company = await prisma.company.findFirst({
      where: { stripeCustomerId: customerId },
    })
    if (!company) {
      console.warn(`No company found for Stripe customer ${customerId}`)
      return NextResponse.json({ ok: true })
    }

    // Determine tier from price ID
    let tier: Tier = 'FREE'
    if (subscription.items && subscription.items.data && subscription.items.data.length > 0) {
      const priceId = subscription.items.data[0].price.id
      const inferredTier = priceIdToTier(priceId)
      if (inferredTier) tier = inferredTier
    }

    const stripeStatusMap: Record<string, StripeSubscriptionStatus> = {
      active: 'ACTIVE',
      past_due: 'PAST_DUE',
      canceled: 'CANCELED',
      unpaid: 'UNPAID',
      trialing: 'TRIALING',
      incomplete: 'INCOMPLETE',
      incomplete_expired: 'INCOMPLETE_EXPIRED',
    }
    const mappedStatus = stripeStatusMap[status] || 'INACTIVE' as StripeSubscriptionStatus

    await prisma.company.update({
      where: { id: company.id },
      data: {
        stripeSubscriptionId: stripeSubscriptionId,
        subscriptionTier: tier,
        subscriptionStatus: mappedStatus,
        subscriptionCurrentPeriodEnd: currentPeriodEnd,
        subscriptionCancelAtPeriodEnd: cancelAtPeriodEnd,
      },
    })

    await prisma.auditEvent.create({
      data: {
        companyId: company.id,
        action: `subscription_${eventType.split('.').pop()}`,
        resource: 'Subscription',
        resourceId: stripeSubscriptionId,
        metadata: {
          status: mappedStatus,
          tier,
          cancelAtPeriodEnd,
        },
        ip: 'stripe-webhook',
        userAgent: 'stripe-webhook',
      },
    })
  }

  return NextResponse.json({ ok: true })
}
