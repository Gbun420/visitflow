import { NextRequest, NextResponse } from 'next/server';
import { stripe, priceIdToTier } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { Tier, StripeSubscriptionStatus } from '@prisma/client';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const session = event.data.object as any;

  switch (event.type) {
    case 'checkout.session.completed': {
      const companyId = session.client_reference_id || session.metadata?.companyId;
      if (!companyId) break;

      const subscriptionId = session.subscription as string;
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0].price.id;
      const tier = priceIdToTier(priceId) || Tier.FREE;

      await prisma.company.update({
        where: { id: companyId },
        data: {
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: subscriptionId,
          stripePriceId: priceId,
          subscriptionTier: tier,
          subscriptionStatus: StripeSubscriptionStatus.ACTIVE,
          subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
      });
      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscriptionId = session.id;
      const company = await prisma.company.findFirst({
        where: { stripeSubscriptionId: subscriptionId },
      });

      if (!company) break;

      const priceId = session.items.data[0].price.id;
      const tier = priceIdToTier(priceId) || Tier.FREE;
      
      const stripeStatusMap: Record<string, StripeSubscriptionStatus> = {
        active: 'ACTIVE',
        past_due: 'PAST_DUE',
        canceled: 'CANCELED',
        unpaid: 'UNPAID',
        trialing: 'TRIALING',
        incomplete: 'INCOMPLETE',
        incomplete_expired: 'INCOMPLETE_EXPIRED',
      }
      const mappedStatus = stripeStatusMap[session.status] || 'INACTIVE' as StripeSubscriptionStatus;

      await prisma.company.update({
        where: { id: company.id },
        data: {
          subscriptionTier: tier,
          subscriptionStatus: mappedStatus,
          subscriptionCurrentPeriodEnd: new Date(session.current_period_end * 1000),
          subscriptionCancelAtPeriodEnd: session.cancel_at_period_end,
        },
      });
      break;
    }

    case 'invoice.payment_succeeded': {
      const subscriptionId = session.subscription as string;
      if (!subscriptionId) break;

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      const company = await prisma.company.findFirst({
        where: { stripeSubscriptionId: subscriptionId },
      });

      if (company) {
        await prisma.company.update({
          where: { id: company.id },
          data: {
            subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            subscriptionStatus: StripeSubscriptionStatus.ACTIVE,
          },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
