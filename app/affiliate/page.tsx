"use client"

import Link from "next/link"
import { Users, DollarSign, Link2, ArrowRight, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function AffiliateLandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">DomusReport</Link>
          <div className="flex items-center gap-3">
            <Link href="/affiliate/login">
              <Button variant="ghost" size="sm">Accedi</Button>
            </Link>
            <Link href="/affiliate/register">
              <Button size="sm">Diventa Affiliato</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Guadagna il 10% ricorrente con DomusReport
          </h1>
          <p className="text-lg text-foreground-muted mb-8">
            Referisci agenzie immobiliari e guadagna una commissione ricorrente del 10%
            su ogni pagamento mensile, finche l&apos;abbonamento resta attivo.
          </p>
          <Link href="/affiliate/register">
            <Button size="lg" className="text-lg px-8">
              Inizia Ora <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Come funziona */}
      <section className="py-16 bg-surface">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Come funziona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">1. Registrati</h3>
                <p className="text-foreground-muted text-sm">
                  Crea il tuo account affiliato gratuito e ottieni il tuo link referral personalizzato.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Link2 className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">2. Condividi</h3>
                <p className="text-foreground-muted text-sm">
                  Condividi il tuo link con agenzie immobiliari. Quando si registrano, il referral viene tracciato automaticamente.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">3. Guadagna</h3>
                <p className="text-foreground-muted text-sm">
                  Ricevi il 10% ricorrente su ogni pagamento mensile delle agenzie che hai referito. Payout automatici via Stripe.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Dettagli */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-3xl font-bold text-center mb-8">Perche diventare affiliato?</h2>
          <div className="space-y-4">
            {[
              "Commissione ricorrente del 10% su ogni pagamento mensile",
              "Cookie di tracciamento da 30 giorni",
              "Payout automatici tramite Stripe Connect",
              "Dashboard dedicata per monitorare referral e guadagni",
              "Nessun limite al numero di agenzie che puoi referire",
              "Piani da 50 a 100 euro/mese: guadagna da 5 a 10 euro/mese per agenzia",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-success mt-0.5 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto a iniziare?</h2>
          <p className="text-lg opacity-90 mb-8">
            La registrazione e gratuita. Inizia a guadagnare oggi stesso.
          </p>
          <Link href="/affiliate/register">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Registrati Gratis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border text-center text-sm text-foreground-muted">
        <p>&copy; {new Date().getFullYear()} DomusReport. Tutti i diritti riservati.</p>
      </footer>
    </div>
  )
}
