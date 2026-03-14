import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/animations/fade-in"
import { SlideUp } from "@/components/animations/slide-up"
import { StaggerContainer, StaggerItem } from "@/components/animations/stagger-container"
import { Database, Zap, Shield, ArrowRight, CheckCircle, BarChart3 } from "lucide-react"
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema"

export const metadata = {
  title: "Valutazione Immobiliare Online Automatica per Agenzie",
  description: "Offri valutazioni immobiliari automatiche sul tuo sito con dati OMI ufficiali. 133.000+ quotazioni, 7.889 comuni italiani, calcolo in 3 secondi. Stima immobiliare precisa per agenzie.",
  keywords: [
    "valutazione immobiliare online",
    "valutazione immobiliare automatica",
    "stima immobiliare automatica",
    "calcolo valore immobile",
    "valutazione OMI online",
    "stima casa online",
    "widget valutazione immobiliare",
    "valutazione immobile per agenzie",
  ],
  alternates: {
    canonical: "https://domusreport.com/funzionalita/valutazione-immobiliare-online",
  },
  openGraph: {
    title: "Valutazione Immobiliare Online Automatica | DomusReport",
    description: "Integra valutazioni OMI automatiche nel tuo sito. 133.000+ dati, calcolo in 3 secondi, precisione 98%.",
    url: "https://domusreport.com/funzionalita/valutazione-immobiliare-online",
  },
}

