import { prisma } from '@/lib/prisma'
import { getPlanLimits as getBasePlanLimits } from '@/lib/plan-limits'

export type PlanType = 'free' | 'basic' | 'premium'

export interface SubscriptionLimits {
  widgets: number
  leadsPerMonth: number
  analytics: boolean
  whiteLabel: boolean
  prioritySupport: boolean
}

// Ottieni i limiti per un piano
export function getPlanLimits(planType: PlanType): SubscriptionLimits {
  const baseLimits = getBasePlanLimits(planType)
  return {
    widgets: baseLimits.maxWidgets,
    leadsPerMonth: baseLimits.maxLeadsPerMonth,
    analytics: baseLimits.analytics,
    whiteLabel: baseLimits.customCss, // white-label include CSS custom
    prioritySupport: baseLimits.prioritySupport
  }
}

// Verifica se un'agenzia ha raggiunto il limite widget
export async function checkWidgetLimit(agencyId: string): Promise<{
  allowed: boolean
  current: number
  limit: number
  message?: string
}> {
  const agency = await prisma.agency.findUnique({
    where: { id: agencyId },
    include: {
      widgetConfigs: { where: { isActive: true } },
      subscription: true
    }
  })

  if (!agency) {
    return { allowed: false, current: 0, limit: 0, message: 'Agenzia non trovata' }
  }

  const planType = (agency.subscription?.planType || agency.piano || 'free') as PlanType
  const limits = getPlanLimits(planType)
  const currentWidgets = agency.widgetConfigs.length

  if (currentWidgets >= limits.widgets) {
    return {
      allowed: false,
      current: currentWidgets,
      limit: limits.widgets,
      message: `Limite widget raggiunto (${currentWidgets}/${limits.widgets}). Passa a un piano superiore per creare più widget.`
    }
  }

  return {
    allowed: true,
    current: currentWidgets,
    limit: limits.widgets
  }
}

// Verifica se un'agenzia ha raggiunto il limite lead mensili
export async function checkLeadLimit(agencyId: string): Promise<{
  allowed: boolean
  current: number
  limit: number
  message?: string
}> {
  const agency = await prisma.agency.findUnique({
    where: { id: agencyId },
    include: { subscription: true }
  })

  if (!agency) {
    return { allowed: false, current: 0, limit: 0, message: 'Agenzia non trovata' }
  }

  const planType = (agency.subscription?.planType || agency.piano || 'free') as PlanType
  const limits = getPlanLimits(planType)

  // -1 significa illimitati
  if (limits.leadsPerMonth === -1) {
    return { allowed: true, current: 0, limit: -1 }
  }

  // Conta lead del mese corrente
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const currentLeads = await prisma.lead.count({
    where: {
      agenziaId: agencyId,
      dataRichiesta: { gte: startOfMonth }
    }
  })

  if (currentLeads >= limits.leadsPerMonth) {
    return {
      allowed: false,
      current: currentLeads,
      limit: limits.leadsPerMonth,
      message: `Limite lead mensili raggiunto (${currentLeads}/${limits.leadsPerMonth}). Passa a un piano superiore per ricevere più lead.`
    }
  }

  return {
    allowed: true,
    current: currentLeads,
    limit: limits.leadsPerMonth
  }
}

// Verifica se un'agenzia ha accesso alle analytics
export async function checkAnalyticsAccess(agencyId: string): Promise<boolean> {
  const agency = await prisma.agency.findUnique({
    where: { id: agencyId },
    include: { subscription: true }
  })

  if (!agency) return false

  const planType = (agency.subscription?.planType || agency.piano || 'free') as PlanType
  const limits = getPlanLimits(planType)
  return limits.analytics
}

// Verifica se un'agenzia ha accesso al white-label
export async function checkWhiteLabelAccess(agencyId: string): Promise<boolean> {
  const agency = await prisma.agency.findUnique({
    where: { id: agencyId },
    include: { subscription: true }
  })

  if (!agency) return false

  const planType = (agency.subscription?.planType || agency.piano || 'free') as PlanType
  const limits = getPlanLimits(planType)
  return limits.whiteLabel
}

// Ottieni utilizzo corrente dell'agenzia
export async function getAgencyUsage(agencyId: string): Promise<{
  widgets: { current: number; limit: number; percentage: number }
  leads: { current: number; limit: number; percentage: number }
  planType: PlanType
  hasAnalytics: boolean
  hasWhiteLabel: boolean
}> {
  const agency = await prisma.agency.findUnique({
    where: { id: agencyId },
    include: {
      widgetConfigs: { where: { isActive: true } },
      subscription: true
    }
  })

  if (!agency) {
    throw new Error('Agenzia non trovata')
  }

  const planType = (agency.subscription?.planType || agency.piano || 'free') as PlanType
  const limits = getPlanLimits(planType)

  // Conta widget attivi
  const currentWidgets = agency.widgetConfigs.length

  // Conta lead del mese
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const currentLeads = await prisma.lead.count({
    where: {
      agenziaId: agencyId,
      dataRichiesta: { gte: startOfMonth }
    }
  })

  const widgetPercentage = limits.widgets > 0
    ? Math.min(100, (currentWidgets / limits.widgets) * 100)
    : 0

  const leadPercentage = limits.leadsPerMonth > 0
    ? Math.min(100, (currentLeads / limits.leadsPerMonth) * 100)
    : 0

  return {
    widgets: {
      current: currentWidgets,
      limit: limits.widgets,
      percentage: widgetPercentage
    },
    leads: {
      current: currentLeads,
      limit: limits.leadsPerMonth,
      percentage: leadPercentage
    },
    planType,
    hasAnalytics: limits.analytics,
    hasWhiteLabel: limits.whiteLabel
  }
}

// Verifica se il trial è scaduto
export async function isTrialExpired(agencyId: string): Promise<boolean> {
  const subscription = await prisma.subscription.findUnique({
    where: { agencyId }
  })

  if (!subscription || subscription.status !== 'trial') return false
  if (!subscription.trialEndsAt) return false

  return new Date() > subscription.trialEndsAt
}

// Ottieni giorni rimanenti del trial
export async function getTrialDaysRemaining(agencyId: string): Promise<number | null> {
  const subscription = await prisma.subscription.findUnique({
    where: { agencyId }
  })

  if (!subscription || subscription.status !== 'trial' || !subscription.trialEndsAt) {
    return null
  }

  const now = new Date()
  const trialEnd = new Date(subscription.trialEndsAt)
  const diffTime = trialEnd.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return Math.max(0, diffDays)
}
