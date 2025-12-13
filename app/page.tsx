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
  Smartphone
} from "lucide-react"

export default function LandingPage() {
  const [showDemoWidget, setShowDemoWidget] = React.useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="landing-section relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-background">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="landing-container relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column */}
            <div className="text-foreground space-y-6 md:space-y-8">
              <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-primary/30 backdrop-blur-sm inline-flex">
                <Sparkles className="w-3 h-3 mr-1" />
                Piattaforma AI per Agenzie Immobiliari
              </Badge>
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
                  Ottieni più{" "}
                  <span className="text-primary">incarichi immobiliari</span> dal tuo sito
                </h1>
                <div className="text-xl md:text-2xl text-foreground leading-relaxed space-y-3">
                  <p>Senza inseguire clienti e senza perdere tempo in valutazioni inutili.</p>
                  <p>
                    DomusReport trasforma ogni richiesta di valutazione in un contatto qualificato, pronto a parlare
                    con la tua agenzia. Lavora 24/7 sul tuo sito e raccoglie solo richieste reali.
                  </p>
                </div>
              </div>

              {/* Bullet Points */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-surface/80 backdrop-blur-sm rounded-lg p-4 border border-border">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Database className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="text-lg font-medium text-foreground">Valutazioni basate su dati ufficiali</span>
                </div>
                <div className="flex items-center gap-4 bg-surface/80 backdrop-blur-sm rounded-lg p-4 border border-border">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="text-lg font-medium text-foreground">Lead già qualificati, non semplici curiosi</span>
                </div>
                <div className="flex items-center gap-4 bg-surface/80 backdrop-blur-sm rounded-lg p-4 border border-border">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="text-lg font-medium text-foreground">Dashboard con contatti e storico conversazioni</span>
                </div>
                <div className="flex items-center gap-4 bg-surface/80 backdrop-blur-sm rounded-lg p-4 border border-border">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="text-lg font-medium text-foreground">14 giorni sono sufficienti per capire se funziona davvero</span>
                </div>
              </div>

              {/* CTA */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                  <Link href="/register">
                    <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 font-bold shadow-xl hover:shadow-2xl transition-all">
                      Attiva la prova gratuita di 14 giorni
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto text-lg px-8 py-6"
                    onClick={() => {
                      setShowDemoWidget(true)
                      document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                  >
                    Apri la demo live
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>14 giorni di prova gratuita</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Nessuna carta richiesta</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Installazione immediata</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Mockup */}
            <div className="relative">
              <div className="relative z-10">
                <Card className="shadow-2xl overflow-hidden">
                  <CardContent className="p-0">
                    <div className="bg-card p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center shadow-lg">
                          <MessageSquare className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground">Valuta la tua casa</h3>
                          <p className="text-xs text-foreground">Risposta istantanea con AI</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-surface-2 rounded-2xl p-4 border border-border">
                          <p className="text-sm text-foreground font-medium">Ciao! 👋 Dove si trova il tuo immobile?</p>
                        </div>
                        <div className="flex justify-end">
                          <div className="bg-gradient-to-br from-primary to-primary-hover text-primary-foreground rounded-2xl p-4 max-w-[85%] shadow-md">
                            <p className="text-sm font-medium">Via Roma 15, Milano</p>
                          </div>
                        </div>
                        <div className="bg-surface-2 rounded-2xl p-4 border border-border">
                          <p className="text-sm text-foreground font-medium mb-3">Perfetto! Che tipo di immobile è?</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-surface border border-border hover:border-primary rounded-xl px-3 py-2 text-xs text-center font-medium text-foreground cursor-pointer transition-all">
                              Appartamento
                            </div>
                            <div className="bg-surface border border-border hover:border-primary rounded-xl px-3 py-2 text-xs text-center font-medium text-foreground cursor-pointer transition-all">
                              Villa
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-foreground mt-4">
                          <div className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            <span>Sicuro</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Database className="w-3 h-3" />
                            <span>Dati OMI</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            <span>Istantaneo</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-surface border-t border-border">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-11 bg-input border border-input-border rounded-xl"></div>
                        <div className="w-11 h-11 bg-gradient-to-br from-primary to-primary-hover rounded-xl shadow-md"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-80 h-80 bg-primary/20 rounded-full blur-3xl opacity-20 -z-10 animate-pulse"></div>
              <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-primary/30 rounded-full blur-3xl opacity-20 -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="landing-section bg-surface border-y border-border">
        <div className="landing-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-6 items-start">
            <div className="flex items-start gap-3 p-4 md:p-6 bg-background border border-border rounded-xl">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-foreground">Valutazioni basate su dati ufficiali</div>
                <div className="text-sm text-foreground-muted">Stime fondate su parametri reali per dare credibilità fin dal primo contatto.</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 md:p-6 bg-background border border-border rounded-xl">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-foreground">Lead già qualificati, non semplici curiosi</div>
                <div className="text-sm text-foreground-muted">Filtra subito chi non vuole vendere e concentra il tempo su chi è davvero interessato.</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 md:p-6 bg-background border border-border rounded-xl">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <LineChart className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-foreground">Dashboard con contatti e storico conversazioni</div>
                <div className="text-sm text-foreground-muted">Tutto tracciato in un unico posto: richieste, note, avanzamento.</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 md:p-6 bg-background border border-border rounded-xl">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-foreground">14 giorni sono sufficienti per capire se funziona</div>
                <div className="text-sm text-foreground-muted">Installi, raccolgi richieste reali e valuti subito i risultati.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="landing-section bg-background">
        <div className="landing-container max-w-6xl">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 inline-flex">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Il problema
          </Badge>
          <div className="space-y-4 md:space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              Il problema non sono le richieste
            </h2>
            <p className="text-2xl md:text-3xl text-primary font-semibold">
              Sono le richieste sbagliate
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-6">
            <Card className="h-full border-2 border-border bg-surface">
              <CardContent className="p-4 md:p-6 space-y-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Contatti vaghi</h3>
                <p className="text-foreground-muted text-sm leading-relaxed">
                  Richieste generiche senza dati utili, difficili da richiamare e impossibili da qualificare.
                </p>
              </CardContent>
            </Card>

            <Card className="h-full border-2 border-border bg-surface">
              <CardContent className="p-4 md:p-6 space-y-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Richieste di prezzo senza intenzione</h3>
                <p className="text-foreground-muted text-sm leading-relaxed">
                  Persone che vogliono solo un numero, senza reale volontà di vendere o affidare l'incarico.
                </p>
              </CardContent>
            </Card>

            <Card className="h-full border-2 border-border bg-surface">
              <CardContent className="p-4 md:p-6 space-y-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Persone che spariscono</h3>
                <p className="text-foreground-muted text-sm leading-relaxed">
                  Dopo la valutazione non rispondono più, lasciandoti senza incarichi e senza controllo.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 md:p-6 space-y-2">
            <p className="text-lg md:text-xl text-foreground">
              Risultato: tempo perso, zero incarichi, nessun controllo.
            </p>
            <p className="text-foreground-muted">
              DomusReport filtra a monte e trasforma la valutazione in un primo passo concreto verso l'incarico.
            </p>
          </div>
        </div>
      </section>

      {/* Demo Widget Section */}
      <section id="demo" className="landing-section bg-surface-2">
        <div className="landing-container max-w-5xl text-center space-y-4">
          <Badge className="mx-auto bg-primary/10 text-primary border-primary/20">
            <Smartphone className="w-3 h-3 mr-1" />
            Demo Interattiva
          </Badge>
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Prova ora l'esperienza che vivranno i tuoi clienti
            </h2>
            <p className="text-xl text-foreground max-w-2xl mx-auto">
              Questo è esattamente il widget che installerai sul tuo sito.
              Stessa conversazione, stesso flusso, stesso risultato.
            </p>
          </div>

          <div className="relative">
            {!showDemoWidget ? (
              <div className="bg-card rounded-2xl border-2 border-dashed border-border p-12 md:p-16 hover:border-primary transition-all space-y-6">
                <div>
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-hover rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <MessageSquare className="w-10 h-10 text-primary-foreground" />
                  </div>
                </div>
                <Button
                  size="lg"
                  onClick={() => setShowDemoWidget(true)}
                  className="text-lg px-8 py-6 shadow-lg hover:shadow-xl"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Apri la demo live
                </Button>
                <p className="text-sm text-foreground mt-4">Nessuna registrazione richiesta</p>
              </div>
            ) : (
              <div className="bg-card rounded-2xl shadow-2xl p-4 md:p-6 border border-border">
                <ChatWidget widgetId="demo" mode="inline" isDemo={true} />
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-foreground">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-primary" />
              </div>
              <span>Installazione 1-click</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Code className="w-4 h-4 text-primary" />
              </div>
              <span>Compatibile con qualsiasi sito</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <span>Personalizzabile al 100%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="features" className="landing-section bg-background">
        <div className="landing-container">
          <div className="text-center space-y-4 md:space-y-5 mb-8 md:mb-12">
            <Badge className="mx-auto bg-primary/10 text-primary border-primary/20">
              <Target className="w-3 h-3 mr-1" />
              Funzionalità
            </Badge>
            <div className="space-y-3">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                Tutto ciò che serve per generare incarichi, non solo contatti
              </h2>
              <p className="text-xl text-foreground max-w-3xl mx-auto">
                Ogni funzione è pensata per trasformare la valutazione in un incarico reale,
                eliminando richieste vaghe e perdite di tempo.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-6">
            {/* Feature 1 */}
            <Card className="border-2 hover:border-primary hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-4 md:p-6 space-y-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-hover rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Database className="w-7 h-7 text-primary-foreground" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-foreground">
                    Valutazioni basate su dati ufficiali
                  </h3>
                  <p className="text-foreground-muted leading-relaxed">
                    Ogni stima è costruita su parametri reali e aggiornati, per aumentare credibilità
                    e fiducia fin dal primo contatto.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-2 hover:border-primary hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-4 md:p-6 space-y-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-hover rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Target className="w-7 h-7 text-primary-foreground" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-foreground">
                    Lead già qualificati
                  </h3>
                  <p className="text-foreground-muted leading-relaxed">
                    DomusReport filtra subito i curiosi e consegna solo contatti con intenzione reale
                    di vendere e parlare con l'agenzia.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-2 hover:border-primary hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-4 md:p-6 space-y-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-hover rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <MessageSquare className="w-7 h-7 text-primary-foreground" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-foreground">
                    Chat conversazionale guidata
                  </h3>
                  <p className="text-foreground-muted leading-relaxed">
                    L'utente risponde passo dopo passo, senza moduli noiosi e senza abbandoni.
                    Conversazione naturale che raccoglie tutti i dati essenziali.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="border-2 hover:border-primary hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-4 md:p-6 space-y-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-hover rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Users className="w-7 h-7 text-primary-foreground" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-foreground">
                    CRM integrato
                  </h3>
                  <p className="text-foreground-muted leading-relaxed">
                    Ogni lead ha uno stato chiaro: NEW → CONTACTED → INTERESTED → CONVERTED.
                    Nessun contatto dimenticato, storico conversazioni sempre visibile.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="border-2 hover:border-primary hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-4 md:p-6 space-y-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-hover rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <LineChart className="w-7 h-7 text-primary-foreground" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-foreground">
                    Analytics in tempo reale
                  </h3>
                  <p className="text-foreground-muted leading-relaxed">
                    Sai da dove arrivano le richieste e quali portano risultati concreti.
                    Metriche live per ottimizzare le campagne.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="border-2 hover:border-primary hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-4 md:p-6 space-y-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-hover rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Sparkles className="w-7 h-7 text-primary-foreground" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-foreground">
                    Personalizzazione Totale
                  </h3>
                  <p className="text-foreground-muted leading-relaxed">
                    Widget, colori, logo e posizione adattati al tuo brand e al tuo sito.
                    Multi-widget per domini diversi con configurazioni dedicate.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Setup Section */}
      <section className="landing-section bg-surface">
        <div className="landing-container max-w-6xl">
          <div className="text-center space-y-3 mb-8 md:mb-12">
            <Badge className="mx-auto bg-primary/10 text-primary border-primary/20">
              <Code className="w-3 h-3 mr-1" />
              Setup
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Attivo in meno di 2 minuti
            </h2>
            <p className="text-lg text-foreground-muted">
              Copi il codice, lo incolli e inizi subito a ricevere richieste.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 lg:gap-6">
            <div className="flex items-center gap-3 bg-background border border-border rounded-xl p-4 md:p-6">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span className="text-foreground font-medium">Nessun tecnico</span>
            </div>
            <div className="flex items-center gap-3 bg-background border border-border rounded-xl p-4 md:p-6">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span className="text-foreground font-medium">Nessuna configurazione complessa</span>
            </div>
            <div className="flex items-center gap-3 bg-background border border-border rounded-xl p-4 md:p-6">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span className="text-foreground font-medium">Funziona su qualsiasi sito</span>
            </div>
            <div className="flex items-center gap-3 bg-background border border-border rounded-xl p-4 md:p-6">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span className="text-foreground font-medium">Installazione immediata</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="landing-section bg-surface-2">
        <div className="landing-container">
          <div className="text-center space-y-4 md:space-y-5 mb-8 md:mb-12">
            <Badge className="mx-auto bg-primary/10 text-primary border-primary/20">
              <Zap className="w-3 h-3 mr-1" />
              Semplice e Veloce
            </Badge>
            <div className="space-y-3">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                Dal sito al lead qualificato, in automatico
              </h2>
              <p className="text-xl text-foreground max-w-2xl mx-auto">
                Dalla richiesta di valutazione alla conversazione in dashboard, senza intervento manuale.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 lg:gap-6">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-card rounded-2xl p-4 md:p-6 shadow-lg border-2 border-border hover:border-primary transition-all h-full space-y-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center text-primary-foreground font-bold text-xl">
                  1
                </div>
                <h3 className="text-lg font-bold text-foreground">L'utente chiede una valutazione</h3>
                <p className="text-foreground-muted text-sm leading-relaxed">
                  Il widget appare sul tuo sito e guida la conversazione come una chat naturale.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                <ArrowRight className="w-8 h-8 text-primary" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-card rounded-2xl p-4 md:p-6 shadow-lg border-2 border-border hover:border-primary transition-all h-full space-y-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center text-primary-foreground font-bold text-xl">
                  2
                </div>
                <h3 className="text-lg font-bold text-foreground">Il sistema raccoglie i dati essenziali</h3>
                <p className="text-foreground-muted text-sm leading-relaxed">
                  Localizzazione, tipologia, stato dell'immobile e tutte le informazioni utili per la stima.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                <ArrowRight className="w-8 h-8 text-primary" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-card rounded-2xl p-4 md:p-6 shadow-lg border-2 border-border hover:border-primary transition-all h-full space-y-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center text-primary-foreground font-bold text-xl">
                  3
                </div>
                <h3 className="text-lg font-bold text-foreground">La valutazione viene elaborata in tempo reale</h3>
                <p className="text-foreground-muted text-sm leading-relaxed">
                  La stima si basa su dati OMI ufficiali e parametri aggiornati per la tua zona.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                <ArrowRight className="w-8 h-8 text-primary" />
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-card rounded-2xl p-4 md:p-6 shadow-lg border-2 border-border hover:border-primary transition-all h-full space-y-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center text-primary-foreground font-bold text-xl">
                4
              </div>
              <h3 className="text-lg font-bold text-foreground">Il contatto entra nella dashboard</h3>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Entra come lead qualificato con storico conversazioni e stato pronto per essere contattato.
              </p>
            </div>
          </div>

          <p className="text-center text-foreground mt-8 text-lg">
            Tu trovi solo richieste complete, tracciate e utilizzabili.
          </p>
        </div>
      </section>

      {/* Free Trial Section */}
      <section className="landing-section bg-background">
        <div className="landing-container max-w-5xl text-center space-y-4">
          <Badge className="mx-auto bg-primary/10 text-primary border-primary/20">
            <Sparkles className="w-3 h-3 mr-1" />
            Prova gratuita
          </Badge>
          <div className="space-y-3">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              14 giorni per capire se fa la differenza
            </h2>
            <p className="text-xl text-foreground-muted">
              Durante la prova puoi vedere tutto in azione, con richieste reali dal tuo sito.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-6">
            <div className="flex items-center gap-3 bg-surface border border-border rounded-xl p-4 text-left">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span className="text-foreground">Installare il widget sul tuo sito</span>
            </div>
            <div className="flex items-center gap-3 bg-surface border border-border rounded-xl p-4 text-left">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span className="text-foreground">Ricevere valutazioni reali</span>
            </div>
            <div className="flex items-center gap-3 bg-surface border border-border rounded-xl p-4 text-left">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span className="text-foreground">Visualizzare lead e conversazioni</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6">
            <Link href="/register">
              <Button size="lg" className="px-8 py-6 font-bold text-lg shadow-lg hover:shadow-xl">
                Attiva la prova gratuita di 14 giorni
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
          <p className="text-sm text-foreground">Nessuna carta richiesta • Disattivi quando vuoi</p>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="landing-section bg-background">
        <div className="landing-container">
          <div className="text-center space-y-4 md:space-y-5 mb-8 md:mb-12">
            <Badge className="mx-auto bg-primary/10 text-primary border-primary/20">
              <Sparkles className="w-3 h-3 mr-1" />
              Senza vincoli
            </Badge>
            <div className="space-y-3">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                Piani semplici, senza vincoli
              </h2>
              <p className="text-xl text-foreground max-w-2xl mx-auto">
                Scegli il piano giusto per la tua agenzia e provalo 14 giorni senza carta di credito.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-6 max-w-6xl mx-auto">
            {/* Free Plan */}
            <Card className="border-2 border-border hover:border-primary transition-all h-full">
              <CardContent className="p-6 lg:p-6 flex flex-col h-full space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground mb-2">Free</h3>
                  <p className="text-foreground-muted text-sm">Perfetto per testare il sistema</p>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-bold text-foreground">€0</span>
                  <span className="text-foreground-muted mb-2">/mese</span>
                </div>

                <ul className="space-y-4 flex-1">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground"><strong>5 valutazioni</strong> al mese</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground"><strong>1 widget</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">CRM base</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">Analytics base</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">14 giorni di prova gratuita</span>
                  </li>
                </ul>

                <Link href="/register" className="block">
                  <Button size="lg" variant="outline" className="w-full mt-4">
                    Inizia Gratis
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Basic Plan */}
            <Card className="border-2 border-primary shadow-xl relative h-full">
              <CardContent className="p-6 lg:p-6 flex flex-col h-full space-y-6">
                <div className="flex justify-center">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    Più Popolare
                  </Badge>
                </div>
                <div className="space-y-2 text-center">
                  <h3 className="text-2xl font-bold text-foreground mb-2">Basic</h3>
                  <p className="text-foreground-muted text-sm">Per agenzie operative</p>
                </div>
                <div className="flex items-end gap-1 justify-center">
                  <span className="text-5xl font-bold text-primary">€50</span>
                  <span className="text-foreground-muted mb-2">/mese</span>
                </div>

                <ul className="space-y-4 flex-1">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground"><strong>50 valutazioni</strong> al mese</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground"><strong>3 widget</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">CRM completo</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">Analytics avanzate</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">Personalizzazione totale</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">14 giorni di prova gratuita</span>
                  </li>
                </ul>

                <Link href="/register" className="block">
                  <Button size="lg" className="w-full mt-4">
                    Inizia Ora
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="border-2 border-border hover:border-primary transition-all h-full">
              <CardContent className="p-6 lg:p-6 flex flex-col h-full space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground mb-2">Premium</h3>
                  <p className="text-foreground-muted text-sm">Per chi vuole il massimo controllo</p>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-bold text-foreground">€100</span>
                  <span className="text-foreground-muted mb-2">/mese</span>
                </div>

                <ul className="space-y-4 flex-1">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground"><strong>150 valutazioni</strong> al mese</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground"><strong>10 widget</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">CRM avanzato</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">Analytics in tempo reale</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">White-label</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">Supporto dedicato</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">14 giorni di prova gratuita</span>
                  </li>
                </ul>

                <Link href="/register" className="block">
                  <Button size="lg" variant="outline" className="w-full mt-4">
                    Inizia Ora
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-foreground mt-8 md:mt-10">
            Tutti i piani includono 14 giorni di prova gratuita • Nessuna carta richiesta
          </p>
        </div>
      </section>

      {/* Testimonial/Trust Section */}
      <section className="landing-section bg-surface-2">
        <div className="landing-container max-w-6xl">
          <div className="text-center space-y-4 md:space-y-5 mb-8 md:mb-12">
            <Badge className="mx-auto bg-primary/10 text-primary border-primary/20">
              <Users className="w-3 h-3 mr-1" />
              Agenzie Soddisfatte
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Agenzie che lo usano ogni giorno
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-6">
            <Card className="shadow-lg h-full">
              <CardContent className="p-6 lg:p-6 flex flex-col h-full space-y-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-primary text-lg">★</span>
                  ))}
                </div>
                <p className="text-foreground-muted mb-6 leading-relaxed italic">
                  "In un mese abbiamo ricevuto decine di richieste reali. Il sistema lavora anche quando l'agenzia è chiusa."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-hover rounded-full flex items-center justify-center text-primary-foreground font-bold">
                    MC
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Marco C.</div>
                    <div className="text-sm text-foreground-muted">Agenzia Immobiliare Milano</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg h-full">
              <CardContent className="p-6 lg:p-6 flex flex-col h-full space-y-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-primary text-lg">★</span>
                  ))}
                </div>
                <p className="text-foreground-muted mb-6 leading-relaxed italic">
                  "Valutazioni chiare e contatti già filtrati. Meno perdite di tempo, più appuntamenti concreti."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-hover rounded-full flex items-center justify-center text-primary-foreground font-bold">
                    LR
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Laura R.</div>
                    <div className="text-sm text-foreground-muted">Agenzia Immobiliare</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg h-full">
              <CardContent className="p-6 lg:p-6 flex flex-col h-full space-y-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-primary text-lg">★</span>
                  ))}
                </div>
                <p className="text-foreground-muted mb-6 leading-relaxed italic">
                  "Il CRM integrato e le analytics ci permettono di tracciare ogni lead. Finalmente dati concreti per ottimizzare la strategia."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-hover rounded-full flex items-center justify-center text-primary-foreground font-bold">
                    GB
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Giuseppe Bianchi</div>
                    <div className="text-sm text-foreground-muted">Immobiliare Exclusive</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="landing-section bg-gradient-to-br from-primary/20 via-primary/10 to-background text-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="landing-container max-w-4xl text-center relative z-10 space-y-6">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-extrabold">
              Trasforma il tuo sito in uno strumento che lavora per te
            </h2>
            <p className="text-xl md:text-2xl text-foreground leading-relaxed">
              Unisciti alle agenzie che hanno smesso di rincorrere clienti e hanno iniziato a selezionarli.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="font-bold text-lg px-12 py-6 shadow-2xl hover:shadow-3xl transition-all"
              >
                Attiva la prova gratuita di 14 giorni
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-foreground">
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
              <span>Disattivi quando vuoi</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
