"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Sparkles,
  Zap,
  Database,
  Shield,
  CheckCircle,
  ArrowRight,
  Play,
  TrendingUp,
  Clock,
  Award,
} from "lucide-react"
import { HERO_BADGE, HERO_TRUST_ITEMS } from "./landing-data"

interface HeroSectionProps {
  onDemoClick: () => void
}

export function HeroSection({ onDemoClick }: HeroSectionProps) {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse opacity-30" />
        <div className="absolute top-60 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse opacity-20" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-20 right-1/3 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-pulse opacity-25" style={{ animationDelay: "4s" }} />
      </div>

      <div className="relative w-full px-4 sm:px-6 lg:px-12 xl:px-20 py-16 sm:py-20 lg:py-28 xl:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 xl:gap-20 items-center max-w-[1800px] mx-auto">
          {/* Left Column - Content */}
          <div className="space-y-6 sm:space-y-8 lg:space-y-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-primary/10 border border-primary/20 rounded-full">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary animate-pulse" />
              <span className="text-xs sm:text-sm font-semibold text-primary">{HERO_BADGE}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[1.1] tracking-tight">
              Il chatbot AI che valuta
              <br className="hidden sm:block" /> immobili in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-hover inline-block">
                tempo
                <br className="sm:hidden" /> reale
              </span>
            </h1>

            <p className="text-lg sm:text-xl lg:text-2xl text-foreground-muted leading-relaxed">
              <strong className="text-foreground">Conversazione AI + Valutazione istantanea.</strong>{" "}
              Il tuo chatbot qualifica lead con stime OMI precise mentre parla con i clienti. Zero form, solo dialogo naturale.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: Sparkles, label: "AI Conversazionale Avanzata" },
                { icon: Zap, label: "Valutazione Real-Time" },
                { icon: Database, label: "Dati OMI Ufficiali" },
              ].map((pill) => (
                <div key={pill.label} className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-full">
                  <pill.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{pill.label}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register" className="group">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-7 font-bold shadow-2xl hover:shadow-primary/50 transition-all duration-300">
                  Attiva il tuo AI Agent
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-lg px-8 py-7 border-2 hover:bg-surface group"
                onClick={onDemoClick}
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Vedi chatbot in azione
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-foreground-muted">
              {HERO_TRUST_ITEMS.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Chat Mockup */}
          <div className="relative lg:h-[700px] flex items-center justify-center">
            <div className="relative w-full max-w-lg">
              {/* Main Chat Card */}
              <Card className="shadow-2xl border-2 border-border hover:border-primary/50 transition-all duration-300 relative z-10">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-primary to-primary-hover p-6 text-primary-foreground">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <Sparkles className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">AI Assistant Immobiliare</h3>
                        <p className="text-sm opacity-90">Intelligenza Artificiale &bull; Valutazione Real-Time</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-card space-y-4">
                    <div className="bg-surface/80 backdrop-blur-sm rounded-2xl rounded-tl-none p-4 border border-border">
                      <p className="text-sm font-medium">Ciao! Dove si trova il tuo immobile?</p>
                    </div>

                    <div className="flex justify-end">
                      <div className="bg-gradient-to-br from-primary to-primary-hover text-primary-foreground rounded-2xl rounded-tr-none p-4 max-w-[80%] shadow-lg">
                        <p className="text-sm font-medium">Via Roma 15, Milano</p>
                      </div>
                    </div>

                    <div className="bg-surface/80 backdrop-blur-sm rounded-2xl rounded-tl-none p-4 border border-border">
                      <p className="text-sm font-medium mb-3">Perfetto! Che tipo di immobile è?</p>
                      <div className="grid grid-cols-2 gap-2">
                        {["Appartamento", "Villa", "Ufficio", "Locale"].map((type) => (
                          <div
                            key={type}
                            className="bg-background border border-border hover:border-primary hover:bg-primary/5 rounded-xl px-3 py-2.5 text-xs text-center font-semibold cursor-pointer transition-all"
                          >
                            {type}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="flex items-center gap-3 text-xs text-foreground-muted">
                        <div className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          <span>Sicuro</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Database className="w-3 h-3" />
                          <span>Dati OMI</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-primary">
                        <Zap className="w-3 h-3" />
                        <span>Risposta istantanea</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Floating Stats */}
              <div className="absolute -left-8 top-20 animate-float hidden lg:block" style={{ animationDelay: "0.5s" }}>
                <div className="bg-card border-2 border-primary/50 shadow-xl rounded-2xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">+234%</div>
                      <div className="text-xs text-foreground-muted">Lead qualificati</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -right-8 bottom-32 animate-float hidden lg:block" style={{ animationDelay: "1s" }}>
                <div className="bg-card border-2 border-primary/50 shadow-xl rounded-2xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">24/7</div>
                      <div className="text-xs text-foreground-muted">Sempre attivo</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -left-12 bottom-16 animate-float hidden lg:block" style={{ animationDelay: "1.5s" }}>
                <div className="bg-card border-2 border-primary/50 shadow-xl rounded-2xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                      <Award className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">98%</div>
                      <div className="text-xs text-foreground-muted">Precisione</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
