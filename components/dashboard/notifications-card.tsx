import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, AlertCircle, CheckCircle, Info, TrendingUp, Palette, Users, Code } from "lucide-react"

interface Notification {
  id: string
  type: 'alert' | 'success' | 'info' | 'insight'
  title: string
  message: string
  action?: {
    label: string
    href: string
  }
  icon?: React.ReactNode
}

interface NotificationsCardProps {
  notifications: Notification[]
}

const iconMap = {
  alert: <AlertCircle className="w-5 h-5 text-orange-600" />,
  success: <CheckCircle className="w-5 h-5 text-green-600" />,
  info: <Info className="w-5 h-5 text-blue-600" />,
  insight: <TrendingUp className="w-5 h-5 text-purple-600" />
}

const bgColorMap = {
  alert: 'bg-orange-50 border-orange-200',
  success: 'bg-green-50 border-green-200',
  info: 'bg-blue-50 border-blue-200',
  insight: 'bg-purple-50 border-purple-200'
}

export function NotificationsCard({ notifications }: NotificationsCardProps) {
  if (notifications.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="w-5 h-5" />
          Notifiche e Suggerimenti
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg border ${bgColorMap[notification.type]}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {notification.icon || iconMap[notification.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">
                    {notification.title}
                  </h4>
                  <p className="text-xs text-gray-700 mb-2">
                    {notification.message}
                  </p>
                  {notification.action && (
                    <Link href={notification.action.href}>
                      <Button variant="outline" size="sm" className="text-xs h-7">
                        {notification.action.label}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to generate notifications based on system state
export function generateNotifications({
  totalLeads,
  newLeadsCount,
  hasWidgetEvents,
  trialDaysRemaining,
  hasBrandColors,
  planType,
  totalWidgets
}: {
  totalLeads: number
  newLeadsCount: number
  hasWidgetEvents: boolean
  trialDaysRemaining: number | null
  hasBrandColors: boolean
  planType: string
  totalWidgets: number
}): Notification[] {
  const notifications: Notification[] = []

  // Nuovi lead da gestire
  if (newLeadsCount > 0) {
    notifications.push({
      id: 'new-leads',
      type: 'alert',
      title: `${newLeadsCount} nuov${newLeadsCount === 1 ? 'o' : 'i'} lead da gestire`,
      message: `Hai ${newLeadsCount} lead in attesa di contatto. Rispondi velocemente per aumentare le conversioni!`,
      action: {
        label: 'Gestisci Lead',
        href: '/dashboard/leads?status=NEW'
      }
    })
  }

  // Widget non installato
  if (!hasWidgetEvents && totalWidgets > 0) {
    notifications.push({
      id: 'no-widget-events',
      type: 'info',
      title: 'Widget non ancora attivo',
      message: 'Non abbiamo rilevato eventi dal tuo widget. Assicurati di averlo installato correttamente sul tuo sito.',
      icon: <Code className="w-5 h-5 text-blue-600" />,
      action: {
        label: 'Vedi Guida',
        href: '/docs/html'
      }
    })
  }

  // Trial in scadenza
  if (trialDaysRemaining !== null && trialDaysRemaining > 0 && trialDaysRemaining <= 3) {
    notifications.push({
      id: 'trial-expiring',
      type: 'alert',
      title: `Trial scade tra ${trialDaysRemaining} giorn${trialDaysRemaining === 1 ? 'o' : 'i'}`,
      message: 'Aggiungi un metodo di pagamento per continuare a usare tutte le funzionalità premium.',
      action: {
        label: 'Aggiungi Pagamento',
        href: '/dashboard/subscription'
      }
    })
  }

  // Colori brand non configurati
  if (!hasBrandColors && planType !== 'free') {
    notifications.push({
      id: 'no-brand-colors',
      type: 'info',
      title: 'Personalizza il tuo widget',
      message: 'Configura i colori del tuo brand per un widget perfettamente integrato con il tuo sito.',
      icon: <Palette className="w-5 h-5 text-blue-600" />,
      action: {
        label: 'Configura Colori',
        href: '/dashboard/settings'
      }
    })
  }

  // Success message: primi lead ricevuti
  if (totalLeads >= 1 && totalLeads <= 5) {
    notifications.push({
      id: 'first-leads',
      type: 'success',
      title: 'Complimenti! Primi lead ricevuti',
      message: `Hai ricevuto ${totalLeads} lead! Continua così e ottimizza il tuo widget per massimizzare le conversioni.`,
      action: {
        label: 'Vedi Lead',
        href: '/dashboard/leads'
      }
    })
  }

  return notifications
}
