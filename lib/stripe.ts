import Stripe from 'stripe'
import { Tier } from '@prisma/client'

export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-04-10',
      typescript: true,
    })
  : null as unknown as Stripe

// Price IDs for Malta payroll SaaS (configure in Stripe dashboard)
export const STRIPE_PRICES = {
  FREE: process.env.STRIPE_PRICE_FREE,
  BASIC: process.env.STRIPE_PRICE_BASIC,
  PRO: process.env.STRIPE_PRICE_PRO,
  ENTERPRISE: process.env.STRIPE_PRICE_ENTERPRISE,
} as const

// Map Stripe price ID to our Tier enum
export function priceIdToTier(priceId: string): Tier | null {
  const entries = Object.entries(STRIPE_PRICES) as [Tier, string | undefined][]
  const found = entries.find(([, id]) => id === priceId)
  return found ? found[0] : null
}

// Tier to price ID (for creating checkout sessions)
export function tierToPriceId(tier: Tier): string | undefined {
  return STRIPE_PRICES[tier]
}
