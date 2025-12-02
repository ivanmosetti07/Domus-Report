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
  BarChart,
  Moon,
  CheckCircle,
  ArrowRight,
  Code,
  Users,
  TrendingUp
} from "lucide-react"

export default function LandingPage() {
  const [showDemoWidget, setShowDemoWidget] = React.useState(false)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <div>
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
                🚀 Nuovo prodotto SaaS per agenzie
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Valutazioni immobiliari intelligenti per la tua agenzia
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Genera lead qualificati con un chatbot che valuta gli immobili in tempo reale.
                Basato su dati OMI ufficiali.
              </p>

              {/* Bullet Points */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Installazione in 2 minuti</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Valutazioni accurate e automatiche</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">CRM integrato per gestire i lead</span>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto text-lg px-8">
                    Inizia Gratis
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-lg px-8"
                  onClick={() => setShowDemoWidget(true)}
                >
                  Vedi Demo
                </Button>
              </div>

              <p className="text-sm text-gray-500 mt-4">
                Nessuna carta di credito richiesta • Test gratuito 30 giorni
              </p>
            </div>

            {/* Right Column - Mockup */}
            <div className="relative">
              <div className="relative z-10">
                <Card className="shadow-2xl border-2">
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-br from-primary to-blue-600 p-8 text-white">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                          <span className="text-2xl">🤖</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">Valuta la tua casa</h3>
                          <p className="text-xs text-white/70">Ti rispondo subito</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                          <p className="text-sm">Ciao! 👋 Dove si trova il tuo immobile?</p>
                        </div>
                        <div className="flex justify-end">
                          <div className="bg-white text-gray-900 rounded-lg p-3 max-w-[80%]">
                            <p className="text-sm">Via Roma 15, Milano</p>
                          </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                          <p className="text-sm">Perfetto! Che tipo di immobile è?</p>
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            <div className="bg-white/20 rounded px-2 py-1 text-xs text-center">
                              Appartamento
                            </div>
                            <div className="bg-white/20 rounded px-2 py-1 text-xs text-center">
                              Villa
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 border-t">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
                        <div className="w-10 h-10 bg-primary rounded-lg"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-20 -z-10"></div>
              <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-indigo-200 rounded-full blur-3xl opacity-20 -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Widget Section */}
      <section id="demo" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Prova il chatbot ora
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Questo è lo stesso widget che installerai sul tuo sito
          </p>

          <div className="relative">
            {!showDemoWidget ? (
              <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12">
                <Button
                  size="lg"
                  onClick={() => setShowDemoWidget(true)}
                  className="text-lg px-8"
                >
                  Apri Widget Demo
                </Button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-xl p-4">
                <ChatWidget widgetId="demo" mode="inline" isDemo={true} />
              </div>
            )}
          </div>

          <p className="text-sm text-gray-600 mt-6 flex items-center justify-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            Integrazione con un semplice copia-incolla di codice
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            Perché DomusReport?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                  <Moon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Genera lead mentre dormi
                </h3>
                <p className="text-gray-600">
                  Il widget lavora 24/7 sul tuo sito. Ogni proprietario che cerca una valutazione
                  diventa un lead qualificato.
                </p>
              </CardContent>
            </Card>

            {/* Benefit 2 */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                  <BarChart className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Valutazioni basate su dati reali
                </h3>
                <p className="text-gray-600">
                  Utilizziamo il database OMI (Osservatorio Mercato Immobiliare) ufficiale per
                  calcoli accurati e credibili.
                </p>
              </CardContent>
            </Card>

            {/* Benefit 3 */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-6">
                  <Zap className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Integrazione immediata
                </h3>
                <p className="text-gray-600">
                  Copia un codice, incollalo nel tuo sito WordPress, Wix o qualsiasi pagina HTML.
                  Funziona subito.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <Users className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <div className="text-4xl font-bold mb-2">100+</div>
              <div className="text-blue-100">Agenzie attive</div>
            </div>
            <div>
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <div className="text-4xl font-bold mb-2">5,000+</div>
              <div className="text-blue-100">Valutazioni generate</div>
            </div>
            <div>
              <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-blue-100">Lead qualificati</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Inizia gratis
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Nessun costo iniziale, nessuna carta di credito richiesta
          </p>

          <Card className="max-w-md mx-auto border-2 border-primary">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Piano Gratuito</h3>
              <div className="flex items-end justify-center gap-1 mb-6">
                <span className="text-5xl font-bold text-primary">€0</span>
                <span className="text-gray-600 mb-2">/mese</span>
              </div>

              <ul className="space-y-4 mb-8 text-left">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">50 valutazioni al mese</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Widget personalizzabile</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">CRM integrato</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Supporto email</span>
                </li>
              </ul>

              <Link href="/register">
                <Button size="lg" className="w-full">
                  Inizia Gratis
                </Button>
              </Link>

              <p className="text-sm text-gray-500 mt-4">
                Piani a pagamento disponibili da €50/mese
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto a generare più lead?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Unisciti alle agenzie che hanno già trasformato il loro sito in una macchina di lead generation
          </p>
          <Link href="/register">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-gray-100 text-lg px-8"
            >
              Crea Account Gratis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
