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
  // Trial attivo
  if (subscriptionStatus === 'trial' && trialDaysRemaining !== null) {
    const isUrgent = trialDaysRemaining <= 3
    const progressPercentage = trialEndsAt
      ? Math.max(0, Math.min(100, (trialDaysRemaining / 14) * 100))
      : 0

    return (
      <Card className={`mb-6 border-2 ${isUrgent ? 'border-orange-400 bg-orange-50' : 'border-blue-400 bg-blue-50'}`}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0 ${isUrgent ? 'bg-orange-100' : 'bg-blue-100'}`}>
                {isUrgent ? (
                  <AlertCircle className={`w-5 h-5 sm:w-6 sm:h-6 ${isUrgent ? 'text-orange-600' : 'text-blue-600'}`} />
                ) : (
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                  Prova Premium Attiva
                </h3>
                <p className="text-xs sm:text-sm text-gray-700 mb-3">
                  {trialDaysRemaining === 0
                    ? "Il tuo trial scade oggi!"
                    : trialDaysRemaining === 1
                    ? "Rimane 1 giorno di prova gratuita"
                    : `Rimangono ${trialDaysRemaining} giorni di prova gratuita`
                  }
                </p>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full transition-all ${isUrgent ? 'bg-orange-500' : 'bg-blue-500'}`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>

                {trialEndsAt && (
                  <p className="text-xs text-gray-600">
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
              <Button className={`w-full sm:w-auto ${isUrgent ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
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
      <Card className="mb-6 border-2 border-red-400 bg-red-50">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex-shrink-0">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                  Il tuo trial è scaduto
                </h3>
                <p className="text-xs sm:text-sm text-gray-700">
                  Effettua l'upgrade per continuare a usare tutte le funzionalità premium
                </p>
              </div>
            </div>

            <Link href="/dashboard/subscription" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-red-600 hover:bg-red-700">
                <Crown className="w-4 h-4 mr-2" />
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
      <Card className="mb-6 border-2 border-green-400 bg-green-50">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex-shrink-0">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                  Piano {planType === 'premium' ? 'Premium' : 'Basic'} Attivo
                </h3>
                {nextBillingDate && (
                  <p className="text-xs sm:text-sm text-gray-700">
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
              <Button variant="outline" className="w-full sm:w-auto border-green-600 text-green-700 hover:bg-green-100">
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
