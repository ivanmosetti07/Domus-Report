"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChatWidget } from "@/components/widget/chat-widget"
import { Smartphone, Play, Sparkles, CheckCircle, Code, Zap } from "lucide-react"

interface DemoSectionProps {
  showWidget: boolean
  onToggleWidget: (show: boolean) => void
}

export function DemoSection({ showWidget, onToggleWidget }: DemoSectionProps) {
  return (
    <section id="demo" className="w-full py-16 sm:py-20 lg:py-24 xl:py-32 bg-surface-2">
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-[1400px] mx-auto">
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
            <Smartphone className="w-4 h-4 mr-2" />
            Demo Live
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6">
            Chatta con l&apos;AI.
            <br className="hidden sm:block" /> Guarda la{" "}
            <span className="text-primary">valutazione real-time</span>
          </h2>
          <p className="text-lg sm:text-xl text-foreground-muted max-w-3xl mx-auto px-4">
            Questo chatbot conversazionale è identico a quello che installerai. Prova la conversazione AI e vedi la stima OMI generarsi in tempo reale.
          </p>
        </div>

        <div className="relative">
          {!showWidget ? (
            <div
              className="bg-card rounded-3xl border-2 border-dashed border-border hover:border-primary transition-all p-20 text-center group cursor-pointer"
              onClick={() => onToggleWidget(true)}
            >
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-hover rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-transform">
                <Play className="w-12 h-12 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Avvia la demo interattiva</h3>
              <p className="text-foreground-muted mb-8">Nessuna registrazione richiesta</p>
              <Button size="lg" className="text-lg px-8 py-6 shadow-xl">
                <Sparkles className="w-5 h-5 mr-2" />
                Inizia la demo
              </Button>
            </div>
          ) : (
            <div className="bg-card rounded-3xl shadow-2xl p-8 border-2 border-primary/20">
              <ChatWidget widgetId="demo" mode="inline" isDemo={true} />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 mt-12">
          {[
            { icon: CheckCircle, text: "Installazione 1-click" },
            { icon: Code, text: "Compatibile con ogni sito" },
            { icon: Zap, text: "100% personalizzabile" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="font-semibold text-foreground">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
