import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, DollarSign, Link2, ArrowRight, CheckCircle, Sparkles } from "lucide-react"
import { FadeIn } from "@/components/animations/fade-in"
import { SlideUp } from "@/components/animations/slide-up"
import { StaggerContainer, StaggerItem } from "@/components/animations/stagger-container"

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
          <FadeIn>
            <Badge className="bg-primary/10 text-primary border-primary/20 backdrop-blur-sm px-4 py-1.5 text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              Programma Affiliati
            </Badge>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight text-balance">
              Guadagna il{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-hover">
                10% ricorrente
              </span>{" "}
              con DomusReport
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg sm:text-xl text-foreground-muted text-balance mx-auto">
              Segnala colleghi e professionisti e guadagna una commissione ricorrente del 10% su ogni pagamento mensile, finché l&apos;abbonamento resta attivo.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="pt-4">
              <Link href="/affiliate/register">
                <Button size="lg" className="text-base px-8 h-14 font-bold shadow-2xl hover:shadow-primary/50 hover:scale-105 transition-all">
                  Inizia Ora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Come funziona */}
      <section className="w-full py-16 sm:py-24 bg-surface/30 border-y border-border/50">
        <div className="site-container">
          <SlideUp>
            <h2 className="text-3xl sm:text-4xl font-black text-center mb-12 text-balance">Come funziona</h2>
          </SlideUp>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
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
                description: "Condividi il tuo link con altri professionisti. Il referral viene tracciato automaticamente.",
              },
              {
                icon: DollarSign,
                step: "3",
                title: "Guadagna",
                description: "Ricevi il 10% ricorrente su ogni pagamento mensile. Payout automatici via Stripe.",
              },
            ].map((item) => (
              <StaggerItem key={item.step}>
                <Card className="h-full border border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 group">
                  <CardContent className="pt-8 pb-6 px-6 text-center space-y-4">
                    <div className="relative mb-6">
                      <div className="text-6xl font-black text-primary/5 absolute -top-4 left-1/2 -translate-x-1/2 select-none group-hover:text-primary/10 transition-colors">
                        {item.step}
                      </div>
                      <div className="relative w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto group-hover:bg-primary group-hover:text-primary-foreground text-primary transition-all duration-300">
                        <item.icon className="h-8 w-8" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold">{item.title}</h3>
                    <p className="text-foreground-muted text-sm leading-relaxed text-balance">{item.description}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Perché diventare affiliato */}
      <section className="w-full py-16 sm:py-24 bg-background">
        <div className="site-container max-w-3xl">
          <SlideUp>
            <h2 className="text-3xl sm:text-4xl font-black text-center mb-12 text-balance">Perché diventare affiliato?</h2>
          </SlideUp>
          <StaggerContainer className="grid gap-4 sm:grid-cols-2">
            {[
              "Commissione ricorrente del 10% su ogni pagamento",
              "Cookie di tracciamento da 30 giorni",
              "Payout automatici tramite Stripe Connect",
              "Dashboard dedicata per monitorare i referral",
              "Nessun limite alle segnalazioni che puoi referire",
              "Piani da €50 a €100/mese: guadagna da €5 a €10/mese per iscritto",
            ].map((item) => (
              <StaggerItem key={item}>
                <div className="flex items-start gap-4 p-5 rounded-2xl border border-border/50 bg-surface/50 backdrop-blur-sm hover:border-primary/50 hover:bg-surface-hover hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all">
                  <CheckCircle className="h-6 w-6 text-primary mt-0.5 shrink-0" />
                  <span className="text-foreground font-medium">{item}</span>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA */}
      <section className="site-container pb-16 sm:pb-24">
        <SlideUp>
          <div className="rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary-hover p-8 sm:p-12 text-center text-primary-foreground space-y-8 relative overflow-hidden shadow-2xl shadow-primary/20">
            <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
            <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-balance">Pronto a iniziare?</h2>
              <p className="text-lg sm:text-xl text-primary-foreground/90 text-balance">
                La registrazione è gratuita. Inizia a guadagnare oggi stesso.
              </p>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/affiliate/register">
                <Button size="lg" variant="secondary" className="text-primary font-semibold text-base h-12 px-8 hover:scale-105 transition-transform shadow-lg w-full sm:w-auto">
                  Registrati Gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/affiliate/login">
                <Button size="lg" variant="outline" className="text-base h-12 px-8 border-white/30 text-white hover:bg-white/10 w-full sm:w-auto transition-colors">
                  Accedi
                </Button>
              </Link>
            </div>
          </div>
        </SlideUp>
      </section>

      <Footer />
    </div>
  )
}
