'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { stripePromise } from '@/lib/stripe-client'
import { Button } from '@/components/ui/button'
import { trackPlanSelected, trackTrialStart } from '@/lib/gtag'
import { PLAN_PRICES } from '@/lib/plan-limits'

type PlanType = 'basic' | 'premium'

// Form interno che usa gli hook Stripe
function PaymentForm({ planType, onCancel }: { planType: PlanType; onCancel: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsLoading(true)
    setErrorMessage(null)

    // Valida il form Stripe e crea il PaymentMethod
    const { error: submitError } = await elements.submit()
    if (submitError) {
      setErrorMessage(submitError.message ?? 'Errore nel form di pagamento')
      setIsLoading(false)
      return
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({ elements })
    if (error || !paymentMethod) {
      setErrorMessage(error?.message ?? 'Impossibile creare il metodo di pagamento')
      setIsLoading(false)
      return
    }

    // Chiama l'API per creare la subscription trial su Stripe
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/subscription/create-trial-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planType,
          paymentMethodId: paymentMethod.id,
          trialDays: 7,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Errore durante l\'attivazione del trial')
      }

      // GA4 tracking
      const planValue = PLAN_PRICES[planType] / 100
      trackPlanSelected({ planType, value: planValue, hasTrial: true })
      trackTrialStart({ planType, trialDays: 7, value: planValue })

      router.push('/onboarding/welcome')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Errore durante l\'attivazione')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Riepilogo trial */}
      <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 space-y-2 text-sm text-foreground">
        <p className="flex items-center gap-2">
          <span className="text-primary font-bold">✓</span>
          7 giorni gratuiti, poi €{PLAN_PRICES[planType] / 100}/mese
        </p>
        <p className="flex items-center gap-2">
          <span className="text-primary font-bold">✓</span>
          Nessun addebito durante il trial
        </p>
        <p className="flex items-center gap-2">
          <span className="text-primary font-bold">✓</span>
          Puoi annullare in qualsiasi momento
        </p>
      </div>

      {/* Form carta Stripe */}
      <PaymentElement
        options={{
          layout: 'tabs',
        }}
      />

      {errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Annulla
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isLoading}
          className="flex-1 bg-primary hover:bg-primary-hover text-primary-foreground"
        >
          {isLoading ? 'Attivazione...' : 'Attiva prova gratuita'}
        </Button>
      </div>

      <p className="text-xs text-foreground-muted text-center">
        Pagamento sicuro gestito da Stripe. I tuoi dati non vengono memorizzati sui nostri server.
      </p>
    </form>
  )
}

// Wrapper che fornisce il contesto Elements
export function CardPaymentForm({
  planType,
  onCancel,
}: {
  planType: PlanType
  onCancel: () => void
}) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        mode: 'setup',
        currency: 'eur',
        paymentMethodTypes: ['card'],
        appearance: {
          theme: 'night',
          variables: {
            colorPrimary: 'hsl(var(--primary))',
            colorBackground: 'hsl(var(--surface))',
            colorText: 'hsl(var(--foreground))',
            colorDanger: 'hsl(var(--destructive))',
            borderRadius: '8px',
          },
        },
      }}
    >
      <PaymentForm planType={planType} onCancel={onCancel} />
    </Elements>
  )
}
