// Piano limiti per agenzie
// Definisce i limiti di utilizzo per ogni piano

export interface PlanLimits {
  maxWidgets: number
  maxLeadsPerMonth: number
  customBranding: boolean
  customCss: boolean
  emailNotifications: boolean
  analytics: boolean
  apiAccess: boolean
  prioritySupport: boolean
}

export const planLimits: Record<string, PlanLimits> = {
  free: {
    maxWidgets: 1,
    maxLeadsPerMonth: 50,
    customBranding: false,
    customCss: false,
    emailNotifications: true,
    analytics: false,
    apiAccess: false,
    prioritySupport: false,
  },
  basic: {
    maxWidgets: 3,
    maxLeadsPerMonth: 100,
    customBranding: true,
    customCss: false,
    emailNotifications: true,
    analytics: true,
    apiAccess: false,
    prioritySupport: true,
  },
  premium: {
    maxWidgets: 10,
    maxLeadsPerMonth: -1, // illimitati
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

export function getMaxLeadsPerMonth(planType: string): number {
  return getPlanLimits(planType).maxLeadsPerMonth
}
