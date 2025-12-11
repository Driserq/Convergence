import Stripe from 'stripe'
import type { PlanCode } from '../types/subscription.js'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const STRIPE_PRICE_WEEKLY = process.env.STRIPE_PRICE_WEEKLY
const STRIPE_PRICE_MONTHLY = process.env.STRIPE_PRICE_MONTHLY

if (!STRIPE_SECRET_KEY) {
  console.warn('[Stripe] STRIPE_SECRET_KEY is not set. Stripe features will not work.')
}

export const stripe = new Stripe(STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-11-17.clover',
  typescript: true
})

export const getPriceIdForPlan = (planCode: PlanCode): string | null => {
  switch (planCode) {
    case 'weekly':
      return STRIPE_PRICE_WEEKLY || null
    case 'monthly':
      return STRIPE_PRICE_MONTHLY || null
    default:
      return null
  }
}

export const getPlanCodeForPriceId = (priceId: string): PlanCode | null => {
  if (priceId === STRIPE_PRICE_WEEKLY) return 'weekly'
  if (priceId === STRIPE_PRICE_MONTHLY) return 'monthly'
  return null
}
