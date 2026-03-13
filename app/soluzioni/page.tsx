import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema"
import { Button } from "@/components/ui/button"
import { ArrowRight, LayoutGrid, MessageSquare, Paintbrush, Search } from "lucide-react"

export const metadata = {
  title: "Soluzioni per Agenzie Immobiliari | DomusReport",
  description: "Scopri le soluzioni DomusReport per agenzie immobiliari: widget di valutazione, chatbot AI, software white label e strumenti di stima immobiliare basati su dati OMI ufficiali.",
  keywords: [
    "soluzioni agenzie immobiliari",
    "software immobiliare",
    "strumenti agenzia immobiliare",
    "soluzioni digitali immobiliare",
    "software agenzia immobiliare AI",
    "strumenti valutazione immobiliare",
  ],
  alternates: {
    canonical: "https://domusreport.com/soluzioni",
  },
  openGraph: {
    title: "Soluzioni per Agenzie Immobiliari | DomusReport",
    description: "Widget di valutazione, chatbot AI, software white label e strumenti di stima immobiliare per agenzie.",
    url: "https://domusreport.com/soluzioni",
    type: "website",
  },
}

const soluzioni = [
  {
    icon: LayoutGrid,
    title: "Widget Valutazione Immobili",
    description: "Installa un widget di valutazione immobiliare sul tuo sito web. I visitatori ottengono una stima OMI istantanea, tu ricevi lead qualificati con tutti i dati dell'immobile.",
    href: "/soluzioni/widget-valutazione-immobili-sito-web",
    cta: "Scopri il widget",
  },
  {
    icon: MessageSquare,
    title: "Chatbot Immobiliare: Sito vs WhatsApp",
    description: "Confronta le soluzioni chatbot per agenzie immobiliari. Scopri vantaggi, costi e differenze tra chatbot sul sito web e automazioni WhatsApp Business.",
    href: "/soluzioni/chatbot-immobiliare-whatsapp-sito",
    cta: "Confronta le opzioni",
  },
  {
    icon: Paintbrush,
    title: "Software Stima White Label",
    description: "Personalizza completamente il software di valutazione con il tuo brand: logo, colori, CSS custom e report PDF brandizzati. Nessun riferimento a DomusReport.",
    href: "/soluzioni/software-stima-immobiliare-white-label",
    cta: "Scopri il white label",
  },
  {
    icon: Search,
    title: "Migliori Software Valutazione",
    description: "Guida alla scelta del miglior software di valutazione immobiliare. Criteri di confronto: dati ufficiali, AI, integrazioni, white label e modello di prezzo.",
    href: "/soluzioni/migliori-software-valutazione-immobiliare",
    cta: "Leggi il confronto",
  },
]

export default function SoluzioniPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="h-20" />
      <BreadcrumbSchema items={[
        { name: "Home", url: "https://domusreport.com" },
        { name: "Soluzioni", url: "https://domusreport.com/soluzioni" },
      ]} />

      <main className="w-full">
        {/* Hero */}
        <section className="relative w-full overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-16 sm:py-20 lg:py-28">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-30" />
          </div>
          <div className="relative site-container text-center space-y-6 max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-black leading-tight">
              Soluzioni per Agenzie Immobiliari
            </h1>
            <p className="text-lg sm:text-xl text-foreground-muted">
              Strumenti digitali basati su intelligenza artificiale e dati OMI ufficiali per automatizzare le valutazioni, generare lead qualificati e potenziare la tua agenzia immobiliare.
            </p>
          </div>
        </section>

        {/* Griglia Soluzioni */}
        <section className="site-container py-16 sm:py-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Scegli la soluzione giusta per la tua agenzia
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            {soluzioni.map((s) => (
              <Link key={s.title} href={s.href} className="group">
                <div className="rounded-2xl border border-border bg-surface p-8 space-y-4 h-full transition-shadow hover:shadow-lg hover:border-primary/30">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <s.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">{s.title}</h3>
                  </div>
                  <p className="text-foreground-muted leading-relaxed">{s.description}</p>
                  <div className="flex items-center gap-2 text-primary font-medium">
                    {s.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Contenuto SEO */}
        <section className="w-full bg-surface border-y border-border py-16 sm:py-20">
          <div className="site-container max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold text-center">
              Perch&eacute; scegliere DomusReport
            </h2>
            <div className="space-y-4 text-lg text-foreground-muted">
              <p>
                DomusReport offre alle <strong className="text-foreground">agenzie immobiliari italiane</strong> una suite completa di strumenti digitali per la valutazione immobiliare e la generazione di lead. Ogni soluzione si basa su dati OMI ufficiali dell&apos;Agenzia delle Entrate, con oltre 133.000 quotazioni su 7.889 comuni.
              </p>
              <p>
                Che tu stia cercando un <strong className="text-foreground">widget da integrare nel sito</strong>, un chatbot conversazionale per qualificare i visitatori, o un software white label completamente personalizzabile, DomusReport ha la soluzione adatta alle tue esigenze.
              </p>
              <p>
                Tutte le soluzioni si installano in meno di 2 minuti, senza competenze tecniche. Puoi iniziare con il piano gratuito e scalare quando la tua agenzia cresce.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="site-container py-16 sm:py-20">
          <div className="rounded-3xl bg-gradient-to-r from-primary to-primary-hover p-10 text-center text-primary-foreground space-y-6">
            <h2 className="text-3xl font-bold">Pronto a trasformare la tua agenzia?</h2>
            <p className="text-lg text-primary-foreground/80">
              Registrati gratis e scopri quale soluzione fa al caso tuo. Setup in 2 minuti, nessuna carta di credito.
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-primary">
                Inizia gratis
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
