"use client"

import * as React from "react"
import Link from "next/link"
import { motion, Variants } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BillingIntervalToggle } from "@/components/ui/billing-interval-toggle"
import { CheckCircle, X, ArrowRight, Sparkles } from "lucide-react"
import { type BillingInterval, getMonthlyEquivalent, BILLING_INTERVALS } from "@/lib/plan-limits"
import { SectionHeader } from "./section-header"
import { PLANS } from "./landing-data"

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
}

export function PricingSection() {
  const [billingInterval, setBillingInterval] = React.useState<BillingInterval>("monthly")

  const getDisplayPrice = (monthlyPrice: number): number => {
    if (monthlyPrice === 0) return 0
    const slug = monthlyPrice === 50 ? "basic" : "premium"
    return getMonthlyEquivalent(slug as "basic" | "premium", billingInterval) / 100
  }

  const discount = BILLING_INTERVALS[billingInterval].discount

  return (
    <section className="w-full py-24 sm:py-32 bg-surface relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-[1400px] mx-auto relative z-10">
        <SectionHeader
          badge={{ icon: Sparkles, label: "Prezzi trasparenti" }}
          title={
            <>
              Piani senza vincoli, <br className="hidden md:block" />
              <span className="text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.3)]">risultati concreti</span>
            </>
          }
          subtitle="Tutti i piani includono 7 giorni di prova gratuita. Nessuna carta richiesta."
        />

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, margin: "-50px" }}
           transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
           className="flex justify-center mt-12 mb-16"
        >
          <BillingIntervalToggle
            value={billingInterval}
            onChange={setBillingInterval}
          />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center"
        >
          {PLANS.map((plan) => {
            const displayPrice = getDisplayPrice(plan.monthlyPrice)
            const isRecommended = plan.recommended

            return (
              <motion.div key={plan.slug} variants={itemVariants} className={`relative ${isRecommended ? 'z-10' : 'z-0'}`}>
                {isRecommended && (
                  <div className="absolute -inset-1 bg-gradient-to-b from-primary to-accent rounded-[32px] blur opacity-40" />
                )}
                
                <div className={`relative h-full flex flex-col bg-surface-2/80 backdrop-blur-xl border rounded-[32px] overflow-hidden ${
                  isRecommended 
                    ? "border-primary/50 shadow-2xl scale-100 lg:scale-105" 
                    : "border-white/5 hover:border-white/10"
                }`}>
                  {isRecommended && (
                    <div className="bg-gradient-to-r from-primary to-accent py-2 text-center">
                      <span className="text-primary-foreground text-xs font-black tracking-widest uppercase">
                        Più Popolare
                      </span>
                    </div>
                  )}

                  <div className={`p-8 sm:p-10 flex flex-col flex-grow ${isRecommended ? 'bg-primary/5' : ''}`}>
                    <div className="mb-8">
                      <h3 className={`text-2xl font-bold mb-2 ${isRecommended ? "text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.4)]" : "text-foreground"}`}>
                        {plan.name}
                      </h3>
                      <p className="text-foreground-muted">{plan.description}</p>
                    </div>

                    <div className="mb-8">
                      <div className="flex items-baseline gap-2">
                        <span className={`text-5xl lg:text-6xl font-black ${isRecommended ? "text-primary" : "text-foreground"}`}>
                          €{displayPrice}
                        </span>
                        <span className="text-xl text-foreground-muted">/mese</span>
                      </div>
                      
                      {discount > 0 && plan.monthlyPrice > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm line-through text-foreground-muted">€{plan.monthlyPrice}/mese</span>
                          <Badge variant="success" className="text-xs">Risparmia {discount * 100}%</Badge>
                        </div>
                      )}
                    </div>

                    <ul className="space-y-4 mb-10 flex-grow">
                      {plan.features.map((feature) => (
                         <li key={feature.text} className="flex items-start gap-4">
                          {feature.included ? (
                            <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                          ) : (
                            <X className="w-6 h-6 text-foreground-subtle flex-shrink-0" />
                          )}
                          <span className={`${
                            feature.included
                              ? isRecommended ? "text-foreground font-medium" : "text-foreground/90"
                              : "text-foreground-subtle"
                          }`}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Link href="/register" className="block mt-auto">
                      <Button
                        size="lg"
                        className={`w-full text-lg py-7 rounded-2xl font-bold ${
                          isRecommended 
                            ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.4)] hover:shadow-[0_0_30px_rgba(var(--primary),0.6)]" 
                            : "bg-surface text-foreground border border-white/10 hover:bg-surface-2 hover:border-white/20"
                        }`}
                      >
                        {plan.ctaText}
                        {isRecommended && <ArrowRight className="w-5 h-5 ml-2" />}
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center text-foreground-muted mt-16 text-sm sm:text-base font-medium"
        >
          Tutti i piani includono &bull; 7 giorni gratis &bull; Nessuna carta richiesta &bull; Cancella quando vuoi
        </motion.p>
      </div>
    </section>
  )
}
