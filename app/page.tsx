"use client"

import * as React from "react"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChatWidget } from "@/components/widget/chat-widget"
import {
  Zap,
  CheckCircle,
  ArrowRight,
  Code,
  Users,
  Sparkles,
  Target,
  Clock,
  Shield,
  LineChart,
  MessageSquare,
  Database,
  AlertTriangle,
  Smartphone,
  TrendingUp,
  BarChart3,
  Award,
  Star,
  ChevronRight,
  Play
} from "lucide-react"

export default function LandingPage() {
  const [showDemoWidget, setShowDemoWidget] = React.useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section - Full Width Modern */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse opacity-30" />
          <div className="absolute top-60 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse opacity-20" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-20 right-1/3 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-pulse opacity-25" style={{ animationDelay: '4s' }} />
        </div>

        <div className="relative w-full px-4 sm:px-6 lg:px-12 xl:px-20 py-16 sm:py-20 lg:py-28 xl:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 xl:gap-20 items-center max-w-[1800px] mx-auto">
            {/* Left Column - Content */}
            <div className="space-y-6 sm:space-y-8 lg:space-y-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-primary/10 border border-primary/20 rounded-full">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary animate-pulse" />
                <span className="text-xs sm:text-sm font-semibold text-primary">Il Primo Chatbot AI Conversazionale per Agenti Immobiliari</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[1.1] tracking-tight">
                Il chatbot AI che valuta<br className="hidden sm:block" /> immobili in{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-hover inline-block">
                  tempo<br className="sm:hidden" /> reale
                </span>
              </h1>

              <p className="text-lg sm:text-xl lg:text-2xl text-foreground-muted leading-relaxed">
                <strong className="text-foreground">Conversazione AI + Valutazione istantanea.</strong>{" "}
                Il tuo chatbot qualifica lead con stime OMI precise mentre parla con i clienti. Zero form, solo dialogo naturale.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-full">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">AI Conversazionale Avanzata</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-full">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Valutazione Real-Time</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-full">
                  <Database className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Dati OMI Ufficiali</span>
                </div>
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
                  onClick={() => {
                    setShowDemoWidget(true)
                    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Vedi chatbot in azione
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-foreground-muted">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Nessuna carta richiesta</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Setup immediato</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Cancella quando vuoi</span>
                </div>
              </div>
            </div>

            {/* Right Column - Interactive Preview */}
            <div className="relative lg:h-[700px] flex items-center justify-center">
              {/* Floating Cards */}
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
                          <p className="text-sm opacity-90">Intelligenza Artificiale • Valutazione Real-Time</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-card space-y-4">
                      <div className="bg-surface/80 backdrop-blur-sm rounded-2xl rounded-tl-none p-4 border border-border">
                        <p className="text-sm font-medium">Ciao! 👋 Dove si trova il tuo immobile?</p>
                      </div>

                      <div className="flex justify-end">
                        <div className="bg-gradient-to-br from-primary to-primary-hover text-primary-foreground rounded-2xl rounded-tr-none p-4 max-w-[80%] shadow-lg">
                          <p className="text-sm font-medium">Via Roma 15, Milano</p>
                        </div>
                      </div>

                      <div className="bg-surface/80 backdrop-blur-sm rounded-2xl rounded-tl-none p-4 border border-border">
                        <p className="text-sm font-medium mb-3">Perfetto! Che tipo di immobile è?</p>
                        <div className="grid grid-cols-2 gap-2">
                          {['Appartamento', 'Villa', 'Ufficio', 'Locale'].map((type) => (
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

                {/* Floating Stats Cards */}
                <div className="absolute -left-8 top-20 animate-float" style={{ animationDelay: '0.5s' }}>
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

                <div className="absolute -right-8 bottom-32 animate-float" style={{ animationDelay: '1s' }}>
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

                <div className="absolute -left-12 bottom-16 animate-float" style={{ animationDelay: '1.5s' }}>
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

      {/* Social Proof Strip - Full Width */}
      <section className="w-full bg-surface border-y border-border py-8 sm:py-10 lg:py-12">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 max-w-[1800px] mx-auto">
            <div className="text-center space-y-1 sm:space-y-2">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-primary">1.200+</div>
              <div className="text-xs sm:text-sm font-medium text-foreground-muted">Lead generati</div>
            </div>
            <div className="text-center space-y-1 sm:space-y-2">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-primary">98%</div>
              <div className="text-xs sm:text-sm font-medium text-foreground-muted">Precisione valutazioni</div>
            </div>
            <div className="text-center space-y-1 sm:space-y-2">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-primary">24/7</div>
              <div className="text-xs sm:text-sm font-medium text-foreground-muted">Disponibilità</div>
            </div>
            <div className="text-center space-y-1 sm:space-y-2">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-primary">2 min</div>
              <div className="text-xs sm:text-sm font-medium text-foreground-muted">Setup completo</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section - Full Width Dark */}
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-foreground to-foreground/95 text-background py-16 sm:py-20 lg:py-24 xl:py-32">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />

        <div className="relative w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-[1800px] mx-auto">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <Badge className="mb-6 bg-background/10 text-background border-background/20 backdrop-blur-sm">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Il vero problema
            </Badge>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 leading-tight">
              I form non qualificano.<br className="hidden sm:block" /> L'AI sì.
            </h2>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-3 sm:mb-4">
              La conversazione fa la differenza
            </p>
            <p className="text-base sm:text-lg md:text-xl text-background/70 max-w-3xl mx-auto px-4">
              I form statici raccolgono dati vaghi. Il chatbot AI conversa, qualifica in tempo reale e genera valutazioni precise mentre parla.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: MessageSquare,
                title: "Form statici inutili",
                description: "\"Nome, email, indirizzo\" - Dati superficiali senza contesto. L'AI invece dialoga e scopre l'intenzione reale.",
                stat: "67%"
              },
              {
                icon: Target,
                title: "Zero qualificazione",
                description: "I form non filtrano curiosi da venditori seri. L'AI fa domande intelligenti e qualifica automaticamente.",
                stat: "52%"
              },
              {
                icon: Clock,
                title: "Valutazioni manuali",
                description: "Ore perse a calcolare stime per ogni richiesta. L'AI valuta in 3 secondi con dati OMI mentre conversa.",
                stat: "78%"
              }
            ].map((problem, idx) => (
              <Card key={idx} className="bg-background/5 backdrop-blur-sm border-background/20 hover:bg-background/10 transition-all duration-300">
                <CardContent className="p-8 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center">
                      <problem.icon className="w-7 h-7 text-primary" />
                    </div>
                    <div className="text-3xl font-black text-primary/80">{problem.stat}</div>
                  </div>
                  <h3 className="text-2xl font-bold text-background">{problem.title}</h3>
                  <p className="text-background/70 leading-relaxed">{problem.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 bg-primary/20 backdrop-blur-sm border-2 border-primary/30 rounded-3xl p-8 text-center">
            <p className="text-2xl font-bold text-background mb-2">
              Risultato: dati inutili, stime manuali, zero qualificazione
            </p>
            <p className="text-lg text-background/80">
              <strong className="text-primary">Il chatbot AI conversa, qualifica e valuta in automatico.</strong> Ogni lead arriva con valutazione OMI real-time e storico completo.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works - Full Width */}
      <section className="w-full py-16 sm:py-20 lg:py-24 xl:py-32 bg-background">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-[1800px] mx-auto">
          <div className="text-center max-w-4xl mx-auto mb-20">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              <Zap className="w-4 h-4 mr-2" />
              Come funziona
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6">
              Conversazione AI.<br className="hidden sm:block" /> Valutazione istantanea.{" "}
              <span className="text-primary">Lead qualificato.</span>
            </h2>
            <p className="text-lg sm:text-xl text-foreground-muted px-4">
              Il chatbot dialoga, raccoglie dati, calcola la stima OMI e qualifica - tutto in una conversazione
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

            {[
              {
                step: "01",
                icon: Sparkles,
                title: "Chatbot si attiva",
                description: "Il cliente clicca e inizia una conversazione naturale con l'AI. Nessun form, solo dialogo."
              },
              {
                step: "02",
                icon: MessageSquare,
                title: "AI qualifica conversando",
                description: "L'AI fa domande intelligenti, estrae indirizzo, tipologia, mq, piano, stato - tutto dialogando."
              },
              {
                step: "03",
                icon: Zap,
                title: "Valutazione real-time",
                description: "In 3 secondi l'AI calcola la stima OMI ufficiale e la mostra al cliente durante la chat."
              },
              {
                step: "04",
                icon: Target,
                title: "Lead + Valutazione",
                description: "Ricevi contatto qualificato con stima già calcolata, storico conversazione completo e intenzione chiara."
              }
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <Card className="border-2 border-border hover:border-primary hover:shadow-2xl transition-all duration-300 h-full group">
                  <CardContent className="p-8 space-y-6">
                    <div className="relative">
                      <div className="text-6xl font-black text-primary/10 absolute -top-4 -left-2">
                        {step.step}
                      </div>
                      <div className="relative w-16 h-16 bg-gradient-to-br from-primary to-primary-hover rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                        <step.icon className="w-8 h-8 text-primary-foreground" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                    <p className="text-foreground-muted leading-relaxed">{step.description}</p>
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

          <div className="mt-16 text-center">
            <p className="text-2xl font-bold text-foreground mb-4">
              L'AI fa il lavoro pesante. Tu chiudi gli incarichi.
            </p>
            <p className="text-lg text-foreground-muted">
              Conversazione + Qualificazione + Valutazione = Lead pronto in 60 secondi
            </p>
          </div>
        </div>
      </section>

      {/* Demo Section - Full Width */}
      <section id="demo" className="w-full py-16 sm:py-20 lg:py-24 xl:py-32 bg-surface-2">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              <Smartphone className="w-4 h-4 mr-2" />
              Demo Live
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6">
              Chatta con l'AI.<br className="hidden sm:block" /> Guarda la{" "}
              <span className="text-primary">valutazione real-time</span>
            </h2>
            <p className="text-lg sm:text-xl text-foreground-muted max-w-3xl mx-auto px-4">
              Questo chatbot conversazionale è identico a quello che installerai. Prova la conversazione AI e vedi la stima OMI generarsi in tempo reale.
            </p>
          </div>

          <div className="relative">
            {!showDemoWidget ? (
              <div className="bg-card rounded-3xl border-2 border-dashed border-border hover:border-primary transition-all p-20 text-center group cursor-pointer" onClick={() => setShowDemoWidget(true)}>
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
              { icon: Zap, text: "100% personalizzabile" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="font-semibold text-foreground">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid - Full Width */}
      <section id="features" className="w-full py-16 sm:py-20 lg:py-24 xl:py-32 bg-background">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-[1800px] mx-auto">
          <div className="text-center max-w-4xl mx-auto mb-20">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              <Target className="w-4 h-4 mr-2" />
              Tutto incluso
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6">
              Chatbot AI.<br className="hidden sm:block" /> Valutazioni real-time.{" "}
              <span className="text-primary">Incarichi automatici.</span>
            </h2>
            <p className="text-lg sm:text-xl text-foreground-muted px-4">
              L'intelligenza artificiale che converte visitatori in lead qualificati con valutazione OMI inclusa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: Sparkles,
                title: "AI Conversazionale Avanzata",
                description: "Chatbot che dialoga naturalmente, fa domande intelligenti ed estrae tutti i dati necessari senza form.",
                color: "from-purple-500 to-purple-600"
              },
              {
                icon: Zap,
                title: "Valutazione Real-Time",
                description: "Stima OMI calcolata in 3 secondi durante la conversazione. Il cliente vede il prezzo mentre chatta con l'AI.",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: Database,
                title: "133.000+ Dati OMI",
                description: "Database ufficiale completo per zona e CAP. Stime precise basate su valori di mercato verificati.",
                color: "from-cyan-500 to-cyan-600"
              },
              {
                icon: Target,
                title: "Qualificazione Automatica",
                description: "L'AI filtra curiosi da venditori seri. Ricevi solo contatti con intenzione reale e dati completi.",
                color: "from-green-500 to-green-600"
              },
              {
                icon: MessageSquare,
                title: "Storico Conversazione",
                description: "Vedi esattamente cosa ha detto il cliente all'AI. Ogni parola della chat salvata e consultabile.",
                color: "from-orange-500 to-orange-600"
              },
              {
                icon: LineChart,
                title: "Analytics AI-Powered",
                description: "Traccia performance chatbot: tasso risposta, tempo conversazione, valutazioni generate, conversioni.",
                color: "from-pink-500 to-pink-600"
              },
              {
                icon: Users,
                title: "CRM con AI Context",
                description: "Workflow lead completo con storico AI. Vedi conversazione, valutazione e prossima azione suggerita.",
                color: "from-indigo-500 to-indigo-600"
              },
              {
                icon: BarChart3,
                title: "Report Auto-Generati",
                description: "L'AI crea report PDF professionali con valutazione, dati immobile e confronto mercato. Un click.",
                color: "from-red-500 to-red-600"
              },
              {
                icon: Code,
                title: "Setup 1-Click",
                description: "Copia-incolla una riga di codice. Il chatbot AI è live in 60 secondi su qualsiasi sito.",
                color: "from-teal-500 to-teal-600"
              }
            ].map((feature, idx) => (
              <Card key={idx} className="border-2 border-border hover:border-primary hover:shadow-2xl transition-all duration-300 group overflow-hidden">
                <CardContent className="p-6 sm:p-8 space-y-4 sm:space-y-5">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">{feature.title}</h3>
                  <p className="text-foreground-muted leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - Full Width */}
      <section id="pricing" className="w-full py-16 sm:py-20 lg:py-24 xl:py-32 bg-surface">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-[1600px] mx-auto">
          <div className="text-center max-w-4xl mx-auto mb-20">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              <Sparkles className="w-4 h-4 mr-2" />
              Prezzi trasparenti
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6">
              Piani senza vincoli,<br className="hidden sm:block" />{" "}
              <span className="text-primary">risultati concreti</span>
            </h2>
            <p className="text-lg sm:text-xl text-foreground-muted px-4">
              Tutti i piani includono 7 giorni di prova gratuita. Nessuna carta richiesta.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Free Plan */}
            <Card className="border-2 border-border hover:border-primary/50 transition-all">
              <CardContent className="p-6 sm:p-8 lg:p-10 space-y-6 sm:space-y-8">
                <div>
                  <h3 className="text-3xl font-black text-foreground mb-2">Free</h3>
                  <p className="text-foreground-muted">Perfetto per testare</p>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black text-foreground">€0</span>
                  <span className="text-xl text-foreground-muted">/mese</span>
                </div>

                <ul className="space-y-4">
                  {[
                    "5 valutazioni/mese",
                    "1 widget",
                    "CRM base",
                    "Analytics base",
                    "7 giorni prova"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/register" className="block">
                  <Button size="lg" variant="outline" className="w-full text-lg py-6">
                    Inizia gratis
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Basic Plan - Highlighted */}
            <Card className="border-2 border-primary shadow-2xl relative lg:scale-105">
              <div className="absolute -top-4 sm:-top-5 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-primary to-primary-hover text-primary-foreground px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-bold shadow-xl">
                  PIÙ POPOLARE
                </Badge>
              </div>

              <CardContent className="p-6 sm:p-8 lg:p-10 space-y-6 sm:space-y-8 bg-gradient-to-b from-primary/5 to-transparent pt-8 sm:pt-10">
                <div>
                  <h3 className="text-3xl font-black text-primary mb-2">Basic</h3>
                  <p className="text-foreground-muted">Per agenzie operative</p>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black text-primary">€50</span>
                  <span className="text-xl text-foreground-muted">/mese</span>
                </div>

                <ul className="space-y-4">
                  {[
                    "50 valutazioni/mese",
                    "3 widget",
                    "CRM completo",
                    "Analytics avanzate",
                    "Personalizzazione totale",
                    "Export CSV/Excel",
                    "7 giorni prova"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground font-medium">{item}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/register" className="block">
                  <Button size="lg" className="w-full text-lg py-6 shadow-xl">
                    Inizia ora
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="border-2 border-border hover:border-primary/50 transition-all">
              <CardContent className="p-6 sm:p-8 lg:p-10 space-y-6 sm:space-y-8">
                <div>
                  <h3 className="text-3xl font-black text-foreground mb-2">Premium</h3>
                  <p className="text-foreground-muted">Massimo controllo</p>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black text-foreground">€100</span>
                  <span className="text-xl text-foreground-muted">/mese</span>
                </div>

                <ul className="space-y-4">
                  {[
                    "150 valutazioni/mese",
                    "10 widget",
                    "CRM avanzato",
                    "Analytics real-time",
                    "White-label",
                    "Supporto prioritario",
                    "Report PDF illimitati",
                    "7 giorni prova"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/register" className="block">
                  <Button size="lg" variant="outline" className="w-full text-lg py-6">
                    Inizia ora
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-foreground-muted mt-12 text-lg">
            Tutti i piani • 7 giorni gratis • Nessuna carta richiesta • Cancella quando vuoi
          </p>
        </div>
      </section>

      {/* Testimonials - Full Width */}
      <section className="w-full py-16 sm:py-20 lg:py-24 xl:py-32 bg-background">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-[1800px] mx-auto">
          <div className="text-center max-w-4xl mx-auto mb-20">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              <Users className="w-4 h-4 mr-2" />
              Risultati reali
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6">
              Agenzie che hanno smesso<br className="hidden sm:block" /> di{" "}
              <span className="text-primary">rincorrere clienti</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                quote: "In un mese abbiamo ricevuto 47 richieste concrete. Il sistema lavora anche di notte e nei weekend. Finalmente lead che rispondono al telefono.",
                author: "Marco Colombo",
                role: "Titolare",
                company: "Immobiliare Milano Centro",
                rating: 5,
                stat: "+234% lead"
              },
              {
                quote: "Valutazioni precise basate su dati veri e contatti già filtrati. Prima sprecavamo giorni dietro curiosi, ora contattiamo solo chi è davvero pronto.",
                author: "Laura Rossi",
                role: "Agente Senior",
                company: "Agenzia Casa Tua",
                rating: 5,
                stat: "-67% tempo perso"
              },
              {
                quote: "Il CRM integrato e le analytics ci permettono di tracciare ogni singolo lead. Sappiamo esattamente cosa funziona e dove investire. ROI misurabile.",
                author: "Giuseppe Bianchi",
                role: "Founder",
                company: "Exclusive Properties",
                rating: 5,
                stat: "+156% conversioni"
              }
            ].map((testimonial, idx) => (
              <Card key={idx} className="border-2 border-border hover:border-primary/50 hover:shadow-2xl transition-all">
                <CardContent className="p-6 sm:p-8 space-y-5 sm:space-y-6">
                  <div className="flex items-center gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                    ))}
                  </div>

                  <p className="text-foreground-muted italic leading-relaxed text-lg">
                    "{testimonial.quote}"
                  </p>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-hover rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">
                        {testimonial.author.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-foreground">{testimonial.author}</div>
                        <div className="text-sm text-foreground-muted">{testimonial.role}</div>
                        <div className="text-sm font-semibold text-primary">{testimonial.company}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary/10 rounded-xl p-4 text-center">
                    <div className="text-2xl font-black text-primary">{testimonial.stat}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Full Width Gradient */}
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-primary via-primary-hover to-primary text-primary-foreground py-16 sm:py-20 lg:py-24 xl:py-32">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        <div className="relative w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-[1400px] mx-auto text-center space-y-8 sm:space-y-10 lg:space-y-12">
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight">
              Il chatbot AI che lavora<br className="hidden sm:block" /> per te 24/7
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed px-4">
              Conversazione intelligente. Valutazione real-time. Lead qualificati. Tutto automatico mentre dormi.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
            <Link href="/register">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-12 py-8 font-bold shadow-2xl hover:shadow-3xl transition-all text-primary group"
              >
                Attiva il tuo AI Agent ora
                <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 pt-8">
            {[
              { icon: Sparkles, text: "AI Avanzata inclusa" },
              { icon: Zap, text: "Valutazioni real-time" },
              { icon: CheckCircle, text: "7 giorni gratis" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <item.icon className="w-6 h-6 opacity-90" />
                <span className="font-semibold text-lg opacity-90">{item.text}</span>
              </div>
            ))}
          </div>

          <div className="pt-12 border-t border-white/20">
            <p className="text-lg opacity-75">
              Dubbi? Contattaci:{" "}
              <a href="mailto:support@domusreport.com" className="font-bold underline hover:opacity-80 transition-opacity">
                support@domusreport.com
              </a>
            </p>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
