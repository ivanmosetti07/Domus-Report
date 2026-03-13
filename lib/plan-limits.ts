// Piano limiti per agenzie
// Definisce i limiti di utilizzo per ogni piano

export interface PlanLimits {
  maxWidgets: number
  maxValutationsPerMonth: number // Valutazioni mensili incluse nel piano
  customBranding: boolean
  customCss: boolean
  emailNotifications: boolean
  analytics: boolean
  apiAccess: boolean
  prioritySupport: boolean
}

// Prezzi piani base mensili (in centesimi EUR)
export const PLAN_PRICES = {
  free: 0,
  basic: 5000, // €50/mese
  premium: 10000, // €100/mese
} as const

// Intervalli di fatturazione
export type BillingInterval = 'monthly' | 'quarterly' | 'yearly'

export const BILLING_INTERVALS: Record<BillingInterval, { label: string; months: number; discount: number }> = {
  monthly: { label: 'Mensile', months: 1, discount: 0 },
  quarterly: { label: 'Trimestrale', months: 3, discount: 0.05 },
  yearly: { label: 'Annuale', months: 12, discount: 0.10 },
}

export const VALID_BILLING_INTERVALS: BillingInterval[] = ['monthly', 'quarterly', 'yearly']

/** Prezzo totale per periodo in centesimi (es. Basic yearly = 54000 = €540) */
export function getPlanPrice(plan: 'free' | 'basic' | 'premium', interval: BillingInterval): number {
  const baseMonthly = PLAN_PRICES[plan]
  if (baseMonthly === 0) return 0
  const { months, discount } = BILLING_INTERVALS[interval]
  return Math.round(baseMonthly * months * (1 - discount))
}

/** Prezzo mensile equivalente in centesimi (es. Basic yearly = 4500 = €45/mese) */
export function getMonthlyEquivalent(plan: 'free' | 'basic' | 'premium', interval: BillingInterval): number {
  const baseMonthly = PLAN_PRICES[plan]
  if (baseMonthly === 0) return 0
  const { discount } = BILLING_INTERVALS[interval]
  return Math.round(baseMonthly * (1 - discount))
}

/** Label prezzo formattato (es. "€142.50/trimestre" o "€45/mese") */
export function formatPlanPrice(plan: 'free' | 'basic' | 'premium', interval: BillingInterval): string {
  if (plan === 'free') return '€0'
  const totalCents = getPlanPrice(plan, interval)
  const total = totalCents / 100
  const suffixes: Record<BillingInterval, string> = {
    monthly: '/mese',
    quarterly: '/trimestre',
    yearly: '/anno',
  }
  return `€${total % 1 === 0 ? total : total.toFixed(2)}${suffixes[interval]}`
}

// Prezzo per valutazione extra (in centesimi EUR)
export const EXTRA_VALUATION_PRICE = 150 // €1.50

export const planLimits: Record<string, PlanLimits> = {
  free: {
    maxWidgets: 1,
    maxValutationsPerMonth: 5,
    customBranding: false,
    customCss: false,
    emailNotifications: true,
    analytics: false,
    apiAccess: false,
    prioritySupport: false,
  },
  basic: {
    maxWidgets: 3,
    maxValutationsPerMonth: 50,
    customBranding: true,
    customCss: false,
    emailNotifications: true,
    analytics: true,
    apiAccess: false,
    prioritySupport: true,
  },
  premium: {
    maxWidgets: 10,
    maxValutationsPerMonth: 150,
    customBranding: true,
    customCss: true,
    emailNotifications: true,
    analytics: true,
    apiAccess: true,
    prioritySupport: true,
  },
}

export function getPlanLimits(planType: string): PlanLimits {
  return planLimits[planType] || planLimits.free
}

export function canCreateWidget(planType: string, currentWidgetCount: number): boolean {
  const limits = getPlanLimits(planType)
  return currentWidgetCount < limits.maxWidgets
}

export function canUseCustomBranding(planType: string): boolean {
  return getPlanLimits(planType).customBranding
}

export function canUseCustomCss(planType: string): boolean {
  return getPlanLimits(planType).customCss
}

