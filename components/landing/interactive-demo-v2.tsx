"use client"

import dynamic from "next/dynamic"
import { Smartphone, Play, CheckCircle, Code, Zap, Loader2 } from "lucide-react"
import { ScrollReveal } from "./use-in-view"

const ChatWidget = dynamic(
  () => import("@/components/widget/chat-widget").then((m) => ({ default: m.ChatWidget })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full w-full bg-surface">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    ),
  }
)

interface InteractiveDemoV2Props {
  showWidget: boolean
  onToggleWidget: (show: boolean) => void
  onDemoComplete?: () => void
}

export function InteractiveDemoV2({ showWidget, onToggleWidget, onDemoComplete }: InteractiveDemoV2Props) {
  return (
    <section id="demo" className="w-full py-20 lg:py-32 bg-background relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-surface-2/20" />
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-[1600px] mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

        {/* Left Content */}
        <ScrollReveal className="lg:w-1/2 w-full space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full w-fit">
            <Smartphone className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Demo Live Interattiva</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-foreground">
            Chatta con l&apos;AI. <br/>Guarda la{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-hover">
              magia in azione.
            </span>
          </h2>

          <p className="text-lg sm:text-xl text-foreground-muted leading-relaxed max-w-xl">
            Questo chatbot è perfettamente identico a quello che installerai sul tuo sito. Testa una conversazione reale e vedi la stima OMI generarsi istantaneamente.
          </p>

          <div className="flex flex-col gap-4 pt-4">
            {[
              { icon: CheckCircle, text: "Installazione 1-click su qualsiasi sito" },
              { icon: Code, text: "Completamente white-label e personalizzabile" },
              { icon: Zap, text: "Velocità di risposta AI < 1 secondo" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-surface/30 p-3 rounded-xl border border-border/30 w-fit"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="font-semibold text-sm sm:text-base text-foreground">{item.text}</span>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Right Content - Phone Mockup */}
        <ScrollReveal
          animation="reveal-scale"
          className="lg:w-1/2 w-full flex justify-center lg:justify-end relative"
        >
          {/* Glowing Aura */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[600px] bg-primary/20 rounded-full blur-[80px] animate-pulse-glow" />

          {/* Device Mockup container */}
          <div className="relative w-[340px] h-[720px] bg-black rounded-[3rem] border-[8px] border-surface shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10 overflow-hidden flex flex-col">
            {/* Dynamic Island / Notch */}
            <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50 mt-2 pointer-events-none">
              <div className="w-32 h-6 bg-black rounded-b-3xl"></div>
            </div>

            <div className="flex-1 w-full bg-white relative overflow-hidden">
              {!showWidget ? (
                <div
                  className="absolute inset-0 bg-surface flex flex-col items-center justify-center p-8 text-center cursor-pointer group hover:bg-surface-2 transition-colors"
                  onClick={() => onToggleWidget(true)}
                >
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center mb-8 shadow-xl shadow-primary/30 group-hover:shadow-primary/50 transition-shadow animate-pulse">
                    <Play className="w-10 h-10 text-primary-foreground ml-1" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">Avvia Demo</h3>
                  <p className="text-foreground-muted text-sm px-4">Tocca per iniziare una conversazione AI live</p>
                </div>
              ) : (
                <div className="absolute inset-0 pt-10">
                  <ChatWidget widgetId="demo" mode="inline" isDemo={true} onDemoComplete={onDemoComplete} />
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>

      </div>
    </section>
  )
}
