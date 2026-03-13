import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
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
            <h1 className="text-4xl sm:text-5xl font-black leading-tight">
              Valutazione Immobiliare Online Automatica
            </h1>
            <p className="text-lg sm:text-xl text-foreground-muted">
              Integra nel tuo sito web un sistema di valutazione immobiliare basato su dati OMI ufficiali. I tuoi visitatori ricevono una stima precisa in 3 secondi, tu ricevi un lead qualificato con tutti i dati.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg">
                  Prova gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/#demo">
                <Button size="lg" variant="outline">Vedi la demo</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Vantaggi */}
        <section className="site-container py-16 sm:py-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Come funziona la valutazione automatica
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            {vantaggi.map((v) => (
              <div key={v.title} className="rounded-2xl border border-border bg-surface p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <v.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{v.title}</h3>
                </div>
                <p className="text-foreground-muted">{v.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Come calcoliamo */}
        <section className="w-full bg-surface border-y border-border py-16 sm:py-20">
          <div className="site-container max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold text-center">
              L&apos;algoritmo di valutazione OMI
            </h2>
            <p className="text-center text-foreground-muted text-lg">
              Il nostro sistema utilizza i dati ufficiali dell&apos;Osservatorio del Mercato Immobiliare dell&apos;Agenzia delle Entrate, combinati con oltre 15 coefficienti qualitativi per una stima accurata.
            </p>
            <ol className="space-y-4">
              {comeCalcoliamo.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground-muted">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Per chi */}
        <section className="site-container py-16 sm:py-20 max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl font-bold text-center">
            Per agenzie immobiliari che vogliono automatizzare
          </h2>
          <div className="space-y-4 text-lg text-foreground-muted">
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
        </section>

        {/* Approfondisci */}
        <section className="site-container py-16 sm:py-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Approfondisci sul blog</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Link href="/blog/guida-dati-omi-valutazioni" className="rounded-xl border border-border bg-surface p-4 space-y-2 hover:border-primary/30 transition-colors">
              <div className="text-xs font-semibold uppercase tracking-wide text-primary">Guida Completa</div>
              <h3 className="text-sm font-semibold leading-snug">Tutto sui Dati OMI: Come Usarli per Valutazioni Perfette</h3>
              <span className="text-xs text-primary flex items-center gap-1">Leggi <ArrowRight className="h-3 w-3" /></span>
            </Link>
            <Link href="/blog/dati-omi-guida-completa" className="rounded-xl border border-border bg-surface p-4 space-y-2 hover:border-primary/30 transition-colors">
              <div className="text-xs font-semibold uppercase tracking-wide text-primary">Dati e Analisi</div>
              <h3 className="text-sm font-semibold leading-snug">Dati OMI: Guida Completa alle Quotazioni Immobiliari</h3>
              <span className="text-xs text-primary flex items-center gap-1">Leggi <ArrowRight className="h-3 w-3" /></span>
            </Link>
            <Link href="/blog/valutazione-immobiliare-guida-agenzie" className="rounded-xl border border-border bg-surface p-4 space-y-2 hover:border-primary/30 transition-colors">
              <div className="text-xs font-semibold uppercase tracking-wide text-primary">Valutazione</div>
              <h3 className="text-sm font-semibold leading-snug">Valutazione Immobiliare Online: Guida per Agenzie</h3>
              <span className="text-xs text-primary flex items-center gap-1">Leggi <ArrowRight className="h-3 w-3" /></span>
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="site-container pb-16 sm:pb-20">
          <div className="rounded-3xl bg-gradient-to-r from-primary to-primary-hover p-10 text-center text-primary-foreground space-y-6">
            <h2 className="text-3xl font-bold">Inizia a offrire valutazioni automatiche</h2>
            <p className="text-lg text-primary-foreground/80">
              Setup in 2 minuti. Nessuna carta di credito. 5 valutazioni gratuite al mese.
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-primary">
                Registrati gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
