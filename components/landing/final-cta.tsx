"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Zap, CheckCircle } from "lucide-react"
import { useReveal } from "./use-reveal"

export function FinalCta() {
  const ref = useReveal()

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-primary via-primary-hover to-primary text-primary-foreground py-16 sm:py-20 lg:py-24 xl:py-32">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

      <div ref={ref} className="relative w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-[1400px] mx-auto text-center space-y-8 sm:space-y-10 lg:space-y-12 reveal-stagger">
        <div className="reveal space-y-4 sm:space-y-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight">
            Il chatbot AI che lavora per te 24/7
          </h2>
          <p className="text-base sm:text-lg lg:text-xl opacity-90 max-w-3xl mx-auto leading-relaxed px-4">
            Conversazione intelligente. Valutazione real-time. Lead qualificati. Tutto automatico mentre dormi.
          </p>
        </div>

        <div className="reveal flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
          <Link href="/register">
            <Button
              size="lg"
              variant="secondary"
              className="text-base sm:text-lg px-8 sm:px-12 py-6 sm:py-8 font-bold shadow-2xl hover:shadow-3xl transition-all text-primary group"
            >
              Attiva il tuo AI Agent ora
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="reveal flex flex-wrap items-center justify-center gap-6 sm:gap-8 pt-6 sm:pt-8">
          {[
            { icon: Sparkles, text: "AI Avanzata inclusa" },
            { icon: Zap, text: "Valutazioni real-time" },
            { icon: CheckCircle, text: "7 giorni gratis" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2 sm:gap-3">
              <item.icon className="w-5 h-5 sm:w-6 sm:h-6 opacity-90" />
              <span className="font-semibold text-sm sm:text-base lg:text-lg opacity-90">{item.text}</span>
            </div>
          ))}
        </div>

        <div className="reveal pt-10 sm:pt-12 border-t border-white/20">
          <p className="text-sm sm:text-base lg:text-lg opacity-75">
            Dubbi? Contattaci:{" "}
            <a
              href="mailto:support@domusreport.com"
              className="font-bold underline hover:opacity-80 transition-opacity"
            >
              support@domusreport.com
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
