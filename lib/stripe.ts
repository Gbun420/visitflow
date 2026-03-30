import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})

export const formatEuro = (amountCents: number) => {
  return (amountCents / 100).toFixed(2)
}

export const calculateProRata = (annualEur: number, monthsUsed: number, totalMonths: number = 12) => {
  return Math.round((annualEur / totalMonths) * monthsUsed * 100)
}
