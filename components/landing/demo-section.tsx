"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Smartphone, Play, Sparkles, CheckCircle, Code, Zap, Loader2 } from "lucide-react"
import { useReveal } from "./use-reveal"

const ChatWidget = dynamic(
  () => import("@/components/widget/chat-widget").then((m) => ({ default: m.ChatWidget })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    ),
  }
)

interface DemoSectionProps {
  showWidget: boolean
  onToggleWidget: (show: boolean) => void
}

export function DemoSection({ showWidget, onToggleWidget }: DemoSectionProps) {
  const ref = useReveal()

  return (
    <section id="demo" className="w-full py-16 sm:py-20 lg:py-24 xl:py-32 bg-surface-2">
      <div ref={ref} className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-[1400px] mx-auto reveal-stagger">
        <div className="reveal text-center mb-12 sm:mb-16">
          <Badge className="mb-4 sm:mb-6 bg-primary/10 text-primary border-primary/20">
            <Smartphone className="w-4 h-4 mr-2" />
            Demo Live
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 sm:mb-6">
            Chatta con l&apos;AI. Guarda la{" "}
            <span className="text-primary">valutazione real-time</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-foreground-muted max-w-3xl mx-auto px-4">
            Questo chatbot conversazionale è identico a quello che installerai. Prova la conversazione AI e vedi la stima OMI generarsi in tempo reale.
          </p>
        </div>

        <div className="reveal relative">
          {!showWidget ? (
            <div
              className="bg-card rounded-3xl border-2 border-dashed border-border hover:border-primary transition-all p-12 sm:p-16 lg:p-20 text-center group cursor-pointer"
              onClick={() => onToggleWidget(true)}
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary to-primary-hover rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-transform">
                <Play className="w-10 h-10 sm:w-12 sm:h-12 text-primary-foreground" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">Avvia la demo interattiva</h3>
              <p className="text-sm sm:text-base text-foreground-muted mb-6 sm:mb-8">Nessuna registrazione richiesta</p>
              <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 shadow-xl">
                <Sparkles className="w-5 h-5 mr-2" />
                Inizia la demo
              </Button>
            </div>
          ) : (
            <div className="bg-card rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border-2 border-primary/20">
              <ChatWidget widgetId="demo" mode="inline" isDemo={true} />
            </div>
          )}
        </div>

        <div className="reveal flex flex-wrap items-center justify-center gap-6 sm:gap-8 mt-10 sm:mt-12">
          {[
            { icon: CheckCircle, text: "Installazione 1-click" },
            { icon: Code, text: "Compatibile con ogni sito" },
            { icon: Zap, text: "100% personalizzabile" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <span className="font-semibold text-sm sm:text-base text-foreground">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
