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
  Smartphone
} from "lucide-react"

export default function LandingPage() {
  const [showDemoWidget, setShowDemoWidget] = React.useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-primary to-indigo-700">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column */}
            <div className="text-white">
              <Badge className="mb-6 bg-white/20 text-white hover:bg-white/30 border-white/30 backdrop-blur-sm">
                <Sparkles className="w-3 h-3 mr-1" />
                Piattaforma AI per Agenzie Immobiliari
              </Badge>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
                Trasforma visitatori in{" "}
                <span className="text-yellow-300">lead qualificati</span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
                Il primo chatbot AI che genera valutazioni immobiliari accurate con dati OMI ufficiali
                e trasforma ogni richiesta in un'opportunità di business
              </p>

              {/* Bullet Points */}
              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-blue-900" />
                  </div>
                  <span className="text-lg font-medium">Setup in 2 minuti - Zero configurazione</span>
                </div>
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="w-10 h-10 bg-green-400 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-blue-900" />
                  </div>
                  <span className="text-lg font-medium">Valutazioni OMI certificate per 50+ città</span>
                </div>
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="w-10 h-10 bg-purple-400 rounded-lg flex items-center justify-center flex-shrink-0">
                    <LineChart className="w-5 h-5 text-blue-900" />
                  </div>
                  <span className="text-lg font-medium">CRM + Analytics in tempo reale</span>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto text-lg px-10 py-6 bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold shadow-xl hover:shadow-2xl transition-all">
                    Inizia Gratis Ora
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-lg px-10 py-6 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
                  onClick={() => {
                    setShowDemoWidget(true)
                    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  Prova la Demo Live
                </Button>
              </div>

              <div className="mt-6 flex items-center gap-6 text-sm text-blue-100">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>30 giorni di prova gratuita</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Nessuna carta richiesta</span>
                </div>
              </div>
            </div>

            {/* Right Column - Mockup */}
            <div className="relative">
              <div className="relative z-10">
                <Card className="shadow-2xl border-none overflow-hidden">
                  <CardContent className="p-0">
                    <div className="bg-white p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                          <MessageSquare className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">Valuta la tua casa</h3>
                          <p className="text-xs text-gray-500">Risposta istantanea con AI</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                          <p className="text-sm text-gray-800 font-medium">Ciao! 👋 Dove si trova il tuo immobile?</p>
                        </div>
                        <div className="flex justify-end">
                          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl p-4 max-w-[85%] shadow-md">
                            <p className="text-sm font-medium">Via Roma 15, Milano</p>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                          <p className="text-sm text-gray-800 font-medium mb-3">Perfetto! Che tipo di immobile è?</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white border border-blue-200 hover:border-blue-400 rounded-xl px-3 py-2 text-xs text-center font-medium text-gray-700 cursor-pointer transition-all">
                              Appartamento
                            </div>
                            <div className="bg-white border border-blue-200 hover:border-blue-400 rounded-xl px-3 py-2 text-xs text-center font-medium text-gray-700 cursor-pointer transition-all">
                              Villa
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
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
                    <div className="p-4 bg-gray-50 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-11 bg-white border border-gray-200 rounded-xl"></div>
                        <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-md"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-80 h-80 bg-yellow-300 rounded-full blur-3xl opacity-20 -z-10 animate-pulse"></div>
              <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-purple-300 rounded-full blur-3xl opacity-20 -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center text-center">
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">100+</div>
              <div className="text-sm text-gray-600">Agenzie attive</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">5.000+</div>
              <div className="text-sm text-gray-600">Lead generati</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">50+</div>
              <div className="text-sm text-gray-600">Città coperte</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">95%</div>
              <div className="text-sm text-gray-600">Lead qualificati</div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Widget Section */}
      <section id="demo" className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Smartphone className="w-3 h-3 mr-1" />
            Demo Interattiva
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Prova il chatbot AI ora
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Questo è esattamente lo stesso widget che installerai sul tuo sito web.
            Conversazione naturale guidata da GPT-4.
          </p>

          <div className="relative">
            {!showDemoWidget ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-16 hover:border-primary transition-all">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <MessageSquare className="w-10 h-10 text-white" />
                  </div>
                </div>
                <Button
                  size="lg"
                  onClick={() => setShowDemoWidget(true)}
                  className="text-lg px-10 py-6 shadow-lg hover:shadow-xl"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Apri Widget Demo
                </Button>
                <p className="text-sm text-gray-500 mt-4">Nessuna registrazione richiesta</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
                <ChatWidget widgetId="demo" mode="inline" isDemo={true} />
              </div>
            )}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <span>Installazione 1-click</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Code className="w-4 h-4 text-blue-600" />
              </div>
              <span>Compatibile con qualsiasi sito</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4 text-purple-600" />
              </div>
              <span>Personalizzabile al 100%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Target className="w-3 h-3 mr-1" />
              Funzionalità Complete
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Tutto ciò che ti serve per<br />generare lead immobiliari
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Una piattaforma completa che combina AI conversazionale, valutazioni certificate
              e CRM professionale in un'unica soluzione
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="border-2 hover:border-primary hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg">
                  <MessageSquare className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Chatbot AI Conversazionale
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  GPT-4 raccoglie automaticamente 20+ parametri immobile tramite conversazione naturale.
                  Quick replies per velocizzare il processo.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-2 hover:border-primary hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg">
                  <Database className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Valutazioni OMI Certificate
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Algoritmo basato su dati ufficiali dell'Osservatorio Mercato Immobiliare.
                  Copertura 50+ città italiane con aggiornamenti continui.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-2 hover:border-primary hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Setup in 2 Minuti
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Copia-incolla un codice sul tuo sito. Funziona su WordPress, Webflow, Wix e qualsiasi
                  piattaforma HTML. Zero configurazione.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="border-2 hover:border-primary hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  CRM Integrato
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Gestisci lead con workflow professionale: NEW → CONTACTED → INTERESTED → CONVERTED.
                  Storico conversazioni e export Excel/PDF.
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="border-2 hover:border-primary hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg">
                  <LineChart className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Analytics Real-Time
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Dashboard con metriche live: impressions, click, lead, conversion rate.
                  Funnel analysis per ottimizzare performance.
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="border-2 hover:border-primary hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-red-500 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Personalizzazione Totale
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Colori brand, logo agenzia, tema custom, posizione widget.
                  Multi-widget per siti diversi con configurazioni dedicate.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Zap className="w-3 h-3 mr-1" />
              Semplice e Veloce
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Come funziona DomusReport
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Dal setup alla generazione del primo lead in meno di 5 minuti
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100 hover:border-primary transition-all h-full">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 text-white font-bold text-xl">
                  1
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Registrati Gratis</h3>
                <p className="text-gray-600 text-sm">
                  Crea il tuo account in 30 secondi. Nessuna carta di credito richiesta.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                <ArrowRight className="w-8 h-8 text-primary" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100 hover:border-primary transition-all h-full">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 text-white font-bold text-xl">
                  2
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Copia il Codice</h3>
                <p className="text-gray-600 text-sm">
                  Dalla dashboard, copia il codice widget personalizzato per la tua agenzia.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                <ArrowRight className="w-8 h-8 text-primary" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100 hover:border-primary transition-all h-full">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-4 text-white font-bold text-xl">
                  3
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Installa sul Sito</h3>
                <p className="text-gray-600 text-sm">
                  Incolla il codice sul tuo sito WordPress, Webflow o HTML. Funziona subito.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                <ArrowRight className="w-8 h-8 text-primary" />
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100 hover:border-primary transition-all h-full">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 text-white font-bold text-xl">
                4
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Ricevi Lead</h3>
              <p className="text-gray-600 text-sm">
                Ogni valutazione diventa automaticamente un lead qualificato nella tua dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Sparkles className="w-3 h-3 mr-1" />
              Piani Flessibili
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Prezzi trasparenti per ogni esigenza
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Inizia gratis e scala quando vuoi. Nessun costo nascosto, cancellazione in qualsiasi momento.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <Card className="border-2 border-gray-200 hover:border-primary transition-all">
              <CardContent className="p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                  <p className="text-gray-600 text-sm">Perfetto per iniziare</p>
                </div>
                <div className="flex items-end gap-1 mb-8">
                  <span className="text-5xl font-bold text-gray-900">€0</span>
                  <span className="text-gray-600 mb-2">/mese</span>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700"><strong>5 valutazioni</strong> al mese</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700"><strong>1 widget</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">CRM base</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Analytics base</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Supporto email</span>
                  </li>
                </ul>

                <Link href="/register" className="block">
                  <Button size="lg" variant="outline" className="w-full">
                    Inizia Gratis
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Basic Plan */}
            <Card className="border-2 border-primary shadow-xl relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-white px-4 py-1">
                  Più Popolare
                </Badge>
              </div>
              <CardContent className="p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic</h3>
                  <p className="text-gray-600 text-sm">Per agenzie in crescita</p>
                </div>
                <div className="flex items-end gap-1 mb-8">
                  <span className="text-5xl font-bold text-primary">€50</span>
                  <span className="text-gray-600 mb-2">/mese</span>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700"><strong>50 valutazioni</strong> al mese</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700"><strong>3 widget</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">CRM completo</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Analytics avanzate</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Personalizzazione completa</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Supporto prioritario</span>
                  </li>
                </ul>

                <Link href="/register" className="block">
                  <Button size="lg" className="w-full">
                    Inizia Ora
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="border-2 border-gray-200 hover:border-primary transition-all">
              <CardContent className="p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
                  <p className="text-gray-600 text-sm">Massima potenza</p>
                </div>
                <div className="flex items-end gap-1 mb-8">
                  <span className="text-5xl font-bold text-gray-900">€100</span>
                  <span className="text-gray-600 mb-2">/mese</span>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700"><strong>150 valutazioni</strong> al mese</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700"><strong>10 widget</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">CRM enterprise</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Analytics real-time</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">White-label</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Supporto dedicato</span>
                  </li>
                </ul>

                <Link href="/register" className="block">
                  <Button size="lg" variant="outline" className="w-full">
                    Inizia Ora
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-gray-600 mt-12">
            Tutti i piani includono 30 giorni di prova gratuita • Nessuna carta richiesta
          </p>
        </div>
      </section>

      {/* Testimonial/Trust Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Users className="w-3 h-3 mr-1" />
              Agenzie Soddisfatte
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Perché le agenzie scelgono DomusReport
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg">★</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "In un mese abbiamo generato 45 lead qualificati. Il widget lavora 24/7 anche quando l'agenzia è chiusa. ROI incredibile!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                    MC
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Marco Conti</div>
                    <div className="text-sm text-gray-600">Agenzia Immobiliare Milano</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg">★</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "Setup in 5 minuti, valutazioni precise basate su OMI. I clienti apprezzano la trasparenza e noi otteniamo contatti caldi."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                    LR
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Laura Rossi</div>
                    <div className="text-sm text-gray-600">Casa Tua Immobiliare</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg">★</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "Il CRM integrato e le analytics ci permettono di tracciare ogni lead. Finalmente dati concreti per ottimizzare la strategia."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                    GB
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Giuseppe Bianchi</div>
                    <div className="text-sm text-gray-600">Immobiliare Exclusive</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-primary to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Pronto a trasformare il tuo sito in una<br />
            <span className="text-yellow-300">macchina di lead generation?</span>
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-10 leading-relaxed">
            Unisciti a 100+ agenzie che stanno già generando lead qualificati ogni giorno con DomusReport
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold text-lg px-12 py-7 shadow-2xl hover:shadow-3xl transition-all"
              >
                Inizia Gratis - 30 Giorni di Prova
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-blue-100">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Nessuna carta richiesta</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Setup in 2 minuti</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Cancellazione in qualsiasi momento</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
