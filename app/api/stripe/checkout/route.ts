import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_PRICES } from '@/lib/stripe';
import { getCurrentUser } from '@/lib/auth';
import { resolvePublicUrl } from '@/lib/url-resolver';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !user.company) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { tier } = await req.json();
  if (!tier || !['BASIC', 'PRO', 'ENTERPRISE'].includes(tier)) {
    return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
  }

  const priceId = STRIPE_PRICES[tier as keyof typeof STRIPE_PRICES];
  if (!priceId) {
    return NextResponse.json({ error: 'Price not configured for this tier' }, { status: 500 });
  }

  const appUrl = resolvePublicUrl();
  const company = user.company;

  try {
    const session = await stripe.checkout.sessions.create({
      customer: company.stripeCustomerId || undefined,
      customer_email: company.stripeCustomerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${appUrl}/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/dashboard/billing?canceled=true`,
      client_reference_id: company.id,
      metadata: {
        companyId: company.id,
        userId: user.id,
        tier: tier,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
