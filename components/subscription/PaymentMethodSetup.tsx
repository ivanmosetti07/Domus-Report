'use client'

import { useState, useEffect } from 'react'
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CreditCard, ShieldCheck, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// Carica Stripe publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentMethodSetupProps {
  onSuccess?: () => void
  trialEndsAt?: string | null
}

function PaymentSetupForm({ onSuccess, trialEndsAt }: PaymentMethodSetupProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Conferma il setup intent
      const { error: submitError } = await elements.submit()

      if (submitError) {
        setError(submitError.message || 'Errore durante la validazione')
        setLoading(false)
        return
      }

      // Conferma il setup
      const { error: confirmError, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: window.location.href, // Fallback, non usato con redirect: 'if_required'
        },
        redirect: 'if_required'
      })

      if (confirmError) {
        setError(confirmError.message || 'Errore durante la conferma')
        setLoading(false)
        return
      }

      if (setupIntent && setupIntent.status === 'succeeded') {
        // Verifica con il backend che il payment method sia stato salvato
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/subscription/setup-payment?setupIntentId=${setupIntent.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const data = await response.json()

        if (response.ok && data.success) {
          toast({
            title: 'Metodo di pagamento aggiunto!',
            description: 'La tua carta è stata salvata con successo. Nessun addebito verrà effettuato durante il periodo di prova.'
          })

          if (onSuccess) {
            onSuccess()
          }
        } else {
          setError(data.error || 'Errore durante il salvataggio')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore imprevisto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: 'tabs',
          defaultValues: {
            billingDetails: {
              // Può essere pre-popolato con i dati dell'utente se necessario
            }
          }
        }}
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={!stripe || loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Salvataggio in corso...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Salva metodo di pagamento
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Utilizzando Stripe per gestire i pagamenti in modo sicuro.
        <br />
        I tuoi dati della carta non vengono mai memorizzati sui nostri server.
      </p>
    </form>
  )
}

export default function PaymentMethodSetup({ onSuccess, trialEndsAt }: PaymentMethodSetupProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Crea Setup Intent quando il componente viene montato
    const createSetupIntent = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('/api/subscription/setup-payment', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const data = await response.json()

        if (response.ok && data.clientSecret) {
          setClientSecret(data.clientSecret)
        } else {
          setError(data.error || 'Impossibile inizializzare il pagamento')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore di connessione')
      } finally {
        setLoading(false)
      }
    }

    createSetupIntent()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!clientSecret) {
    return null
  }

  return (
    <div className="space-y-4">
      <Alert className="border-primary bg-primary/5">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <div className="ml-3">
          <h3 className="font-semibold text-foreground mb-1">
            Aggiungi un metodo di pagamento per continuare senza interruzioni
          </h3>
          <p className="text-sm text-muted-foreground">
            <strong>Nessun addebito fino al {trialEndsAt ? new Date(trialEndsAt).toLocaleDateString('it-IT') : 'termine del trial'}</strong>
            <br />
            L'addebito avverrà automaticamente solo alla fine del periodo di prova, salvo disdetta.
          </p>
        </div>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Inserisci i dati della carta
          </CardTitle>
          <CardDescription>
            Secure payment powered by Stripe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#2563eb',
                }
              }
            }}
          >
            <PaymentSetupForm onSuccess={onSuccess} trialEndsAt={trialEndsAt} />
          </Elements>
        </CardContent>
      </Card>
    </div>
  )
}
