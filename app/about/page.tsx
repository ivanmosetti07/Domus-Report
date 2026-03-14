import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, Target, ArrowRight, Database, Zap, Shield } from "lucide-react"

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
          </div>
          <div className="relative site-container text-center space-y-6">
            <Badge className="bg-primary/10 text-primary border-primary/20">
              <Building2 className="w-4 h-4 mr-2" />
              La tecnologia al servizio delle agenzie immobiliari
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight">
              Chi siamo
            </h1>
            <p className="text-lg sm:text-xl text-foreground-muted max-w-2xl mx-auto">
              Cresciamo insieme alle agenzie che vogliono automatizzare la generazione di lead con l&apos;intelligenza artificiale
            </p>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="w-full bg-surface border-y border-border py-8 sm:py-10">
          <div className="site-container grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "2024", label: "Anno fondazione" },
              { value: "7.889", label: "Comuni coperti" },
              { value: "133K+", label: "Dati OMI" },
              { value: "1.200+", label: "Lead generati" },
            ].map((stat) => (
              <div key={stat.label} className="text-center space-y-1">
                <div className="text-2xl sm:text-3xl font-black text-primary">{stat.value}</div>
                <div className="text-xs sm:text-sm font-medium text-foreground-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="site-container py-16 sm:py-20 space-y-16">
          {/* Missione */}
          <section className="rounded-2xl border border-border bg-surface p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Target className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold">La nostra missione</h2>
            </div>
            <div className="space-y-4 text-lg text-foreground-muted">
              <p>
                DomusReport nasce dall&apos;esperienza di <strong className="text-foreground">Mainstream Agency</strong>, agenzia digitale specializzata nello sviluppo di soluzioni software innovative per il settore immobiliare.
              </p>
              <p>
                La nostra missione è semplice: aiutare le agenzie immobiliari a generare più lead qualificati attraverso l&apos;intelligenza artificiale e l&apos;automazione, senza richiedere competenze tecniche.
              </p>
              <p>
                Con DomusReport, ogni agenzia può offrire ai visitatori del proprio sito un servizio di valutazione immobiliare immediato e accurato, basato sui dati ufficiali dell&apos;Osservatorio del Mercato Immobiliare (OMI).
              </p>
            </div>
          </section>

          {/* Valori */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success">
                <Users className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold">I nostri valori</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
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
                <div key={value.title} className="rounded-2xl border border-border bg-surface-2 p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <value.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{value.title}</h3>
                  </div>
                  <p className="text-sm text-foreground-muted leading-relaxed">{value.copy}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Mainstream Agency */}
          <section className="rounded-2xl border border-border bg-surface p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Building2 className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold">Mainstream Agency</h2>
            </div>
            <div className="space-y-4 text-lg text-foreground-muted">
              <p>
                DomusReport è sviluppato da Mainstream Agency, agenzia digitale con sede a Roma specializzata in progetti SaaS per il real estate.
              </p>
              <p>
                Il nostro team è composto da sviluppatori, designer e professionisti del settore immobiliare che lavorano ogni giorno per migliorare la piattaforma e offrire nuove funzionalità.
              </p>
            </div>
          </section>

          {/* CTA */}
          <section className="rounded-3xl bg-gradient-to-r from-primary to-primary-hover p-10 text-center text-primary-foreground space-y-6">
            <h2 className="text-3xl font-bold">Pronto a far crescere la tua agenzia?</h2>
            <p className="text-lg text-primary-foreground/80">
              Unisciti alle agenzie che stanno già generando lead con DomusReport
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="min-w-[200px] text-primary">
                  Inizia gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </section>
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
