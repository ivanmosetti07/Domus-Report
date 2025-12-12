'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, ChevronRight } from "lucide-react"
import Link from "next/link"

interface ChecklistItem {
  id: string
  title: string
  description: string
  completed: boolean
  href?: string
}

interface WelcomeChecklistProps {
  agencyName: string
  planName: string
  trialDaysRemaining?: number
  trialEndsAt?: Date
}

export function WelcomeChecklist({
  agencyName,
  planName,
  trialDaysRemaining,
  trialEndsAt
}: WelcomeChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: 'account',
      title: 'Account creato',
      description: 'Il tuo account è attivo e pronto',
      completed: true
    },
    {
      id: 'widget',
      title: 'Configura il tuo primo widget',
      description: 'Personalizza il widget per il tuo sito',
      completed: false,
      href: '/dashboard/widgets'
    },
    {
      id: 'install',
      title: 'Installa widget sul tuo sito',
      description: 'Copia il codice e incollalo nel tuo sito',
      completed: false,
      href: '/dashboard/widgets'
    },
    {
      id: 'branding',
      title: 'Personalizza colori brand',
      description: 'Adatta il widget allo stile del tuo brand',
      completed: false,
      href: '/dashboard/settings'
    },
    {
      id: 'lead',
      title: 'Genera il primo lead',
      description: 'Prova il widget e raccogli la prima valutazione',
      completed: false,
      href: '/dashboard'
    }
  ])

  const completedCount = items.filter(item => item.completed).length
  const progressPercentage = (completedCount / items.length) * 100

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-2 border-primary/20">
        <CardHeader className="text-center pb-6">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
          </div>

          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
            Benvenuto in DomusReport, {agencyName}!
          </CardTitle>

          <p className="text-gray-600 mb-4">
            Il tuo piano <span className="font-semibold text-primary">{planName}</span> è attivo
            {trialDaysRemaining !== undefined && trialDaysRemaining > 0 && (
              <span className="text-green-600 font-semibold">
                {' '}con {trialDaysRemaining} giorni di prova gratuita
              </span>
            )}
          </p>

          {trialEndsAt && (
            <p className="text-sm text-gray-500">
              Trial scade il: {new Date(trialEndsAt).toLocaleDateString('it-IT', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          )}

          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {completedCount} di {items.length} passaggi completati
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3 mb-6">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                  item.completed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-gray-200 hover:border-primary/50'
                }`}
              >
                <div className="flex-shrink-0">
                  {item.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold ${
                    item.completed ? 'text-green-900' : 'text-gray-900'
                  }`}>
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>

                {!item.completed && item.href && (
                  <Link href={item.href}>
                    <Button variant="outline" size="sm">
                      <span className="hidden sm:inline">Inizia</span>
                      <ChevronRight className="w-4 h-4 sm:ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto" size="lg">
                Vai alla Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/widgets" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto" size="lg">
                Configura Widget
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
