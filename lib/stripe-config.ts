// Stripe Price IDs for Malta SaaS
// Replace these with actual IDs from Stripe Dashboard in PRODUCTION
// Fix #10: Replacing dummy price IDs

export const STRIPE_PRICES = {
  BASIC: process.env.STRIPE_PRICE_BASIC || 'price_basic_2024_mt_1',
  PRO: process.env.STRIPE_PRICE_PRO || 'price_pro_2024_mt_2',
  ENTERPRISE: process.env.STRIPE_PRICE_ENTERPRISE || 'price_ent_2024_mt_3'
}

export const STRIPE_CONFIG = {
  SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
  PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
}
