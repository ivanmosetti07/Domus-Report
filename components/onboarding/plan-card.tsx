'use client'

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Crown, Sparkles } from "lucide-react"

interface PlanFeature {
  text: string
  included: boolean
}

interface PlanCardProps {
  name: string
  description: string
  price: string
  priceSubtext?: string
  features: PlanFeature[]
  trialDays?: number
  recommended?: boolean
  ctaText: string
  onSelect: () => void
  isLoading?: boolean
  isSelected?: boolean
}

export function PlanCard({
  name,
  description,
  price,
  priceSubtext,
  features,
  trialDays,
  recommended,
  ctaText,
  onSelect,
  isLoading,
  isSelected
}: PlanCardProps) {
  return (
    <Card className={`relative h-full flex flex-col transition-all duration-240 ${
      recommended
        ? 'border-2 border-primary shadow-glow-primary'
        : isSelected
        ? 'border-2 border-primary'
        : 'border border-border hover:border-border-hover'
    }`}>
      {recommended && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-soft">
            <Sparkles className="w-3 h-3" />
            Consigliato
          </div>
        </div>
      )}

      <CardHeader className="text-center pb-4 pt-8">
        <div className="mb-4">
          {name === 'Premium' && <Crown className="w-10 h-10 mx-auto text-primary" />}
        </div>

        <h3 className="text-2xl font-bold text-foreground mb-2">{name}</h3>
        <p className="text-sm text-foreground-muted mb-4">{description}</p>

        <div className="mb-2">
          <span className="text-4xl font-bold text-foreground">{price}</span>
          {priceSubtext && (
            <span className="text-foreground-muted ml-2">{priceSubtext}</span>
          )}
        </div>

        {trialDays && trialDays > 0 && (
          <div className="inline-block bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-semibold mt-2 border border-primary/30">
            {trialDays} giorni gratis
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <ul className="space-y-3 mb-6 flex-1">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check
                className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  feature.included
                    ? 'text-primary'
                    : 'text-foreground-subtle'
                }`}
              />
              <span className={`text-sm ${
                feature.included
                  ? 'text-foreground'
                  : 'text-foreground-subtle line-through'
              }`}>
                {feature.text}
              </span>
            </li>
          ))}
        </ul>

        <Button
          onClick={onSelect}
          disabled={isLoading}
          className={`w-full transition-all duration-240 ${
            recommended
              ? 'bg-primary hover:bg-primary-hover text-primary-foreground shadow-soft hover:shadow-glow-primary'
              : isSelected
              ? 'bg-primary hover:bg-primary-hover text-primary-foreground'
              : 'bg-surface-2 hover:bg-card-hover text-foreground border border-border hover:border-primary/50'
          }`}
          size="lg"
        >
          {isLoading ? 'Caricamento...' : ctaText}
        </Button>
      </CardContent>
    </Card>
  )
}
