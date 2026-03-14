"use client"

import { Badge } from "@/components/ui/badge"
import { AlertTriangle, XCircle, CheckCircle } from "lucide-react"
import { PROBLEMS, SOLUTIONS } from "./landing-data"
import { useReveal } from "./use-reveal"

export function ProblemSolution() {
  const ref = useReveal()

  return (
    <section className="relative w-full overflow-hidden bg-[#0d1b1f] py-16 sm:py-20 lg:py-24 xl:py-32">
      <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:30px_30px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />

      <div ref={ref} className="reveal relative w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-[1800px] mx-auto">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <Badge className="mb-6 bg-white/10 text-white border-white/20 backdrop-blur-sm">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Il vero problema
          </Badge>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6 leading-tight text-white">
            I form non qualificano.
            <br className="hidden sm:block" />{" "}
            <span className="text-primary">L&apos;AI sì.</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white/75 max-w-3xl mx-auto">
            I form statici raccolgono dati vaghi. Il chatbot AI conversa, qualifica in tempo reale e genera valutazioni precise.
          </p>
        </div>

        {/* Before / After Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 reveal-stagger">
          {/* PRIMA */}
          <div className="reveal rounded-2xl border border-red-500/30 bg-red-950/40 backdrop-blur-sm p-6 sm:p-8 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-full">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-bold text-red-400">PRIMA</span>
            </div>
            <div className="space-y-4">
              {PROBLEMS.map((item) => (
                <div key={item.title} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-sm text-white/70 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DOPO */}
          <div className="reveal rounded-2xl border border-primary/30 bg-primary/10 backdrop-blur-sm p-6 sm:p-8 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/20 border border-primary/30 rounded-full">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-primary">DOPO - Con DomusReport</span>
            </div>
            <div className="space-y-4">
              {SOLUTIONS.map((item) => (
                <div key={item.title} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-primary/10">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-sm text-white/70 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 bg-primary/20 backdrop-blur-sm border-2 border-primary/30 rounded-3xl p-8 text-center">
          <p className="text-xl sm:text-2xl font-bold text-white mb-2">
            Il chatbot AI converte visitatori in lead qualificati
          </p>
          <p className="text-base sm:text-lg text-white/80">
            <strong className="text-primary">Conversazione + Qualificazione + Valutazione</strong> = Lead pronto in 60 secondi
          </p>
        </div>
      </div>
    </section>
  )
}
