'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PlanCard } from "@/components/onboarding/plan-card"
import { Button } from "@/components/ui/button"
import { Building2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PLAN_PRICES, planLimits } from "@/lib/plan-limits"

type PlanType = 'free' | 'basic' | 'premium'

export default function OnboardingPlanPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handlePlanSelect = (planType: PlanType) => {
    setSelectedPlan(planType)

    if (planType === 'free') {
      // Piano free: nessun trial, attivazione immediata
      activatePlan(planType, 0)
    } else {
      // Piano a pagamento: mostra conferma trial
      setShowConfirmDialog(true)
    }
  }

  const activatePlan = async (planType: PlanType, trialDays: number) => {
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
        body: JSON.stringify({
          planType,
          trialDays
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Errore durante la selezione del piano')
      }

      // Successo: redirect a welcome
      router.push('/onboarding/welcome')
    } catch (error) {
      console.error('Error selecting plan:', error)
      alert('Errore durante la selezione del piano. Riprova.')
      setIsLoading(false)
    }
  }

  const handleConfirmTrial = () => {
    if (selectedPlan) {
      setShowConfirmDialog(false)
      activatePlan(selectedPlan, 7) // 7 giorni di trial
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Scegli il piano perfetto per te
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Inizia con il piano che meglio si adatta alle tue esigenze. Puoi cambiare o annullare in qualsiasi momento.
          </p>
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
            price={`€${PLAN_PRICES.basic / 100}`}
            priceSubtext="/mese"
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
          />

          {/* Piano Premium */}
          <PlanCard
            name="Premium"
            description="Per agenzie professionali"
            price={`€${PLAN_PRICES.premium / 100}`}
            priceSubtext="/mese"
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
          />
        </div>

        {/* Note */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Tutti i piani includono supporto per widget responsive, valutazioni OMI precise e notifiche email.
            <br />
            Nessuna carta di credito richiesta per iniziare la prova gratuita.
          </p>
        </div>
      </div>

      {/* Dialogo conferma trial */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Hai scelto il piano {selectedPlan === 'basic' ? 'Basic' : 'Premium'}
            </DialogTitle>
            <DialogDescription className="space-y-3 pt-4">
              <p className="text-base text-gray-700">
                Inizia la tua prova gratuita di 7 giorni.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Non ti chiederemo la carta di credito ora</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Accesso completo a tutte le funzionalità del piano</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Al termine dei 7 giorni potrai decidere se continuare</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Puoi annullare in qualsiasi momento</span>
                  </li>
                </ul>
              </div>
              <p className="text-xs text-gray-500 pt-2">
                Se non aggiungi un metodo di pagamento entro 7 giorni, il tuo account passerà automaticamente al piano Free.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isLoading}
            >
              Annulla
            </Button>
            <Button
              onClick={handleConfirmTrial}
              disabled={isLoading}
            >
              {isLoading ? 'Attivazione...' : 'Attiva Prova Gratuita'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
