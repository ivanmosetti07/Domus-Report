import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, DollarSign, Link2, ArrowRight, CheckCircle, Sparkles } from "lucide-react"

export const metadata = {
  title: "Programma Affiliati | DomusReport",
  description: "Guadagna il 10% ricorrente referendo agenzie immobiliari a DomusReport. Registrazione gratuita, payout automatici.",
  alternates: {
    canonical: "https://domusreport.com/affiliate",
  },
}

export default function AffiliateLandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="h-20" />

      {/* Hero */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-16 sm:py-20 lg:py-28">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-30" />
          <div className="absolute bottom-20 -left-40 w-96 h-96 bg-primary/15 rounded-full blur-3xl opacity-20" />
        </div>
        <div className="relative site-container text-center space-y-8 max-w-3xl mx-auto">
          <Badge className="bg-primary/10 text-primary border-primary/20">
            <Sparkles className="w-4 h-4 mr-2" />
            Programma Affiliati
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight">
            Guadagna il{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-hover">
              10% ricorrente
            </span>{" "}
            con DomusReport
          </h1>
          <p className="text-lg sm:text-xl text-foreground-muted">
            Referisci agenzie immobiliari e guadagna una commissione ricorrente del 10% su ogni pagamento mensile, finché l&apos;abbonamento resta attivo.
          </p>
          <Link href="/affiliate/register">
            <Button size="lg" className="text-lg px-8 py-7 font-bold shadow-2xl hover:shadow-primary/50 transition-all">
              Inizia Ora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Come funziona */}
      <section className="w-full py-16 sm:py-20 bg-surface">
        <div className="site-container">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-12">Come funziona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: Users,
                step: "1",
                title: "Registrati",
                description: "Crea il tuo account affiliato gratuito e ottieni il tuo link referral personalizzato.",
              },
              {
                icon: Link2,
                step: "2",
                title: "Condividi",
                description: "Condividi il tuo link con agenzie immobiliari. Il referral viene tracciato automaticamente.",
              },
              {
                icon: DollarSign,
                step: "3",
                title: "Guadagna",
                description: "Ricevi il 10% ricorrente su ogni pagamento mensile. Payout automatici via Stripe.",
              },
            ].map((item) => (
              <Card key={item.step} className="border-2 border-border hover:border-primary hover:shadow-2xl transition-all group">
                <CardContent className="pt-8 pb-6 px-6 text-center space-y-4">
                  <div className="relative">
                    <div className="text-5xl font-black text-primary/10 absolute -top-2 left-1/2 -translate-x-1/2">
                      {item.step}
                    </div>
                    <div className="relative w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <item.icon className="h-7 w-7 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold">{item.title}</h3>
                  <p className="text-foreground-muted text-sm leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Perché diventare affiliato */}
      <section className="w-full py-16 sm:py-20 bg-background">
        <div className="site-container max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-12">Perché diventare affiliato?</h2>
          <div className="space-y-4">
            {[
              "Commissione ricorrente del 10% su ogni pagamento mensile",
              "Cookie di tracciamento da 30 giorni",
              "Payout automatici tramite Stripe Connect",
              "Dashboard dedicata per monitorare referral e guadagni",
              "Nessun limite al numero di agenzie che puoi referire",
              "Piani da €50 a €100/mese: guadagna da €5 a €10/mese per agenzia",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-surface hover:border-primary/50 transition-colors">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-primary via-primary-hover to-primary text-primary-foreground py-16 sm:py-20">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
        <div className="relative site-container text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black">Pronto a iniziare?</h2>
          <p className="text-lg opacity-90">
            La registrazione è gratuita. Inizia a guadagnare oggi stesso.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/affiliate/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6 text-primary font-bold shadow-2xl">
                Registrati Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/affiliate/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white/30 text-white hover:bg-white/10">
                Accedi
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
