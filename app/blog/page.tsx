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
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="h-16" />

      <main className="w-full">
        <section className="relative w-full overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-16 sm:py-20">
          <div className="relative site-container text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-black leading-tight">Blog</h1>
            <p className="text-lg text-foreground-muted">
              Guide, strategie e approfondimenti per agenzie immobiliari che vogliono crescere con la tecnologia.
            </p>
          </div>
        </section>

        <section className="site-container py-12 sm:py-16">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {articoli.map((art) => (
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
