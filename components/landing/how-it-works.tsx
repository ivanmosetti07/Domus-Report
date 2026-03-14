"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Zap, ChevronRight } from "lucide-react"
import { SectionHeader } from "./section-header"
import { STEPS } from "./landing-data"
import { useReveal } from "./use-reveal"

export function HowItWorks() {
  const ref = useReveal()

  return (
    <section className="w-full py-16 sm:py-20 lg:py-24 xl:py-32 bg-background">
      <div ref={ref} className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-[1600px] mx-auto reveal-stagger">
        <SectionHeader
          badge={{ icon: Zap, label: "Come funziona" }}
          title={
            <>
              Conversazione AI. Valutazione istantanea.{" "}
              <span className="text-primary">Lead qualificato.</span>
            </>
          }
          subtitle="Il chatbot dialoga, raccoglie dati, calcola la stima OMI e qualifica - tutto in una conversazione"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

          {STEPS.map((step, idx) => (
            <div key={step.step} className="reveal relative">
              <Card className="card-glow border-2 border-border hover:border-primary h-full group">
                <CardContent className="p-6 sm:p-8 space-y-4 sm:space-y-6">
                  <div className="relative">
                    <div className="text-5xl sm:text-6xl font-black text-primary/10 absolute -top-3 -left-2">
                      {step.step}
                    </div>
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary to-primary-hover rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <step.icon className="w-7 h-7 sm:w-8 sm:h-8 text-primary-foreground" />
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground">{step.title}</h3>
                  <p className="text-sm sm:text-base text-foreground-muted leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
              {idx < 3 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                  <ChevronRight className="w-8 h-8 text-primary" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="reveal mt-12 sm:mt-16 text-center">
          <p className="text-xl sm:text-2xl font-bold text-foreground mb-3">
            L&apos;AI fa il lavoro pesante. Tu chiudi gli incarichi.
          </p>
          <p className="text-base sm:text-lg text-foreground-muted">
            Conversazione + Qualificazione + Valutazione = Lead pronto in 60 secondi
          </p>
        </div>
      </div>
    </section>
  )
}
