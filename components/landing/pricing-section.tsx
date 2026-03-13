"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BillingIntervalToggle } from "@/components/ui/billing-interval-toggle"
import { CheckCircle, X, ArrowRight, Sparkles } from "lucide-react"
import { type BillingInterval, getMonthlyEquivalent, BILLING_INTERVALS } from "@/lib/plan-limits"
import { SectionHeader } from "./section-header"
import { PLANS } from "./landing-data"

export function PricingSection() {
  const [billingInterval, setBillingInterval] = React.useState<BillingInterval>("monthly")

  const getDisplayPrice = (monthlyPrice: number): number => {
    if (monthlyPrice === 0) return 0
    const slug = monthlyPrice === 50 ? "basic" : "premium"
    return getMonthlyEquivalent(slug as "basic" | "premium", billingInterval) / 100
  }

  const discount = BILLING_INTERVALS[billingInterval].discount

  return (
    <section className="w-full py-16 sm:py-20 lg:py-24 xl:py-32 bg-surface">
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-[1600px] mx-auto">
        <SectionHeader
          badge={{ icon: Sparkles, label: "Prezzi trasparenti" }}
          title={
            <>
              Piani senza vincoli,
              <br className="hidden sm:block" />{" "}
              <span className="text-primary">risultati concreti</span>
            </>
          }
          subtitle="Tutti i piani includono 7 giorni di prova gratuita. Nessuna carta richiesta."
        />

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <BillingIntervalToggle
            value={billingInterval}
            onChange={setBillingInterval}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {PLANS.map((plan) => {
            const displayPrice = getDisplayPrice(plan.monthlyPrice)
            const isRecommended = plan.recommended

            return (
              <Card
                key={plan.slug}
                className={`border-2 transition-all ${
                  isRecommended
                    ? "border-primary shadow-glow-primary relative lg:scale-105"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {isRecommended && (
                  <div className="absolute -top-4 sm:-top-5 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-primary to-primary-hover text-primary-foreground px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-bold shadow-xl">
                      PIÙ POPOLARE
                    </Badge>
                  </div>
                )}

                <CardContent className={`p-6 sm:p-8 lg:p-10 space-y-6 sm:space-y-8 ${
                  isRecommended ? "bg-gradient-to-b from-primary/5 to-transparent pt-8 sm:pt-10" : ""
                }`}>
                  <div>
                    <h3 className={`text-3xl font-black mb-2 ${isRecommended ? "text-primary" : "text-foreground"}`}>
                      {plan.name}
                    </h3>
                    <p className="text-foreground-muted">{plan.description}</p>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className={`text-6xl font-black ${isRecommended ? "text-primary" : "text-foreground"}`}>
                      €{displayPrice}
                    </span>
                    <span className="text-xl text-foreground-muted">/mese</span>
                  </div>

                  {discount > 0 && plan.monthlyPrice > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm line-through text-foreground-muted">€{plan.monthlyPrice}/mese</span>
                      <Badge variant="success" className="text-xs">-{discount * 100}%</Badge>
                    </div>
                  )}

                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature.text} className="flex items-center gap-3">
                        {feature.included ? (
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                        ) : (
                          <X className="w-5 h-5 text-foreground-subtle flex-shrink-0" />
                        )}
                        <span className={`${
                          feature.included
                            ? isRecommended ? "text-foreground font-medium" : "text-foreground"
                            : "text-foreground-subtle"
                        }`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/register" className="block">
                    <Button
                      size="lg"
                      variant={plan.ctaVariant as "outline" | "default"}
                      className={`w-full text-lg py-6 ${isRecommended ? "shadow-xl" : ""}`}
                    >
                      {plan.ctaText}
                      {isRecommended && <ArrowRight className="w-5 h-5 ml-2" />}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <p className="text-center text-foreground-muted mt-12 text-lg">
          Tutti i piani &bull; 7 giorni gratis &bull; Nessuna carta richiesta &bull; Cancella quando vuoi
        </p>
      </div>
    </section>
  )
}
