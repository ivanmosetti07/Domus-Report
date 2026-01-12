'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { Loader2, CreditCard, ShieldCheck, ExternalLink } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface PaymentMethodSetupProps {
  onSuccess?: () => void
  trialEndsAt?: string | null
}

export default function PaymentMethodSetup({ trialEndsAt }: PaymentMethodSetupProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleAddPaymentMethod = async () => {
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/subscription/setup-payment-session', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok && data.url) {
        // Redirect a Stripe Checkout
        window.location.href = data.url
      } else {
        toast({
          title: 'Errore',
          description: data.error || 'Impossibile inizializzare il pagamento',
          variant: 'destructive'
        })
        setLoading(false)
      }
    } catch (error) {
      toast({
        title: 'Errore',
        description: error instanceof Error ? error.message : 'Errore di connessione',
        variant: 'destructive'
      })
      setLoading(false)
    }
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
            Verrai reindirizzato a Stripe per inserire i dati della tua carta in modo sicuro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleAddPaymentMethod}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Reindirizzamento in corso...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5 mr-2" />
                Aggiungi metodo di pagamento
                <ExternalLink className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3 w-3" />
            <span>Pagamenti sicuri gestiti da Stripe</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
