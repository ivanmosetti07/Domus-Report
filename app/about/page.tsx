import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, Target, ArrowRight, Database, Zap, Shield } from "lucide-react"
import { FadeIn } from "@/components/animations/fade-in"
import { SlideUp } from "@/components/animations/slide-up"
import { StaggerContainer, StaggerItem } from "@/components/animations/stagger-container"

export const metadata = {
  title: "Chi Siamo - DomusReport",
  description: "Scopri la storia e la missione di DomusReport, la piattaforma AI per agenti immobiliari.",
  alternates: {
    canonical: "https://domusreport.com/about",
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="h-20" />

      <main className="w-full">
        {/* Hero */}
        <section className="relative w-full overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-16 sm:py-20 lg:py-28">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-30" />
            <div className="absolute top-40 -left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl opacity-40" />
          </div>
          <div className="relative site-container text-center space-y-6">
            <FadeIn>
              <Badge className="bg-primary/10 text-primary border-primary/20 backdrop-blur-sm px-4 py-1.5 text-sm font-medium">
                <Building2 className="w-4 h-4 mr-2" />
                La tecnologia al servizio del real estate
              </Badge>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight text-balance">
                Chi siamo
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-lg sm:text-xl text-foreground-muted max-w-2xl mx-auto text-balance">
                Cresciamo insieme ai professionisti che vogliono automatizzare la generazione di lead con l&apos;intelligenza artificiale
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="w-full bg-surface/30 border-y border-border/50 py-8 sm:py-10">
          <StaggerContainer className="site-container grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "2024", label: "Anno fondazione" },
              { value: "7.889", label: "Comuni coperti" },
              { value: "133K+", label: "Dati OMI" },
              { value: "1.200+", label: "Lead generati" },
            ].map((stat) => (
              <StaggerItem key={stat.label} className="text-center space-y-1">
                <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-hover">{stat.value}</div>
                <div className="text-xs sm:text-sm font-medium text-foreground-muted uppercase tracking-wider">{stat.label}</div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        <div className="site-container py-16 sm:py-20 space-y-24">
          {/* Missione */}
          <SlideUp>
            <section className="rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-8 sm:p-12 space-y-6 shadow-xl shadow-primary/5 hover:border-primary/20 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Target className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-bold">La nostra missione</h2>
              </div>
              <div className="space-y-4 text-lg text-foreground-muted leading-relaxed">
                <p>
                  DomusReport nasce dall&apos;esperienza di <strong className="text-foreground">Mainstream Agency</strong>, agenzia digitale specializzata nello sviluppo di soluzioni software innovative per il settore immobiliare.
                </p>
                <p>
                  La nostra missione è semplice: aiutare i professionisti immobiliari a generare più lead qualificati attraverso l&apos;intelligenza artificiale e l&apos;automazione, senza richiedere competenze tecniche.
                </p>
                <p>
                  Con DomusReport, ogni sito web può offrire ai visitatori un servizio di valutazione immobiliare immediato e accurato, basato sui dati ufficiali dell&apos;Osservatorio del Mercato Immobiliare (OMI).
                </p>
              </div>
            </section>
          </SlideUp>

          {/* Valori */}
          <SlideUp>
            <section className="space-y-10">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success">
                  <Users className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-bold">I nostri valori</h2>
              </div>
              <StaggerContainer className="grid gap-6 md:grid-cols-2">
                {[
                  {
                    icon: Zap,
                    title: "Semplicità",
                    copy: "Crediamo che la tecnologia debba essere accessibile. Per questo DomusReport si integra in pochi minuti, senza bisogno di sviluppatori.",
                  },
                  {
                    icon: Database,
                    title: "Precisione",
                    copy: "Le nostre valutazioni sono basate su dati OMI certificati e algoritmi che tengono conto di oltre 15 variabili immobiliari.",
                  },
                  {
                    icon: Shield,
                    title: "Trasparenza",
                    copy: "Niente costi nascosti. Il piano gratuito è davvero gratuito e puoi scalare quando vuoi senza vincoli.",
                  },
                  {
                    icon: Users,
                    title: "Supporto",
                    copy: "Siamo al tuo fianco. Il nostro team risponde rapidamente e ti aiuta a ottenere il massimo dalla piattaforma.",
                  },
                ].map((value) => (
                  <StaggerItem key={value.title} className="group rounded-2xl border border-border/50 bg-surface/50 backdrop-blur-sm p-8 space-y-4 hover:border-primary/30 hover:bg-surface-hover hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <value.icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">{value.title}</h3>
                    </div>
                    <p className="text-foreground-muted leading-relaxed">{value.copy}</p>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </section>
          </SlideUp>

          {/* Mainstream Agency */}
          <SlideUp>
            <section className="rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-8 sm:p-12 space-y-6 shadow-xl shadow-primary/5 hover:border-primary/20 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Building2 className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-bold">Mainstream Agency</h2>
              </div>
              <div className="space-y-4 text-lg text-foreground-muted leading-relaxed">
                <p>
                  DomusReport è sviluppato da Mainstream Agency, agenzia digitale specializzata in progetti SaaS per il real estate.
                </p>
                <p>
                  Il nostro team è composto da sviluppatori, designer e professionisti del settore immobiliare che lavorano ogni giorno per migliorare la piattaforma e offrire nuove funzionalità.
                </p>
              </div>
            </section>
          </SlideUp>

          {/* CTA */}
          <SlideUp>
            <section className="rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary-hover p-8 sm:p-12 text-center text-primary-foreground space-y-8 relative overflow-hidden shadow-2xl shadow-primary/20">
              <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
              <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold text-balance">Pronto a fare la differenza?</h2>
                <p className="text-lg sm:text-xl text-primary-foreground/90 text-balance">
                  Unisciti ai professionisti che stanno già generando lead con DomusReport
                </p>
              </div>
              <div className="relative z-10 flex justify-center">
                <Link href="/register">
                  <Button size="lg" variant="secondary" className="text-primary font-semibold text-base h-12 px-8 hover:scale-105 transition-transform shadow-lg">
                    Inizia gratis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </section>
          </SlideUp>
        </div>

        {/* Admin access */}
        <div className="text-center py-4">
          <Link href="/admin/login" className="text-xs text-foreground-muted/40 hover:text-foreground-muted transition-colors">
            Admin
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
