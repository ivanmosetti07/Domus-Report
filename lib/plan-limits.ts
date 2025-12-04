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

// Prezzi piani (in centesimi EUR)
export const PLAN_PRICES = {
  free: 0,
  basic: 5000, // €50/mese
  premium: 10000, // €100/mese
} as const

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

export function getPlanPrice(planType: string): number {
  return PLAN_PRICES[planType as keyof typeof PLAN_PRICES] || 0
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

export function getMaxValutationsPerMonth(planType: string): number {
  return getPlanLimits(planType).maxValutationsPerMonth
}
