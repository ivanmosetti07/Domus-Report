import { prisma } from '@/lib/prisma'
import { getPlanLimits as getBasePlanLimits, EXTRA_VALUATION_PRICE } from '@/lib/plan-limits'

export type PlanType = 'free' | 'basic' | 'premium'

export interface SubscriptionLimits {
  widgets: number
  valuationsPerMonth: number
  analytics: boolean
  whiteLabel: boolean
  prioritySupport: boolean
}

// Ottieni i limiti per un piano
export function getPlanLimits(planType: PlanType): SubscriptionLimits {
  const baseLimits = getBasePlanLimits(planType)
  return {
    widgets: baseLimits.maxWidgets,
    valuationsPerMonth: baseLimits.maxValutationsPerMonth,
    analytics: baseLimits.analytics,
    whiteLabel: baseLimits.customCss, // white-label include CSS custom
    prioritySupport: baseLimits.prioritySupport
  }
}

// Prezzo valutazione extra in centesimi
export { EXTRA_VALUATION_PRICE }

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

  // Verifica se il trial è scaduto
  const subscription = agency.subscription
  if (subscription?.status === 'trial' && subscription.trialEndsAt) {
    if (new Date() > subscription.trialEndsAt) {
      // Trial scaduto - usa limiti del piano free
      const freeLimits = getPlanLimits('free')
      const currentWidgets = agency.widgetConfigs.length

      if (currentWidgets >= freeLimits.widgets) {
        return {
          allowed: false,
          current: currentWidgets,
          limit: freeLimits.widgets,
          message: `Il tuo trial è scaduto. Limite widget raggiunto (${currentWidgets}/${freeLimits.widgets}). Effettua l'upgrade per creare più widget.`
        }
      }

      return {
        allowed: true,
        current: currentWidgets,
        limit: freeLimits.widgets
      }
    }
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

// Verifica se un'agenzia ha raggiunto il limite valutazioni mensili
export async function checkValuationLimit(agencyId: string): Promise<{
  allowed: boolean
  current: number
  limit: number
  extra: number
  message?: string
}> {
  const agency = await prisma.agency.findUnique({
    where: { id: agencyId },
    include: { subscription: true }
  })

  if (!agency) {
    return { allowed: false, current: 0, limit: 0, extra: 0, message: 'Agenzia non trovata' }
  }

  const subscription = agency.subscription

  // Reset mensile se necessario
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  let valuationsUsed = subscription?.valuationsUsedThisMonth || 0
  let extraValuations = subscription?.extraValuationsPurchased || 0

  // Se il reset date è di un mese precedente, resetta SOLO il contatore delle valutazioni usate
  // I crediti extra (extraValuationsPurchased) sono CUMULATIVI e NON vengono azzerati
  if (subscription?.valuationsResetDate && subscription.valuationsResetDate < startOfMonth) {
    valuationsUsed = 0
    // extraValuations NON viene azzerato - i crediti extra sono cumulativi!
    // Aggiorna il database
    await prisma.subscription.update({
      where: { agencyId },
      data: {
        valuationsUsedThisMonth: 0,
        // extraValuationsPurchased NON viene toccato
        valuationsResetDate: startOfMonth
      }
    })
  }

  // Verifica se il trial è scaduto
  let planType: PlanType
  if (subscription?.status === 'trial' && subscription.trialEndsAt) {
    if (now > subscription.trialEndsAt) {
      // Trial scaduto - usa limiti del piano free
      planType = 'free'
    } else {
      // Trial ancora attivo
      planType = (subscription.planType || 'free') as PlanType
    }
  } else {
    planType = (subscription?.planType || agency.piano || 'free') as PlanType
  }

  const limits = getPlanLimits(planType)

  // Limite totale = limite piano + valutazioni extra acquistate
  const totalLimit = limits.valuationsPerMonth + extraValuations

  if (valuationsUsed >= totalLimit) {
    const message = planType === 'free' && subscription?.status === 'trial'
      ? `Il tuo trial è scaduto. Limite valutazioni mensili raggiunto (${valuationsUsed}/${totalLimit}). Effettua l'upgrade per ottenere più valutazioni.`
      : `Limite valutazioni mensili raggiunto (${valuationsUsed}/${totalLimit}). Acquista valutazioni extra o passa a un piano superiore.`

    return {
      allowed: false,
      current: valuationsUsed,
      limit: limits.valuationsPerMonth,
      extra: extraValuations,
      message
    }
  }

  return {
    allowed: true,
    current: valuationsUsed,
    limit: limits.valuationsPerMonth,
    extra: extraValuations
  }
}

// Incrementa il contatore valutazioni usate
export async function incrementValuationCount(agencyId: string): Promise<void> {
  const subscription = await prisma.subscription.findUnique({
    where: { agencyId }
  })

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  if (subscription) {
    // Se reset date è di un mese precedente, resetta prima (ma mantieni crediti extra)
    if (!subscription.valuationsResetDate || subscription.valuationsResetDate < startOfMonth) {
      await prisma.subscription.update({
        where: { agencyId },
        data: {
          valuationsUsedThisMonth: 1,
          // extraValuationsPurchased NON viene toccato - crediti extra cumulativi
          valuationsResetDate: startOfMonth
        }
      })
    } else {
      await prisma.subscription.update({
        where: { agencyId },
        data: {
          valuationsUsedThisMonth: { increment: 1 }
        }
      })
    }
  } else {
    // Crea subscription se non esiste
    await prisma.subscription.create({
      data: {
        agencyId,
        planType: 'free',
        status: 'active',
        valuationsUsedThisMonth: 1,
        valuationsResetDate: startOfMonth
      }
    })
  }
}

// Aggiungi valutazioni extra acquistate
export async function addExtraValuations(agencyId: string, quantity: number): Promise<void> {
  await prisma.subscription.update({
    where: { agencyId },
    data: {
      extraValuationsPurchased: { increment: quantity }
    }
  })
}

// Verifica se un'agenzia ha accesso alle analytics
export async function checkAnalyticsAccess(agencyId: string): Promise<boolean> {
  const agency = await prisma.agency.findUnique({
    where: { id: agencyId },
    include: { subscription: true }
  })

  if (!agency) return false

  // Verifica se il trial è scaduto
  const subscription = agency.subscription
  if (subscription?.status === 'trial' && subscription.trialEndsAt) {
    if (new Date() > subscription.trialEndsAt) {
      // Trial scaduto - nessun accesso analytics
      return false
    }
  }

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

  // Verifica se il trial è scaduto
  const subscription = agency.subscription
  if (subscription?.status === 'trial' && subscription.trialEndsAt) {
    if (new Date() > subscription.trialEndsAt) {
      // Trial scaduto - nessun accesso white-label
      return false
    }
  }

  const planType = (agency.subscription?.planType || agency.piano || 'free') as PlanType
  const limits = getPlanLimits(planType)
  return limits.whiteLabel
}

// Ottieni utilizzo corrente dell'agenzia
export async function getAgencyUsage(agencyId: string): Promise<{
  widgets: { current: number; limit: number; percentage: number }
  valuations: { current: number; limit: number; extra: number; percentage: number }
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
  const subscription = agency.subscription

  // Conta widget attivi
  const currentWidgets = agency.widgetConfigs.length

  // Valutazioni usate questo mese
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  let valuationsUsed = subscription?.valuationsUsedThisMonth || 0
  let extraValuations = subscription?.extraValuationsPurchased || 0

  // Reset mensile se necessario (solo valutazioni usate, non crediti extra)
  if (subscription?.valuationsResetDate && subscription.valuationsResetDate < startOfMonth) {
    valuationsUsed = 0
    // extraValuations NON viene azzerato - crediti extra cumulativi
  }

  const totalLimit = limits.valuationsPerMonth + extraValuations

  const widgetPercentage = limits.widgets > 0
    ? Math.min(100, (currentWidgets / limits.widgets) * 100)
    : 0

  const valuationPercentage = totalLimit > 0
    ? Math.min(100, (valuationsUsed / totalLimit) * 100)
    : 0

  return {
    widgets: {
      current: currentWidgets,
      limit: limits.widgets,
      percentage: widgetPercentage
    },
    valuations: {
      current: valuationsUsed,
      limit: limits.valuationsPerMonth,
      extra: extraValuations,
      percentage: valuationPercentage
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
