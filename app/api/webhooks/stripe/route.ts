import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-04-30.basil' })

// POST /api/webhooks/stripe
// Handles Stripe subscription events
export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  try {
    const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      const customerId = subscription.customer
      const company = await prisma.company.findFirst({
        where: { stripeCustomerId: customerId as string },
      })
      if (company) {
        const status = subscription.status === 'active' ? 'ACTIVE' : 'SUSPENDED'
        await prisma.company.update({
          where: { id: company.id },
          data: { status },
        })
      }
      break
    }

    case 'invoice.paid': {
      const invoice = event.data.object
      if (invoice.subscription) {
        const company = await prisma.company.findFirst({
          where: { stripeCustomerId: invoice.customer as string },
        })
        if (company) {
          await prisma.company.update({
            where: { id: company.id },
            data: { status: 'ACTIVE' },
          })
        }
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object
      const company = await prisma.company.findFirst({
        where: { stripeCustomerId: invoice.customer as string },
      })
      if (company) {
        await prisma.company.update({
          where: { id: company.id },
          data: { status: 'SUSPENDED' },
        })
      }
      break
    }

    default:
      console.log(`Unhandled Stripe event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
