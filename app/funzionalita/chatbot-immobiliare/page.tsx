import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Sparkles, MessageSquare, Code, ArrowRight, CheckCircle, Palette } from "lucide-react"
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema"

export const metadata = {
  title: "Chatbot Immobiliare AI per Agenzie",
  description: "Chatbot AI conversazionale per agenzie immobiliari. Sostituisce i form con una conversazione naturale, qualifica i lead e calcola valutazioni OMI in tempo reale. Setup in 2 minuti.",
  keywords: [
    "chatbot immobiliare",
    "chatbot agenzia immobiliare",
    "chatbot AI immobiliare",
    "intelligenza artificiale immobiliare",
    "AI agenti immobiliari",
    "assistente virtuale immobiliare",
    "chatbot per sito immobiliare",
    "chatbot valutazione casa",
  ],
  alternates: {
    canonical: "https://domusreport.com/funzionalita/chatbot-immobiliare",
  },
  openGraph: {
    title: "Chatbot Immobiliare AI per Agenzie | DomusReport",
    description: "Chatbot AI che sostituisce i form, qualifica lead e calcola valutazioni OMI. Setup in 2 minuti.",
    url: "https://domusreport.com/funzionalita/chatbot-immobiliare",
  },
}

export default function ChatbotImmobiliarePage() {
  const capacita = [
    {
      icon: MessageSquare,
      title: "Conversazione Naturale in Italiano",
      description: "Il chatbot dialoga con i visitatori in modo naturale, facendo domande intelligenti e contestuali. Non sembra un bot, sembra un assistente esperto.",
    },
    {
      icon: Sparkles,
      title: "Qualificazione Automatica",
      description: "Durante la conversazione, l'AI raccoglie tutti i dati necessari: indirizzo, tipologia, superficie, piano, stato, classe energetica e motivazione alla vendita.",
    },
    {
      icon: Palette,
      title: "Personalizzazione Completa",
      description: "12 temi predefiniti, colori custom, logo della tua agenzia, posizione e animazione personalizzabili. Con il piano Premium, CSS custom per un white-label completo.",
    },
    {
      icon: Code,
      title: "Integrazione 1-Click",
      description: "Copia-incolla una riga di codice nel tuo sito. Compatibile con WordPress, Webflow, Wix, HTML statico e qualsiasi piattaforma web.",
    },
  ]

  const tipologieSupport = [
    "Appartamenti e monolocali",
    "Ville e villini",
    "Attici e mansarde",
    "Box e posti auto",
    "Negozi e locali commerciali",
    "Uffici e studi professionali",
    "Loft e open space",
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="h-20" />
      <BreadcrumbSchema items={[
        { name: "Home", url: "https://domusreport.com" },
        { name: "Funzionalità", url: "https://domusreport.com/funzionalita" },
        { name: "Chatbot Immobiliare AI", url: "https://domusreport.com/funzionalita/chatbot-immobiliare" },
      ]} />

      <main className="w-full">
        {/* Hero */}
        <section className="relative w-full overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-16 sm:py-20 lg:py-28">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-30" />
          </div>
          <div className="relative site-container text-center space-y-6 max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-black leading-tight">
              Chatbot AI per Agenzie Immobiliari
            </h1>
            <p className="text-lg sm:text-xl text-foreground-muted">
              Il primo chatbot conversazionale che sostituisce i form statici, qualifica i visitatori del tuo sito e calcola valutazioni immobiliari OMI in tempo reale.
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

        {/* Capacità */}
        <section className="site-container py-16 sm:py-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Un chatbot progettato per il real estate
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            {capacita.map((c) => (
              <div key={c.title} className="rounded-2xl border border-border bg-surface p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{c.title}</h3>
                </div>
                <p className="text-foreground-muted">{c.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tipologie */}
        <section className="w-full bg-surface border-y border-border py-16 sm:py-20">
          <div className="site-container max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold text-center">
              Supporta tutte le tipologie immobiliari
            </h2>
            <p className="text-center text-foreground-muted text-lg">
              Il chatbot riconosce e gestisce automaticamente diverse tipologie di immobili, adattando le domande e i coefficienti di valutazione.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {tipologieSupport.map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-foreground-muted">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contenuto SEO */}
        <section className="site-container py-16 sm:py-20 max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl font-bold text-center">
            Perch&eacute; un chatbot immobiliare nel 2026
          </h2>
          <div className="space-y-4 text-lg text-foreground-muted">
            <p>
              Il settore immobiliare sta adottando l&apos;<strong className="text-foreground">intelligenza artificiale</strong> a ritmo
              crescente. Secondo le ricerche di settore, le agenzie che utilizzano strumenti AI per la qualificazione dei lead registrano
              un aumento medio del 40% nel tasso di conversione rispetto ai metodi tradizionali.
            </p>
            <p>
              Un <strong className="text-foreground">chatbot per agenzie immobiliari</strong> non &egrave; un semplice risponditore automatico.
              DomusReport &egrave; un sistema conversazionale specializzato nel real estate italiano: conosce le zone OMI, le tipologie catastali,
              i coefficienti di valutazione e sa guidare il visitatore attraverso una conversazione strutturata che raccoglie tutti i dati necessari.
            </p>
            <p>
              A differenza dei chatbot generici, DomusReport integra direttamente il <strong className="text-foreground">calcolo della valutazione
              immobiliare</strong> nella conversazione. Il visitatore non deve andare su un altro sito o aspettare una risposta: ottiene la stima
              in tempo reale, basata sui dati ufficiali dell&apos;Osservatorio del Mercato Immobiliare.
            </p>
            <p>
              L&apos;integrazione &egrave; immediata: una riga di codice da incollare nel tuo sito. Funziona su <Link href="/docs/wordpress" className="text-primary hover:underline">WordPress</Link>,{" "}
              <Link href="/docs/webflow" className="text-primary hover:underline">Webflow</Link>,{" "}
              <Link href="/docs/html" className="text-primary hover:underline">HTML statico</Link> e qualsiasi piattaforma web.
            </p>
          </div>
        </section>

        {/* Approfondisci */}
        <section className="site-container py-16 sm:py-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Approfondisci sul blog</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Link href="/blog/intelligenza-artificiale-immobiliare" className="rounded-xl border border-border bg-surface p-4 space-y-2 hover:border-primary/30 transition-colors">
              <div className="text-xs font-semibold uppercase tracking-wide text-primary">Tecnologia</div>
              <h3 className="text-sm font-semibold leading-snug">Intelligenza Artificiale nel Settore Immobiliare</h3>
              <span className="text-xs text-primary flex items-center gap-1">Leggi <ArrowRight className="h-3 w-3" /></span>
            </Link>
            <Link href="/blog/come-generare-lead-immobiliari" className="rounded-xl border border-border bg-surface p-4 space-y-2 hover:border-primary/30 transition-colors">
              <div className="text-xs font-semibold uppercase tracking-wide text-primary">Lead Generation</div>
              <h3 className="text-sm font-semibold leading-snug">Come Generare Lead Immobiliari nel 2026</h3>
              <span className="text-xs text-primary flex items-center gap-1">Leggi <ArrowRight className="h-3 w-3" /></span>
            </Link>
            <Link href="/blog/qualificare-lead-immobiliari" className="rounded-xl border border-border bg-surface p-4 space-y-2 hover:border-primary/30 transition-colors">
              <div className="text-xs font-semibold uppercase tracking-wide text-primary">Lead Management</div>
              <h3 className="text-sm font-semibold leading-snug">Come Qualificare i Lead Immobiliari</h3>
              <span className="text-xs text-primary flex items-center gap-1">Leggi <ArrowRight className="h-3 w-3" /></span>
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="site-container pb-16 sm:pb-20">
          <div className="rounded-3xl bg-gradient-to-r from-primary to-primary-hover p-10 text-center text-primary-foreground space-y-6">
            <h2 className="text-3xl font-bold">Attiva il chatbot sul tuo sito</h2>
            <p className="text-lg text-primary-foreground/80">
              Setup in 2 minuti. Nessuna competenza tecnica richiesta. Prova gratis.
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
