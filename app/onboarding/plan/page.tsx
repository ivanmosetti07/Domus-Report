'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PlanCard } from "@/components/onboarding/plan-card"
import { CardPaymentForm } from "@/components/onboarding/card-payment-form"
import { Building2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { PLAN_PRICES, planLimits, type BillingInterval, BILLING_INTERVALS, formatPlanPrice, getMonthlyEquivalent, getPlanPrice } from "@/lib/plan-limits"
import { trackPlanSelected } from "@/lib/gtag"
import { useToast } from "@/hooks/use-toast"
import { BillingIntervalToggle } from "@/components/ui/billing-interval-toggle"

type PlanType = 'free' | 'basic' | 'premium'

export default function OnboardingPlanPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly')

  // Verifica auth e stato onboarding al mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    // Verifica se onboarding già completato
    fetch('/api/subscription', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.subscription?.onboardingCompletedAt) {
          router.push('/dashboard')
        }
      })
      .catch(() => {}) // ignora errori — il middleware gestisce l'auth
  }, [router])

  const handlePlanSelect = (planType: PlanType) => {
    setSelectedPlan(planType)

    if (planType === 'free') {
      activateFreePlan()
    } else {
      setShowPaymentDialog(true)
    }
  }

  const activateFreePlan = async () => {
    setIsLoading(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/onboarding/select-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ planType: 'free' })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Errore durante la selezione del piano')
      }

      trackPlanSelected({ planType: 'free', value: 0, hasTrial: false })
      router.push('/onboarding/welcome')
    } catch (error) {
      console.error('Error selecting free plan:', error)
      toast({
        title: 'Errore',
        description: 'Errore durante la selezione del piano. Riprova.',
        variant: 'destructive'
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-surface to-background">
      <div className="container max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4 border-2 border-primary/30 shadow-glow-primary">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Scegli il piano perfetto per te
          </h1>
          <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
            Inizia con il piano che meglio si adatta alle tue esigenze. Puoi cambiare o annullare in qualsiasi momento.
          </p>
        </div>

        {/* Billing Interval Toggle */}
        <div className="flex justify-center mb-8">
          <BillingIntervalToggle value={billingInterval} onChange={setBillingInterval} />
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Piano Free */}
          <PlanCard
            name="Free"
            description="Perfetto per iniziare"
            price="€0"
            priceSubtext="/mese"
            features={[
              { text: `${planLimits.free.maxWidgets} widget`, included: true },
              { text: `${planLimits.free.maxValutationsPerMonth} valutazioni/mese`, included: true },
              { text: 'Supporto email', included: true },
              { text: 'Analytics base', included: planLimits.free.analytics },
              { text: 'Custom branding', included: planLimits.free.customBranding },
              { text: 'Supporto prioritario', included: planLimits.free.prioritySupport },
              { text: 'CSS custom', included: planLimits.free.customCss },
              { text: 'API access', included: planLimits.free.apiAccess }
            ]}
            ctaText="Inizia Gratis"
            onSelect={() => handlePlanSelect('free')}
            isLoading={isLoading && selectedPlan === 'free'}
            isSelected={selectedPlan === 'free'}
          />

          {/* Piano Basic */}
          <PlanCard
            name="Basic"
            description="Ideale per agenzie in crescita"
            price={formatPlanPrice('basic', billingInterval)}
            priceSubtext={billingInterval !== 'monthly' ? `(€${getMonthlyEquivalent('basic', billingInterval) / 100}/mese)` : undefined}
            features={[
              { text: `${planLimits.basic.maxWidgets} widget`, included: true },
              { text: `${planLimits.basic.maxValutationsPerMonth} valutazioni/mese`, included: true },
              { text: 'Analytics completo', included: planLimits.basic.analytics },
              { text: 'Supporto prioritario', included: planLimits.basic.prioritySupport },
              { text: 'Custom branding', included: planLimits.basic.customBranding },
              { text: 'CSS custom', included: planLimits.basic.customCss },
              { text: 'API access', included: planLimits.basic.apiAccess }
            ]}
            trialDays={7}
            recommended={true}
            ctaText="Prova 7 Giorni Gratis"
            onSelect={() => handlePlanSelect('basic')}
            isLoading={isLoading && selectedPlan === 'basic'}
            isSelected={selectedPlan === 'basic'}
            discount={BILLING_INTERVALS[billingInterval].discount > 0 ? BILLING_INTERVALS[billingInterval].discount * 100 : undefined}
          />

          {/* Piano Premium */}
          <PlanCard
            name="Premium"
            description="Per agenzie professionali"
            price={formatPlanPrice('premium', billingInterval)}
            priceSubtext={billingInterval !== 'monthly' ? `(€${getMonthlyEquivalent('premium', billingInterval) / 100}/mese)` : undefined}
            features={[
              { text: `${planLimits.premium.maxWidgets} widget`, included: true },
              { text: `${planLimits.premium.maxValutationsPerMonth} valutazioni/mese`, included: true },
              { text: 'Analytics avanzato', included: planLimits.premium.analytics },
              { text: 'Supporto dedicato', included: planLimits.premium.prioritySupport },
              { text: 'White-label + CSS', included: planLimits.premium.customBranding && planLimits.premium.customCss },
              { text: 'API access', included: planLimits.premium.apiAccess }
            ]}
            trialDays={7}
            ctaText="Prova 7 Giorni Gratis"
            onSelect={() => handlePlanSelect('premium')}
            isLoading={isLoading && selectedPlan === 'premium'}
            isSelected={selectedPlan === 'premium'}
            discount={BILLING_INTERVALS[billingInterval].discount > 0 ? BILLING_INTERVALS[billingInterval].discount * 100 : undefined}
          />
        </div>

        {/* Note */}
        <div className="text-center">
          <p className="text-sm text-foreground-muted">
            Tutti i piani includono supporto per widget responsive, valutazioni OMI precise e notifiche email.
            <br />
            Il piano Free è gratuito per sempre. Per i piani a pagamento inizia con 7 giorni di prova senza addebiti.
          </p>
        </div>
      </div>

      {/* Dialog inserimento carta per trial Basic/Premium */}
      <Dialog open={showPaymentDialog} onOpenChange={(open) => { if (!open) setShowPaymentDialog(false) }}>
        <DialogContent className="border-2 border-primary/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Inizia la prova gratuita — piano {selectedPlan === 'basic' ? 'Basic' : 'Premium'}
            </DialogTitle>
            <DialogDescription className="text-foreground-muted">
              7 giorni gratuiti, poi {selectedPlan && selectedPlan !== 'free' ? formatPlanPrice(selectedPlan, billingInterval) : ''}. Nessun addebito oggi.
            </DialogDescription>
          </DialogHeader>

          {selectedPlan && selectedPlan !== 'free' && (
            <CardPaymentForm
              planType={selectedPlan}
              onCancel={() => setShowPaymentDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
