'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  CreditCard,
  Check,
  X,
  Loader2,
  Crown,
  Zap,
  Building2,
  ExternalLink,
  FileText,
  Download,
  AlertCircle,
  Gift,
  ShoppingCart,
  Plus,
  Minus
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Subscription {
  id: string
  planType: 'free' | 'basic' | 'premium'
  status: 'active' | 'cancelled' | 'expired' | 'trial' | 'past_due'
  trialEndsAt: string | null
  nextBillingDate: string | null
  cancelledAt: string | null
  stripeCustomerId: string | null
  valuationsUsedThisMonth?: number
  extraValuationsPurchased?: number
}

interface Invoice {
  id: string
  number: string
  date: string
  amount: number
  currency: string
  status: string
  description: string
  pdfUrl: string | null
  hostedUrl: string | null
}

interface UsageData {
  valuations: {
    current: number
    limit: number
    extra: number
    percentage: number
  }
  widgets: {
    current: number
    limit: number
    percentage: number
  }
}

const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    description: 'Per iniziare',
    icon: Building2,
    popular: false,
    features: [
      { text: '1 widget', included: true },
      { text: '5 valutazioni/mese', included: true },
      { text: 'Analytics base', included: false },
      { text: 'Supporto email', included: true },
      { text: 'Custom branding', included: false },
      { text: 'API access', included: false },
    ]
  },
  basic: {
    name: 'Basic',
    price: 50,
    description: 'Per agenzie in crescita',
    icon: Zap,
    popular: true,
    features: [
      { text: '3 widget', included: true },
      { text: '50 valutazioni/mese', included: true },
      { text: 'Analytics completo', included: true },
      { text: 'Supporto prioritario', included: true },
      { text: 'Custom branding', included: true },
      { text: 'API access', included: false },
    ]
  },
  premium: {
    name: 'Premium',
    price: 100,
    description: 'Per agenzie professionali',
    icon: Crown,
    popular: false,
    features: [
      { text: '10 widget', included: true },
      { text: '150 valutazioni/mese', included: true },
      { text: 'Analytics avanzato', included: true },
      { text: 'Supporto dedicato', included: true },
      { text: 'White-label + CSS', included: true },
      { text: 'API access', included: true },
    ]
  }
}

