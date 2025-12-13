'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, Clock, Crown } from "lucide-react"

interface TrialBannerProps {
  subscriptionStatus: string
  planType: string
  trialDaysRemaining: number | null
  nextBillingDate: Date | null
  trialEndsAt: Date | null
}

export function TrialBanner({
  subscriptionStatus,
  planType,
  trialDaysRemaining,
  nextBillingDate,
  trialEndsAt
}: TrialBannerProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  // Trial attivo
  if (subscriptionStatus === 'trial' && trialDaysRemaining !== null) {
    const isUrgent = trialDaysRemaining <= 3

    // Calcola percentuale progress basata su giorni rimanenti
    // Usa 7 giorni come default per il trial
    const totalTrialDays = 7

    const progressPercentage = trialEndsAt
      ? Math.max(0, Math.min(100, (trialDaysRemaining / totalTrialDays) * 100))
      : 0

    return (
      <Card className={`border-2 ${isUrgent ? 'border-warning bg-warning/10' : 'border-primary bg-primary/10'}`}>
        <CardContent style={{ padding: 'clamp(1rem, 2vw, 1.5rem)' }}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between" style={{ gap: 'var(--space-md)' }}>
            <div className="flex items-start flex-1" style={{ gap: 'var(--space-3)' }}>
              <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0 ${isUrgent ? 'bg-warning/20' : 'bg-primary/20'}`}>
                {isUrgent ? (
                  <AlertCircle className={`w-5 h-5 sm:w-6 sm:h-6 ${isUrgent ? 'text-warning' : 'text-primary'}`} />
                ) : (
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground" style={{
                  fontSize: 'clamp(1rem, 1.125vw, 1.125rem)',
                  marginBottom: 'var(--space-1)'
                }}>
                  Prova {planType === 'premium' ? 'Premium' : 'Basic'} Attiva
                </h3>
                <p className="text-foreground" style={{
                  fontSize: 'clamp(0.75rem, 1vw, 0.875rem)',
                  marginBottom: 'var(--space-3)'
                }}>
                  {trialDaysRemaining === 0
                    ? "Il tuo trial scade oggi!"
                    : trialDaysRemaining === 1
                    ? "Rimane 1 giorno di prova gratuita"
                    : `Rimangono ${trialDaysRemaining} giorni di prova gratuita`
                  }
                </p>

                {/* Progress Bar */}
                <div className="w-full bg-surface-2 rounded-full h-2" style={{ marginBottom: 'var(--space-2)' }}>
                  <div
                    className={`h-2 rounded-full transition-all ${isUrgent ? 'bg-warning' : 'bg-primary'}`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>

                {trialEndsAt && mounted && (
                  <p className="text-xs text-foreground-muted">
                    Scadenza: {new Date(trialEndsAt).toLocaleDateString('it-IT', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                )}
              </div>
            </div>

            <Link href="/dashboard/subscription" className="w-full sm:w-auto">
              <Button className={`w-full sm:w-auto ${isUrgent ? '' : ''}`}>
                <Crown className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Aggiungi Pagamento</span>
                <span className="sm:hidden">Aggiungi Pagamento</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Trial scaduto
  if (subscriptionStatus === 'expired' || (subscriptionStatus === 'trial' && trialDaysRemaining !== null && trialDaysRemaining < 0)) {
    return (
      <Card className="border-2 border-destructive bg-destructive/10">
        <CardContent style={{ padding: 'clamp(1rem, 2vw, 1.5rem)' }}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between" style={{ gap: 'var(--space-md)' }}>
            <div className="flex items-start flex-1" style={{ gap: 'var(--space-3)' }}>
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-destructive/20 rounded-full flex-shrink-0">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground" style={{
                  fontSize: 'clamp(1rem, 1.125vw, 1.125rem)',
                  marginBottom: 'var(--space-1)'
                }}>
                  Il tuo trial è scaduto
                </h3>
                <p className="text-foreground" style={{
                  fontSize: 'clamp(0.75rem, 1vw, 0.875rem)'
                }}>
                  Effettua l'upgrade per continuare a usare tutte le funzionalità premium
                </p>
              </div>
            </div>

            <Link href="/dashboard/subscription" className="w-full sm:w-auto">
              <Button variant="destructive" className="w-full sm:w-auto">
                <Crown className="w-4 h-4" style={{ marginRight: 'var(--space-2)' }} />
                Upgrade Ora
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Piano attivo (premium/basic)
  if (subscriptionStatus === 'active' && planType !== 'free') {
    return (
      <Card className="border-2 border-success bg-success/10">
        <CardContent style={{ padding: 'clamp(1rem, 2vw, 1.5rem)' }}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between" style={{ gap: 'var(--space-md)' }}>
            <div className="flex items-start flex-1" style={{ gap: 'var(--space-3)' }}>
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-success/20 rounded-full flex-shrink-0">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground" style={{
                  fontSize: 'clamp(1rem, 1.125vw, 1.125rem)',
                  marginBottom: 'var(--space-1)'
                }}>
                  Piano {planType === 'premium' ? 'Premium' : 'Basic'} Attivo
                </h3>
                {nextBillingDate && mounted && (
                  <p className="text-foreground" style={{
                    fontSize: 'clamp(0.75rem, 1vw, 0.875rem)'
                  }}>
                    Prossimo rinnovo: {new Date(nextBillingDate).toLocaleDateString('it-IT', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                )}
              </div>
            </div>

            <Link href="/dashboard/subscription" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto border-success text-success hover:bg-success/10" style={{
                fontSize: 'clamp(0.75rem, 1vw, 0.875rem)'
              }}>
                Gestisci Piano
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Piano free (nessun banner o banner minimo)
  return null
}
