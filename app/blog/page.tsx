import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ArrowRight } from "lucide-react"

export const metadata = {
  title: "Blog - Risorse per Agenzie Immobiliari",
  description: "Guide, strategie e approfondimenti su lead generation, valutazione immobiliare, AI e strumenti digitali per agenzie immobiliari italiane.",
  keywords: [
    "blog immobiliare",
    "guide agenzie immobiliari",
    "strategie lead generation immobiliare",
    "AI immobiliare",
    "strumenti digitali agenzie",
  ],
  alternates: {
    canonical: "https://domusreport.com/blog",
  },
}

const articoli = [
  {
    slug: "guida-lead-generation-immobiliare",
    titolo: "Guida Definitiva alla Lead Generation Immobiliare nel 2026",
    descrizione: "La guida completa: strategie, strumenti, social media, farming digitale, qualificazione e automazione AI per generare lead qualificati.",
    data: "13 Marzo 2026",
    categoria: "Guida Completa",
  },
  {
    slug: "guida-dati-omi-valutazioni",
    titolo: "Tutto sui Dati OMI: Come Usarli per Valutazioni Perfette",
    descrizione: "Come leggere, interpretare e usare i dati OMI per valutazioni immobiliari precise. Guida completa con coefficienti e strumenti.",
    data: "10 Marzo 2026",
    categoria: "Guida Completa",
  },
  {
    slug: "come-generare-lead-immobiliari",
    titolo: "Come Generare Lead Immobiliari nel 2026: Guida Completa",
    descrizione: "Strategie pratiche per acquisire contatti qualificati: dal chatbot AI ai social media, passando per SEO locale e Google Ads.",
    data: "13 Marzo 2026",
    categoria: "Lead Generation",
  },
  {
    slug: "valutazione-immobiliare-guida-agenzie",
    titolo: "Valutazione Immobiliare Online: Guida per Agenzie",
    descrizione: "Come funzionano i dati OMI, quali strumenti usare per offrire valutazioni automatiche e come trasformarle in opportunità di business.",
    data: "10 Marzo 2026",
    categoria: "Valutazione",
  },
  {
    slug: "intelligenza-artificiale-immobiliare",
    titolo: "Intelligenza Artificiale nel Settore Immobiliare: Cosa Cambia per le Agenzie",
    descrizione: "Come l'AI sta trasformando il real estate italiano: chatbot, valutazioni automatiche, qualificazione lead e marketing predittivo.",
    data: "7 Marzo 2026",
    categoria: "Tecnologia",
  },
  {
    slug: "marketing-digitale-agenzie-immobiliari",
    titolo: "Marketing Digitale per Agenzie Immobiliari: Guida Pratica 2026",
    descrizione: "SEO locale, Google Ads, social media, email marketing, chatbot AI e automazione: strategie concrete per la tua agenzia.",
    data: "3 Marzo 2026",
    categoria: "Marketing",
  },
  {
    slug: "dati-omi-guida-completa",
    titolo: "Dati OMI: Guida Completa alle Quotazioni Immobiliari Ufficiali",
    descrizione: "Cosa sono i dati OMI, come leggerli, dove trovarli e come usarli per le valutazioni immobiliari. Guida per agenzie e professionisti.",
    data: "1 Marzo 2026",
    categoria: "Dati e Analisi",
  },
  {
    slug: "qualificare-lead-immobiliari",
    titolo: "Come Qualificare i Lead Immobiliari: Guida Pratica per Agenti",
    descrizione: "Tecniche e strumenti per qualificare i contatti: distingui curiosi da venditori seri con AI, scoring e domande strategiche.",
    data: "27 Febbraio 2026",
    categoria: "Lead Management",
  },
  {
    slug: "strumenti-digitali-agenzie-immobiliari",
    titolo: "Strumenti Digitali per Agenzie Immobiliari: Guida Completa 2026",
    descrizione: "CRM, chatbot AI, valutazione automatica, gestionale, email marketing e analytics: confronto e guida alla scelta.",
    data: "25 Febbraio 2026",
    categoria: "Strumenti",
  },
  {
    slug: "report-valutazione-immobiliare-professionale",
    titolo: "Report Valutazione Immobiliare: Come Creare Documenti Professionali",
    descrizione: "Template, dati da includere, branding e automazione con AI per creare report di valutazione immobiliare professionali.",
    data: "22 Febbraio 2026",
    categoria: "Report",
  },
  {
    slug: "acquisizione-immobili-strategie-agenzie",
    titolo: "Acquisizione Immobili: 7 Strategie per Agenzie nel 2026",
    descrizione: "Le strategie più efficaci per acquisire nuovi immobili: dal farming di zona al chatbot AI, passando per open house e referral.",
    data: "20 Febbraio 2026",
    categoria: "Acquisizione",
  },
  {
    slug: "come-leggere-quotazioni-omi",
    titolo: "Come Leggere le Quotazioni OMI: Guida Pratica",
    descrizione: "Guida step-by-step alla lettura delle quotazioni OMI: zone catastali, tipologie, range di prezzo e esempi pratici.",
    data: "18 Febbraio 2026",
    categoria: "Dati e Analisi",
  },
  {
    slug: "valutazione-omi-vs-stima-commerciale",
    titolo: "Differenza tra Valutazione OMI e Stima Commerciale",
    descrizione: "OMI vs perizia: quando usare ciascuna, differenze chiave e come integrarle per stime accurate.",
    data: "16 Febbraio 2026",
    categoria: "Valutazione",
  },
  {
    slug: "notizie-immobiliari-online",
    titolo: "Come Trovare Notizie Immobiliari Online per la Tua Agenzia",
    descrizione: "Le migliori fonti di notizie immobiliari online: portali, OMI, Google Alerts e strategie per l'acquisizione.",
    data: "15 Febbraio 2026",
    categoria: "Acquisizione",
  },
  {
    slug: "valutazione-immobile-online-gratis-agenzie",
    titolo: "Valutazione Immobile Online Gratis: Migliori Tool per Agenzie",
    descrizione: "I migliori strumenti di valutazione immobiliare online gratuiti: tipologie, funzionalità e come usarli come lead magnet.",
    data: "14 Febbraio 2026",
    categoria: "Strumenti",
  },
  {
    slug: "acquisizione-incarichi-vendita",
    titolo: "Acquisizione Incarichi di Vendita: Strategie che Funzionano",
    descrizione: "Come ottenere mandati di vendita: preparazione, fiducia, valutazione professionale e gestione delle obiezioni.",
    data: "12 Febbraio 2026",
    categoria: "Acquisizione",
  },
  {
    slug: "social-media-acquisizione-immobili",
    titolo: "Social Media per Acquisire Immobili da Vendere: Guida Pratica",
    descrizione: "Instagram, Facebook, LinkedIn e TikTok per agenzie immobiliari: contenuti, strategie e lead generation.",
    data: "10 Febbraio 2026",
    categoria: "Social Media",
  },
  {
    slug: "farming-immobiliare-digitale",
    titolo: "Farming Immobiliare Digitale: Guida Pratica per Agenti",
    descrizione: "Cos'è il farming digitale, come scegliere la zona, presenza online e offline e come misurare i risultati.",
    data: "8 Febbraio 2026",
    categoria: "Acquisizione",
  },
  {
    slug: "intelligenza-artificiale-stime-immobiliari",
    titolo: "Come l'Intelligenza Artificiale Migliora le Stime Immobiliari",
    descrizione: "Come l'AI automatizza la raccolta dati, applica coefficienti e genera spiegazioni testuali nelle stime OMI.",
    data: "6 Febbraio 2026",
    categoria: "Tecnologia",
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="h-20" />

      <main className="w-full">
        <section className="relative w-full overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-16 sm:py-20">
          <div className="relative site-container text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-black leading-tight">Blog</h1>
            <p className="text-lg text-foreground-muted">
              Guide, strategie e approfondimenti per agenzie immobiliari che vogliono crescere con la tecnologia.
            </p>
          </div>
        </section>

        {/* Guide Complete */}
        <section className="site-container py-8 sm:py-12">
          <h2 className="text-2xl font-bold mb-6">Guide Complete</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {articoli.filter(a => a.categoria === "Guida Completa").map((art) => (
              <Link
                key={art.slug}
                href={`/blog/${art.slug}`}
                className="group rounded-2xl border-2 border-primary/20 bg-surface p-8 space-y-4 transition-colors hover:border-primary/40"
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-primary bg-primary/10 px-2 py-1 rounded-full w-fit">
                  {art.categoria}
                </div>
                <h2 className="text-xl font-bold group-hover:text-primary transition-colors">
                  {art.titolo}
                </h2>
                <p className="text-sm text-foreground-muted">{art.descrizione}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground-muted">{art.data}</span>
                  <span className="text-primary flex items-center gap-1">
                    Leggi la guida <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="site-container py-12 sm:py-16">
          <h2 className="text-2xl font-bold mb-6">Tutti gli articoli</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {articoli.filter(a => a.categoria !== "Guida Completa").map((art) => (
              <Link
                key={art.slug}
                href={`/blog/${art.slug}`}
                className="group rounded-2xl border border-border bg-surface p-6 space-y-4 transition-colors hover:border-primary/30"
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {art.categoria}
                </div>
                <h2 className="text-xl font-bold group-hover:text-primary transition-colors">
                  {art.titolo}
                </h2>
                <p className="text-sm text-foreground-muted">{art.descrizione}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground-muted">{art.data}</span>
                  <span className="text-primary flex items-center gap-1">
                    Leggi <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