// Prezzo valutazioni extra
const EXTRA_VALUATION_PRICE = 1.50

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [promoValid, setPromoValid] = useState<boolean | null>(null)
  const [promoDiscount, setPromoDiscount] = useState<number>(0)
  const [extraQuantity, setExtraQuantity] = useState(10)
  const [buyingExtra, setBuyingExtra] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchSubscription()
    fetchInvoices()
    fetchUsage()

    // Controlla se c'è un messaggio di successo dall'acquisto/upgrade
    const urlParams = new URLSearchParams(window.location.search)
    const purchase = urlParams.get('purchase')
    const upgrade = urlParams.get('upgrade')

    if (purchase === 'success') {
      toast({
        title: 'Acquisto completato!',
        description: 'Le valutazioni extra sono state aggiunte al tuo account.'
      })
      // Rimuovi i parametri dall'URL
      window.history.replaceState({}, '', '/dashboard/subscription')
    } else if (purchase === 'cancelled') {
      toast({
        title: 'Acquisto annullato',
        description: 'L\'acquisto è stato annullato.',
        variant: 'destructive'
      })
      // Rimuovi i parametri dall'URL
      window.history.replaceState({}, '', '/dashboard/subscription')
    } else if (upgrade === 'success') {
      toast({
        title: 'Abbonamento aggiornato!',
        description: 'Il tuo piano è stato aggiornato con successo.'
      })
      // Rimuovi i parametri dall'URL
      window.history.replaceState({}, '', '/dashboard/subscription')
      // Ricarica i dati dopo un piccolo delay
      setTimeout(() => {
        fetchSubscription()
        fetchUsage()
      }, 1000)
    } else if (upgrade === 'cancelled') {
      toast({
        title: 'Upgrade annullato',
        description: 'L\'upgrade del piano è stato annullato.',
        variant: 'destructive'
      })
      // Rimuovi i parametri dall'URL
      window.history.replaceState({}, '', '/dashboard/subscription')
    }
  }, [])

  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/subscription', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setSubscription(data.subscription)
      }
    } catch (error) {
      console.error('Errore fetch subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/subscription/invoices', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setInvoices(data.invoices || [])
      }
    } catch (error) {
      console.error('Errore fetch invoices:', error)
    }
  }

  const fetchUsage = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/subscription/usage', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setUsage(data)
      }
    } catch (error) {
      console.error('Errore fetch usage:', error)
    }
  }

  const handleBuyExtraValuations = async () => {
    if (extraQuantity < 1 || extraQuantity > 100) {
      toast({
        title: 'Errore',
        description: 'Quantità non valida (min: 1, max: 100)',
        variant: 'destructive'
      })
      return
    }

    setBuyingExtra(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/subscription/buy-valuations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: extraQuantity })
      })

      const data = await res.json()

      if (res.ok && data.url) {
        // Redirect a Stripe Checkout
        window.location.href = data.url
      } else {
        toast({
          title: 'Errore',
          description: data.error || 'Impossibile avviare il pagamento',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Errore di connessione',
        variant: 'destructive'
      })
    } finally {
      setBuyingExtra(false)
    }
  }

  const handleUpgrade = async (planType: 'basic' | 'premium') => {
    setUpgrading(planType)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          planType,
          promoCode: promoValid ? promoCode : undefined
        })
      })

      const data = await res.json()

      if (res.ok && data.url) {
        window.location.href = data.url
      } else {
        toast({
          title: 'Errore',
          description: data.error || 'Impossibile avviare il checkout',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Errore di connessione',
        variant: 'destructive'
      })
    } finally {
      setUpgrading(null)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Sei sicuro di voler cancellare il tuo abbonamento? Resterà attivo fino alla fine del periodo di fatturazione.')) {
      return
    }

    setCancelling(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })

      const data = await res.json()

      if (res.ok) {
        toast({
          title: 'Abbonamento cancellato',
          description: data.message
        })
        fetchSubscription()
      } else {
        toast({
          title: 'Errore',
          description: data.error,
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Errore di connessione',
        variant: 'destructive'
      })
    } finally {
      setCancelling(false)
    }
  }

  const handleManageBilling = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/subscription/portal', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })

      const data = await res.json()

      if (res.ok && data.url) {
        window.location.href = data.url
      } else {
        toast({
          title: 'Errore',
          description: data.error || 'Impossibile aprire il portale di fatturazione',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Errore di connessione',
        variant: 'destructive'
      })
    }
  }

  const validatePromoCode = async () => {
    if (!promoCode.trim()) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/subscription/promo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ code: promoCode })
      })

      const data = await res.json()

      if (res.ok && data.valid) {
        setPromoValid(true)
        setPromoDiscount(data.discountPercent)
        toast({
          title: 'Codice valido!',
          description: data.message
        })
      } else {
        setPromoValid(false)
        setPromoDiscount(0)
        toast({
          title: 'Codice non valido',
          description: data.error,
          variant: 'destructive'
        })
      }
    } catch (error) {
      setPromoValid(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Attivo</Badge>
      case 'trial':
        return <Badge className="bg-blue-500">Prova</Badge>
      case 'cancelled':
        return <Badge className="bg-yellow-500">Cancellato</Badge>
      case 'past_due':
        return <Badge className="bg-red-500">Pagamento in ritardo</Badge>
      case 'expired':
        return <Badge variant="secondary">Scaduto</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const currentPlan = subscription?.planType || 'free'
  const CurrentPlanInfo = PLANS[currentPlan]

  return (
    <div className="space-y-8">
      <PageHeader
        title="Abbonamento"
        subtitle="Gestisci il tuo piano e la fatturazione"
      />

      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CurrentPlanInfo.icon className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Piano {CurrentPlanInfo.name}</CardTitle>
                <CardDescription>
                  {CurrentPlanInfo.price === 0
                    ? 'Gratuito'
                    : `€${CurrentPlanInfo.price}/mese`}
                </CardDescription>
              </div>
            </div>
            {subscription && getStatusBadge(subscription.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription?.status === 'trial' && subscription.trialEndsAt && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              <span className="text-sm">
                Periodo di prova fino al {new Date(subscription.trialEndsAt).toLocaleDateString('it-IT')}
              </span>
            </div>
          )}

          {subscription?.status === 'cancelled' && subscription.nextBillingDate && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <span className="text-sm">
                L'abbonamento resterà attivo fino al {new Date(subscription.nextBillingDate).toLocaleDateString('it-IT')}
              </span>
            </div>
          )}

          {subscription?.status === 'past_due' && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-sm">
                Pagamento in ritardo. Aggiorna il metodo di pagamento per evitare l'interruzione del servizio.
              </span>
            </div>
          )}

          {subscription?.nextBillingDate && subscription.status === 'active' && (
            <p className="text-sm text-muted-foreground">
              Prossimo rinnovo: {new Date(subscription.nextBillingDate).toLocaleDateString('it-IT')}
            </p>
          )}

          <div className="flex gap-2">
            {subscription?.stripeCustomerId && (
              <Button variant="outline" onClick={handleManageBilling}>
                <CreditCard className="h-4 w-4 mr-2" />
                Gestisci fatturazione
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            )}
            {currentPlan !== 'free' && subscription?.status === 'active' && (
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Cancella abbonamento
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      {usage && (
        <Card>
          <CardHeader>
            <CardTitle>Utilizzo Mensile</CardTitle>
            <CardDescription>Valutazioni usate questo mese</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Valutazioni</span>
                <span className="font-medium">
                  {usage.valuations.current} / {usage.valuations.limit + usage.valuations.extra}
                  {usage.valuations.extra > 0 && (
                    <span className="text-green-600 ml-1">(+{usage.valuations.extra} extra)</span>
                  )}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    usage.valuations.percentage >= 90 ? 'bg-red-500' :
                    usage.valuations.percentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, usage.valuations.percentage)}%` }}
                />
              </div>
              {usage.valuations.percentage >= 80 && (
                <p className="text-sm text-yellow-600">
                  Stai per raggiungere il limite. Considera l'acquisto di valutazioni extra.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Widget</span>
                <span className="font-medium">{usage.widgets.current} / {usage.widgets.limit}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    usage.widgets.percentage >= 100 ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(100, usage.widgets.percentage)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Buy Extra Valuations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Acquista Valutazioni Extra
          </CardTitle>
          <CardDescription>
            €{EXTRA_VALUATION_PRICE.toFixed(2)} per valutazione
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setExtraQuantity(Math.max(1, extraQuantity - 5))}
                disabled={extraQuantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={extraQuantity}
                onChange={(e) => setExtraQuantity(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-20 text-center"
                min={1}
                max={100}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setExtraQuantity(Math.min(100, extraQuantity + 5))}
                disabled={extraQuantity >= 100}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold">
                €{(extraQuantity * EXTRA_VALUATION_PRICE).toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">
                {extraQuantity} valutazioni
              </p>
            </div>
            <Button
              onClick={handleBuyExtraValuations}
              disabled={buyingExtra}
            >
              {buyingExtra ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Acquista
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Promo Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Codice Promozionale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Inserisci codice"
              value={promoCode}
              onChange={(e) => {
                setPromoCode(e.target.value.toUpperCase())
                setPromoValid(null)
              }}
              className={promoValid === true ? 'border-green-500' : promoValid === false ? 'border-red-500' : ''}
            />
            <Button onClick={validatePromoCode} variant="outline">
              Applica
            </Button>
          </div>
          {promoValid && promoDiscount > 0 && (
            <p className="text-sm text-green-600 mt-2">
              Sconto del {promoDiscount}% sarà applicato al checkout
            </p>
          )}
        </CardContent>
      </Card>

      {/* Plans Comparison */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Piani disponibili</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {(Object.entries(PLANS) as [keyof typeof PLANS, typeof PLANS[keyof typeof PLANS]][]).map(([key, plan]) => {
            const isCurrentPlan = currentPlan === key
            const Icon = plan.icon

            return (
              <Card
                key={key}
                className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''} ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary">Più popolare</Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Icon className="h-6 w-6" />
                    <CardTitle>{plan.name}</CardTitle>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">€{plan.price}</span>
                    {plan.price > 0 && <span className="text-muted-foreground">/mese</span>}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        {feature.included ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-gray-300" />
                        )}
                        <span className={feature.included ? '' : 'text-muted-foreground'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {isCurrentPlan ? (
                    <Button className="w-full" disabled>
                      Piano attuale
                    </Button>
                  ) : key === 'free' ? (
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={currentPlan === 'free' || cancelling}
                    >
                      {cancelling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Passa a Free
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleUpgrade(key as 'basic' | 'premium')}
                      disabled={upgrading !== null}
                    >
                      {upgrading === key ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {currentPlan === 'free' ? 'Inizia ora' :
                       PLANS[key].price > PLANS[currentPlan].price ? 'Upgrade' : 'Cambia piano'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Invoices */}
      {invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Fatture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{invoice.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invoice.date).toLocaleDateString('it-IT')} - {invoice.number}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">
                      €{invoice.amount.toFixed(2)}
                    </span>
                    <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                      {invoice.status === 'paid' ? 'Pagata' : invoice.status}
                    </Badge>
                    {invoice.pdfUrl && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
