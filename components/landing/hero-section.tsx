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
  MapPin,
  BarChart3,
  Home,
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
        <div className="absolute -top-40 -right-40 w-80 sm:w-96 h-80 sm:h-96 bg-primary/20 rounded-full blur-3xl animate-pulse opacity-30" />
        <div className="absolute top-60 -left-40 w-80 sm:w-96 h-80 sm:h-96 bg-primary/10 rounded-full blur-3xl animate-pulse opacity-20" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-20 right-1/3 w-80 sm:w-96 h-80 sm:h-96 bg-primary/15 rounded-full blur-3xl animate-pulse opacity-25" style={{ animationDelay: "4s" }} />
      </div>

      <div className="relative w-full px-4 sm:px-6 lg:px-12 xl:px-20 py-12 sm:py-16 lg:py-24 xl:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center max-w-[1600px] mx-auto">
          {/* Left Column - Content */}
          <div className="space-y-5 sm:space-y-7 lg:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-primary/10 border border-primary/20 rounded-full">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary animate-pulse" />
              <span className="text-xs sm:text-sm font-semibold text-primary">{HERO_BADGE}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.1] tracking-tight">
              Il chatbot AI che valuta immobili in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-hover">
                tempo reale
              </span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-foreground-muted leading-relaxed max-w-xl">
              <strong className="text-foreground">Conversazione AI + Valutazione istantanea.</strong>{" "}
              Il tuo chatbot qualifica lead con stime OMI precise mentre parla con i clienti. Zero form, solo dialogo naturale.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {[
                { icon: Sparkles, label: "AI Conversazionale" },
                { icon: Zap, label: "Valutazione Real-Time" },
                { icon: Database, label: "Dati OMI Ufficiali" },
              ].map((pill) => (
                <div key={pill.label} className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-surface border border-border rounded-full">
                  <pill.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  <span className="text-xs sm:text-sm font-medium text-foreground">{pill.label}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link href="/register" className="group">
                <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-6 sm:py-7 font-bold shadow-2xl hover:shadow-primary/50 transition-all duration-300">
                  Attiva il tuo AI Agent
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-6 sm:py-7 border-2 hover:bg-surface group"
                onClick={onDemoClick}
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Vedi in azione
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs sm:text-sm text-foreground-muted">
              {HERO_TRUST_ITEMS.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Valuation Result Card */}
          <div className="relative flex items-center justify-center mt-4 lg:mt-0">
            <div className="relative w-full max-w-md lg:max-w-lg">
              {/* Main Valuation Card */}
              <Card className="shadow-2xl border-2 border-border relative z-10 overflow-hidden">
                <CardContent className="p-0">
                  {/* Header */}
                  <div className="bg-gradient-to-br from-primary to-primary-hover p-4 sm:p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                          <Home className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm sm:text-base text-primary-foreground">Valutazione Immobiliare</h3>
                          <p className="text-xs opacity-90 text-primary-foreground/80">Generata dall&apos;AI in 45 secondi</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-1">
                        <Database className="w-3 h-3 text-primary-foreground" />
                        <span className="text-[10px] sm:text-xs font-bold text-primary-foreground">OMI</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 bg-card space-y-4 sm:space-y-5">
                    {/* Address */}
                    <div className="flex items-center gap-2 text-foreground-muted">
                      <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm font-medium">Via Roma 15, Milano &bull; Appartamento &bull; 85 mq</span>
                    </div>

                    {/* Main Price */}
                    <div className="text-center py-3 sm:py-4">
                      <div className="text-xs sm:text-sm text-foreground-muted mb-1">Valore stimato</div>
                      <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-primary">€285.000</div>
                      <div className="text-sm text-foreground-muted mt-1">Range: €260.000 &ndash; €310.000</div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-foreground-muted">
                        <span>€260k</span>
                        <span className="font-bold text-primary">€285k</span>
                        <span>€310k</span>
                      </div>
                      <div className="h-2.5 bg-surface-2 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary/60 via-primary to-primary/60 rounded-full" style={{ width: "52%" }} />
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 pt-2">
                      <div className="text-center p-2.5 sm:p-3 bg-surface-2/50 rounded-xl border border-border/50">
                        <MapPin className="w-4 h-4 text-primary mx-auto mb-1" />
                        <div className="text-xs font-bold text-foreground">Zona B2</div>
                        <div className="text-[10px] text-foreground-muted">Centro</div>
                      </div>
                      <div className="text-center p-2.5 sm:p-3 bg-surface-2/50 rounded-xl border border-border/50">
                        <BarChart3 className="w-4 h-4 text-primary mx-auto mb-1" />
                        <div className="text-xs font-bold text-foreground">€3.353</div>
                        <div className="text-[10px] text-foreground-muted">€/mq</div>
                      </div>
                      <div className="text-center p-2.5 sm:p-3 bg-surface-2/50 rounded-xl border border-border/50">
                        <TrendingUp className="w-4 h-4 text-primary mx-auto mb-1" />
                        <div className="text-xs font-bold text-foreground">+3.2%</div>
                        <div className="text-[10px] text-foreground-muted">Trend annuo</div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-3 text-xs text-foreground-muted">
                        <div className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          <span>Dati verificati</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          <span>Real-time</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-primary">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Completata</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Floating Stats */}
              <div className="absolute -left-4 sm:-left-8 top-16 sm:top-20 animate-float hidden lg:block" style={{ animationDelay: "0.5s" }}>
                <div className="bg-card border-2 border-primary/50 shadow-xl rounded-2xl p-3 sm:p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-lg sm:text-2xl font-bold text-foreground">+234%</div>
                      <div className="text-[10px] sm:text-xs text-foreground-muted">Lead qualificati</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -right-4 sm:-right-8 bottom-28 sm:bottom-32 animate-float hidden lg:block" style={{ animationDelay: "1s" }}>
                <div className="bg-card border-2 border-primary/50 shadow-xl rounded-2xl p-3 sm:p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-lg sm:text-2xl font-bold text-foreground">24/7</div>
                      <div className="text-[10px] sm:text-xs text-foreground-muted">Sempre attivo</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -left-6 sm:-left-12 bottom-12 sm:bottom-16 animate-float hidden lg:block" style={{ animationDelay: "1.5s" }}>
                <div className="bg-card border-2 border-primary/50 shadow-xl rounded-2xl p-3 sm:p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                      <Award className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-lg sm:text-2xl font-bold text-foreground">98%</div>
                      <div className="text-[10px] sm:text-xs text-foreground-muted">Precisione</div>
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
