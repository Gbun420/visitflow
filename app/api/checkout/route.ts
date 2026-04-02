import { NextRequest, NextResponse } from 'next/server'
import { stripe, tierToPriceId } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { Tier } from '@prisma/client'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST /api/checkout
// Body: { tier: 'BASIC' | 'PRO' | 'ENTERPRISE' }
// Creates a Stripe Checkout Session for the user's company
export async function POST(req: NextRequest) {
  try {
    const appUser = await getCurrentUser()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '')

    if (!appUser?.company) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!appUrl) {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_APP_URL is not configured' },
        { status: 500 }
      )
    }

    const company = appUser.company

    const body = await req.json()
    const { tier } = body as { tier: string }
    if (!tier || !['BASIC', 'PRO', 'ENTERPRISE'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    const priceId = tierToPriceId(tier as Tier)
    if (!priceId) return NextResponse.json({ error: 'Price not configured' }, { status: 500 })

    // Ensure company has a Stripe customer ID; if not, create one
    let customerId = company.stripeCustomerId
    if (!customerId) {
      if (!appUser.email) return NextResponse.json({ error: 'User email missing' }, { status: 400 })
      const customer = await stripe.customers.create({
        email: appUser.email,
        name: company.name,
        metadata: { companyId: company.id },
      })
      customerId = customer.id
      await prisma.company.update({
        where: { id: company.id },
        data: { stripeCustomerId: customerId },
      })
    }

    // Create checkout session
    const session_stripe = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${appUrl}/dashboard?success=true`,
      cancel_url: `${appUrl}/dashboard?canceled=true`,
      metadata: { companyId: company.id, tier },
    })

    return NextResponse.json({ url: session_stripe.url })
  } catch (err: any) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
