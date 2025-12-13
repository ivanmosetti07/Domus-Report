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
  alert: <AlertCircle className="w-5 h-5 text-warning" />,
  success: <CheckCircle className="w-5 h-5 text-success" />,
  info: <Info className="w-5 h-5 text-primary" />,
  insight: <TrendingUp className="w-5 h-5 text-primary" />
}

const bgColorMap = {
  alert: 'bg-warning/10 border-warning/20',
  success: 'bg-success/10 border-success/20',
  info: 'bg-primary/10 border-primary/20',
  insight: 'bg-primary/10 border-primary/20'
}

export function NotificationsCard({ notifications }: NotificationsCardProps) {
  if (notifications.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader style={{
        paddingBottom: 'clamp(0.5rem, 1.5vw, 0.75rem)',
        padding: 'clamp(0.75rem, 2vw, 1.5rem)'
      }}>
        <CardTitle className="flex items-center" style={{
          gap: 'var(--space-2)',
          fontSize: 'clamp(0.875rem, 1vw, 1rem)'
        }}>
          <Bell style={{
            width: 'clamp(1rem, 2vw, 1.25rem)',
            height: 'clamp(1rem, 2vw, 1.25rem)'
          }} />
          Notifiche e Suggerimenti
        </CardTitle>
      </CardHeader>
      <CardContent style={{
        padding: 'clamp(0.75rem, 2vw, 1.5rem)',
        paddingTop: '0'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(0.5rem, 1.5vw, 0.75rem)'
        }}>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-xl border ${bgColorMap[notification.type]}`}
              style={{
                padding: 'clamp(0.5rem, 1.5vw, 0.75rem)'
              }}
            >
              <div className="flex items-start" style={{
                gap: 'clamp(0.5rem, 1.5vw, 0.75rem)'
              }}>
                <div className="flex-shrink-0" style={{ marginTop: 'clamp(0.125rem, 0.5vw, 0.25rem)' }}>
                  {notification.icon || iconMap[notification.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground" style={{
                    fontSize: 'clamp(0.75rem, 1vw, 0.875rem)',
                    marginBottom: 'var(--space-1)'
                  }}>
                    {notification.title}
                  </h4>
                  <p className="text-foreground-muted" style={{
                    fontSize: 'clamp(0.625rem, 0.8vw, 0.75rem)',
                    marginBottom: 'var(--space-2)'
                  }}>
                    {notification.message}
                  </p>
                  {notification.action && (
                    <Link href={notification.action.href}>
                      <Button variant="outline" size="sm" style={{
                        fontSize: 'clamp(0.625rem, 0.8vw, 0.75rem)',
                        height: 'clamp(1.5rem, 6vw, 1.75rem)'
                      }}>
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
      icon: <Code className="w-5 h-5 text-primary" />,
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
      icon: <Palette className="w-5 h-5 text-primary" />,
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
