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
    <Card className={`relative h-full flex flex-col ${
      recommended
        ? 'border-2 border-primary shadow-lg'
        : isSelected
        ? 'border-2 border-green-500'
        : 'border border-gray-200'
    }`}>
      {recommended && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Consigliato
          </div>
        </div>
      )}

      <CardHeader className="text-center pb-4 pt-8">
        <div className="mb-4">
          {name === 'Premium' && <Crown className="w-10 h-10 mx-auto text-primary" />}
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
        <p className="text-sm text-gray-600 mb-4">{description}</p>

        <div className="mb-2">
          <span className="text-4xl font-bold text-gray-900">{price}</span>
          {priceSubtext && (
            <span className="text-gray-600 ml-2">{priceSubtext}</span>
          )}
        </div>

        {trialDays && trialDays > 0 && (
          <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold mt-2">
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
                    ? 'text-green-600'
                    : 'text-gray-300'
                }`}
              />
              <span className={`text-sm ${
                feature.included
                  ? 'text-gray-700'
                  : 'text-gray-400'
              }`}>
                {feature.text}
              </span>
            </li>
          ))}
        </ul>

        <Button
          onClick={onSelect}
          disabled={isLoading}
          className={`w-full ${
            recommended
              ? 'bg-primary hover:bg-primary/90'
              : isSelected
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-gray-900 hover:bg-gray-800'
          }`}
          size="lg"
        >
          {isLoading ? 'Caricamento...' : ctaText}
        </Button>
      </CardContent>
    </Card>
  )
}
