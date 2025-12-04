import Stripe from 'stripe'

// Lazy initialization per evitare errori durante il build
let stripeInstance: Stripe | null = null

export const getStripeInstance = (): Stripe => {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
      typescript: true,
    })
  }
  return stripeInstance
}

// Export per retrocompatibilità - usa getter per lazy loading
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getStripeInstance() as any)[prop]
  }
})

// Piani e prezzi - Gestiti via API senza prodotti Stripe
export const STRIPE_PLANS = {
  free: {
    name: 'Free',
    priceMonthly: 0, // Gratuito
    priceId: null, // Nessun pagamento richiesto
    features: [
      '1 widget',
      '5 valutazioni/mese',
      'Supporto email'
    ],
    limits: {
      widgets: 1,
      valuationsPerMonth: 5,
      analytics: false,
      whiteLabel: false,
      prioritySupport: false
    }
  },
  basic: {
    name: 'Basic',
    priceMonthly: 50, // €50/mese
    priceId: process.env.STRIPE_PRICE_BASIC_MONTHLY,
    features: [
      '3 widget',
      '50 valutazioni/mese',
      'Analytics completo',
      'Supporto prioritario',
      'Custom branding'
    ],
    limits: {
      widgets: 3,
      valuationsPerMonth: 50,
      analytics: true,
      whiteLabel: false,
      prioritySupport: true
    }
  },
  premium: {
    name: 'Premium',
    priceMonthly: 100, // €100/mese
    priceId: process.env.STRIPE_PRICE_PREMIUM_MONTHLY,
    features: [
      '10 widget',
      '150 valutazioni/mese',
      'Analytics avanzato',
      'White-label',
      'Supporto dedicato',
      'API access',
      'Custom CSS'
    ],
    limits: {
      widgets: 10,
      valuationsPerMonth: 150,
      analytics: true,
      whiteLabel: true,
      prioritySupport: true
    }
  }
} as const

// Prezzo valutazioni extra
export const EXTRA_VALUATION_PRICE = 150 // €1.50 in centesimi

export type PlanType = keyof typeof STRIPE_PLANS

// Helper per ottenere info piano
export function getPlanInfo(planType: PlanType) {
  return STRIPE_PLANS[planType] || STRIPE_PLANS.free
}

// Helper per verificare se un piano è a pagamento
export function isPaidPlan(planType: PlanType): boolean {
  return planType !== 'free'
}

// Helper per confrontare piani (per upgrade/downgrade)
export function comparePlans(currentPlan: PlanType, newPlan: PlanType): 'upgrade' | 'downgrade' | 'same' {
  const planOrder = { free: 0, basic: 1, premium: 2 }
  const current = planOrder[currentPlan] || 0
  const newLevel = planOrder[newPlan] || 0

  if (newLevel > current) return 'upgrade'
  if (newLevel < current) return 'downgrade'
  return 'same'
}