export default function ValutazioneImmobiliarePage() {
  const vantaggi = [
    {
      icon: Database,
      title: "133.000+ Dati OMI Ufficiali",
      description: "Database completo dell'Osservatorio del Mercato Immobiliare con quotazioni per zona e CAP su 7.889 comuni italiani.",
    },
    {
      icon: Zap,
      title: "Calcolo in 3 Secondi",
      description: "L'algoritmo analizza indirizzo, tipologia, superficie, piano, stato e classe energetica per restituire una stima precisa in tempo reale.",
    },
    {
      icon: Shield,
      title: "15+ Coefficienti Qualitativi",
      description: "Piano, stato conservativo, classe energetica, anno di costruzione, parcheggio, spazi esterni. Ogni variabile conta per una stima accurata.",
    },
    {
      icon: BarChart3,
      title: "Range Min-Max Trasparente",
      description: "Ogni valutazione mostra il range di prezzo minimo e massimo basato sui dati OMI, con il valore medio calcolato sui coefficienti reali.",
    },
  ]

  const comeCalcoliamo = [
    "Identificazione della zona OMI tramite indirizzo e CAP",
    "Selezione automatica della categoria (abitazioni civili, signorili, economiche, ville)",
    "Applicazione del coefficiente di piano (seminterrato → attico)",
    "Applicazione del coefficiente di stato conservativo",
    "Calcolo del coefficiente di classe energetica (A4 → G)",
    "Valutazione dell'anno di costruzione dell'immobile",
    "Considerazione di parcheggio, spazi esterni, riscaldamento",
    "Calcolo finale: prezzo OMI × superficie × coefficiente qualitativo",
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="h-20" />
      <BreadcrumbSchema items={[
        { name: "Home", url: "https://domusreport.com" },
        { name: "Funzionalità", url: "https://domusreport.com/funzionalita" },
        { name: "Valutazione Immobiliare Online", url: "https://domusreport.com/funzionalita/valutazione-immobiliare-online" },
      ]} />

      <main className="w-full">
        {/* Hero */}
        <section className="relative w-full overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-16 sm:py-20 lg:py-28">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-30" />
          </div>
          <div className="relative site-container text-center space-y-6 max-w-3xl mx-auto">
            <FadeIn>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-balance">
                Valutazione Immobiliare Online Automatica
              </h1>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-lg sm:text-xl text-foreground-muted mx-auto text-balance">
                Integra nel tuo sito web un sistema di valutazione immobiliare basato su dati OMI ufficiali. I tuoi visitatori ricevono una stima precisa in 3 secondi, tu ricevi un lead qualificato con tutti i dati.
              </p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8 hover:scale-105 transition-transform">
                    Prova gratis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/#demo">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-12 px-8 hover:scale-105 transition-transform bg-background/50 backdrop-blur-sm">
                    Vedi la demo
                  </Button>
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Vantaggi */}
        <section className="site-container py-16 sm:py-24">
          <SlideUp>
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-balance">
              Come funziona la valutazione automatica
            </h2>
          </SlideUp>
          <StaggerContainer className="grid gap-6 md:grid-cols-2">
            {vantaggi.map((v) => (
              <StaggerItem key={v.title} className="rounded-2xl border border-border/50 bg-surface/50 backdrop-blur-sm p-8 space-y-4 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <v.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">{v.title}</h3>
                </div>
                <p className="text-foreground-muted leading-relaxed text-base">{v.description}</p>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* Come calcoliamo */}
        <section className="w-full bg-surface/30 border-y border-border/50 py-16 sm:py-24 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl -z-10" />
          <div className="site-container max-w-3xl mx-auto space-y-10">
            <SlideUp>
              <h2 className="text-3xl sm:text-4xl font-bold text-center text-balance">
                L&apos;algoritmo di valutazione OMI
              </h2>
            </SlideUp>
            <SlideUp delay={0.1}>
              <p className="text-center text-foreground-muted text-lg sm:text-xl leading-relaxed text-balance">
                Il nostro sistema utilizza i dati ufficiali dell&apos;Osservatorio del Mercato Immobiliare dell&apos;Agenzia delle Entrate, combinati con oltre 15 coefficienti qualitativi per una stima accurata.
              </p>
            </SlideUp>
            <StaggerContainer className="p-8 sm:p-10 rounded-3xl bg-surface/50 border border-border/50 backdrop-blur-sm shadow-xl shadow-primary/5">
              <ol className="space-y-5">
                {comeCalcoliamo.map((step, i) => (
                  <StaggerItem key={i} className="flex items-start gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {i + 1}
                    </div>
                    <span className="text-foreground-muted text-lg leading-snug pt-1">{step}</span>
                  </StaggerItem>
                ))}
              </ol>
            </StaggerContainer>
          </div>
        </section>

        {/* Per chi */}
        <section className="site-container py-16 sm:py-24 max-w-3xl mx-auto space-y-10">
          <SlideUp>
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-balance">
              Per agenzie immobiliari che vogliono automatizzare
            </h2>
          </SlideUp>
          <SlideUp delay={0.1}>
            <div className="space-y-6 text-lg text-foreground-muted leading-relaxed">
              <p>
                DomusReport è progettato per le <strong className="text-foreground">agenzie immobiliari italiane</strong> che
                vogliono offrire ai visitatori del proprio sito un servizio di valutazione immobiliare immediato e professionale.
              </p>
              <p>
                Invece di un form statico che chiede &quot;nome, email, telefono&quot;, il tuo sito offre una conversazione AI
                che raccoglie i dati dell&apos;immobile e restituisce una <strong className="text-foreground">stima basata su dati OMI reali</strong>.
                Il visitatore ottiene valore immediato, tu ottieni un lead qualificato con tutti i dettagli dell&apos;immobile.
              </p>
              <p>
                Le valutazioni coprono tutti i <strong className="text-foreground">7.889 comuni italiani</strong> con oltre
                133.000 quotazioni OMI suddivise per zona, tipologia e stato conservativo. Supportiamo appartamenti, ville,
                attici, box, negozi e uffici.
              </p>
            </div>
          </SlideUp>
        </section>

        {/* Approfondisci */}
        <section className="site-container py-16 sm:py-24 max-w-4xl mx-auto">
          <SlideUp>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10 text-balance">Approfondisci sul blog</h2>
          </SlideUp>
          <StaggerContainer className="grid gap-6 sm:grid-cols-3">
            <StaggerItem>
              <Link href="/blog/guida-dati-omi-valutazioni" className="block h-full rounded-2xl border border-border/50 bg-surface/50 backdrop-blur-sm p-6 space-y-3 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300">
                <div className="text-xs font-semibold uppercase tracking-wide text-primary">Guida Completa</div>
                <h3 className="text-base font-semibold leading-snug">Tutto sui Dati OMI: Come Usarli per Valutazioni Perfette</h3>
                <span className="text-sm font-medium text-primary flex items-center gap-1 pt-2">Leggi articolo <ArrowRight className="h-4 w-4" /></span>
              </Link>
            </StaggerItem>
            <StaggerItem>
              <Link href="/blog/dati-omi-guida-completa" className="block h-full rounded-2xl border border-border/50 bg-surface/50 backdrop-blur-sm p-6 space-y-3 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300">
                <div className="text-xs font-semibold uppercase tracking-wide text-primary">Dati e Analisi</div>
                <h3 className="text-base font-semibold leading-snug">Dati OMI: Guida Completa alle Quotazioni Immobiliari</h3>
                <span className="text-sm font-medium text-primary flex items-center gap-1 pt-2">Leggi articolo <ArrowRight className="h-4 w-4" /></span>
              </Link>
            </StaggerItem>
            <StaggerItem>
              <Link href="/blog/valutazione-immobiliare-guida-agenzie" className="block h-full rounded-2xl border border-border/50 bg-surface/50 backdrop-blur-sm p-6 space-y-3 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300">
                <div className="text-xs font-semibold uppercase tracking-wide text-primary">Valutazione</div>
                <h3 className="text-base font-semibold leading-snug">Valutazione Immobiliare Online: Guida per Agenzie</h3>
                <span className="text-sm font-medium text-primary flex items-center gap-1 pt-2">Leggi articolo <ArrowRight className="h-4 w-4" /></span>
              </Link>
            </StaggerItem>
          </StaggerContainer>
        </section>

        {/* CTA */}
        <section className="site-container pb-16 sm:pb-24">
          <SlideUp>
            <div className="rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary-hover p-8 sm:p-12 text-center text-primary-foreground space-y-8 relative overflow-hidden shadow-2xl shadow-primary/20">
              <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                <Zap className="w-32 h-32" />
              </div>
              <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold text-balance">Inizia a offrire valutazioni automatiche</h2>
                <p className="text-lg sm:text-xl text-primary-foreground/90 text-balance">
                  Setup in 2 minuti. Nessuna carta di credito. 5 valutazioni gratuite al mese.
                </p>
              </div>
              <div className="relative z-10 flex justify-center">
                <Link href="/register">
                  <Button size="lg" variant="secondary" className="text-primary font-semibold text-base h-12 px-8 hover:scale-105 transition-transform shadow-lg">
                    Registrati gratis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </SlideUp>
        </section>
      </main>

      <Footer />
    </div>
  )
}
