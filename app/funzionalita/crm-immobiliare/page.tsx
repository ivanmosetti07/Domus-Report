import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Users, BarChart3, FileText, ArrowRight, CheckCircle, Mail, Download } from "lucide-react"
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema"

export const metadata = {
  title: "CRM Immobiliare con AI e Analytics",
  description: "CRM immobiliare integrato con chatbot AI. Gestisci lead, monitora conversioni, genera report PDF e esporta dati. Software per agenzie immobiliari con analytics in tempo reale.",
  keywords: [
    "CRM immobiliare",
    "gestionale immobiliare",
    "software agenzia immobiliare",
    "gestionale agenzia immobiliare",
    "gestione lead immobiliare",
    "software gestione contatti immobiliare",
    "CRM agenzie immobiliari",
  ],
  alternates: {
    canonical: "https://domusreport.com/funzionalita/crm-immobiliare",
  },
  openGraph: {
    title: "CRM Immobiliare con AI e Analytics | DomusReport",
    description: "Gestisci lead immobiliari con CRM integrato. Analytics, report PDF, export CSV. Software per agenzie.",
    url: "https://domusreport.com/funzionalita/crm-immobiliare",
  },
}

export default function CRMImmobiliarePage() {
  const funzionalita = [
    {
      icon: Users,
      title: "Gestione Lead Completa",
      description: "Ogni lead arriva con dati immobile, valutazione OMI, storico conversazione AI e contatti. Gestisci lo stato: nuovo, contattato, qualificato, convertito.",
    },
    {
      icon: BarChart3,
      title: "Analytics in Tempo Reale",
      description: "Dashboard con KPI essenziali: lead generati, tasso di conversione, impression widget, valutazioni completate. Monitora le performance giorno per giorno.",
    },
    {
      icon: FileText,
      title: "Report PDF Automatici",
      description: "Genera report professionali brandizzati con valutazione, dati immobile, mappa e coefficienti. Un click per creare, un click per inviare via email.",
    },
    {
      icon: Mail,
      title: "Notifiche Email Istantanee",
      description: "Ricevi un'email per ogni nuovo lead con tutti i dettagli. Non perdi mai un contatto, anche quando non sei in dashboard.",
    },
    {
      icon: Download,
      title: "Export CSV e Excel",
      description: "Esporta tutti i dati dei tuoi lead in formato CSV o Excel. Importa in qualsiasi gestionale o CRM esterno che già utilizzi.",
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="h-20" />
      <BreadcrumbSchema items={[
        { name: "Home", url: "https://domusreport.com" },
        { name: "Funzionalità", url: "https://domusreport.com/funzionalita" },
        { name: "CRM Immobiliare", url: "https://domusreport.com/funzionalita/crm-immobiliare" },
      ]} />

      <main className="w-full">
        {/* Hero */}
        <section className="relative w-full overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-16 sm:py-20 lg:py-28">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-30" />
          </div>
          <div className="relative site-container text-center space-y-6 max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-black leading-tight">
              CRM Immobiliare con AI Integrata
            </h1>
            <p className="text-lg sm:text-xl text-foreground-muted">
              Un gestionale immobiliare che non richiede inserimento manuale. I lead arrivano gi&agrave; completi di valutazione, dati immobile e storico conversazione AI.
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

        {/* Funzionalità */}
        <section className="site-container py-16 sm:py-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Tutto quello che serve per gestire i tuoi lead
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {funzionalita.map((f) => (
              <div key={f.title} className="rounded-2xl border border-border bg-surface p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                </div>
                <p className="text-foreground-muted text-sm">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Differenza */}
        <section className="w-full bg-surface border-y border-border py-16 sm:py-20">
          <div className="site-container max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold text-center">
              Perch&eacute; non &egrave; un CRM qualsiasi
            </h2>
            <div className="space-y-4 text-lg text-foreground-muted">
              <p>
                A differenza dei <strong className="text-foreground">CRM immobiliari tradizionali</strong> dove devi inserire
                manualmente ogni contatto, con DomusReport i lead vengono creati automaticamente dal chatbot AI. Quando un
                visitatore del tuo sito completa una conversazione, il lead appare nella dashboard con tutti i dati gi&agrave; compilati.
              </p>
              <p>
                Ogni lead include: nome, cognome, email, telefono, indirizzo dell&apos;immobile, tipologia, superficie, piano,
                stato conservativo, classe energetica, valutazione OMI calcolata e lo storico completo della conversazione con l&apos;AI.
                Nessun altro <strong className="text-foreground">software per agenzie immobiliari</strong> offre questo livello di dettaglio automatico.
              </p>
              <p>
                Il sistema traccia anche le <strong className="text-foreground">analytics delle performance</strong>: quante persone
                vedono il widget, quante iniziano una conversazione, quante completano la valutazione e quante lasciano i propri contatti.
                Cos&igrave; sai esattamente dove ottimizzare il tuo funnel di acquisizione.
              </p>
            </div>
          </div>
        </section>

        {/* Cosa include */}
        <section className="site-container py-16 sm:py-20 max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl font-bold text-center">Cosa include il CRM</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Dashboard con KPI in tempo reale",
              "Lista lead con filtri e ricerca",
              "Dettaglio lead con tutti i dati immobile",
              "Gestione stato (nuovo → convertito)",
              "Storico conversazione AI completo",
              "Report PDF brandizzato con 1 click",
              "Export CSV/Excel",
              "Notifiche email per nuovi lead",
              "Analytics: impression, click, conversioni",
              "Multi-widget per siti diversi",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-foreground-muted text-sm">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Approfondisci */}
        <section className="site-container py-16 sm:py-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Approfondisci sul blog</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Link href="/blog/strumenti-digitali-agenzie-immobiliari" className="rounded-xl border border-border bg-surface p-4 space-y-2 hover:border-primary/30 transition-colors">
              <div className="text-xs font-semibold uppercase tracking-wide text-primary">Strumenti</div>
              <h3 className="text-sm font-semibold leading-snug">Strumenti Digitali per Agenzie Immobiliari</h3>
              <span className="text-xs text-primary flex items-center gap-1">Leggi <ArrowRight className="h-3 w-3" /></span>
            </Link>
            <Link href="/blog/qualificare-lead-immobiliari" className="rounded-xl border border-border bg-surface p-4 space-y-2 hover:border-primary/30 transition-colors">
              <div className="text-xs font-semibold uppercase tracking-wide text-primary">Lead Management</div>
              <h3 className="text-sm font-semibold leading-snug">Come Qualificare i Lead Immobiliari</h3>
              <span className="text-xs text-primary flex items-center gap-1">Leggi <ArrowRight className="h-3 w-3" /></span>
            </Link>
            <Link href="/blog/marketing-digitale-agenzie-immobiliari" className="rounded-xl border border-border bg-surface p-4 space-y-2 hover:border-primary/30 transition-colors">
              <div className="text-xs font-semibold uppercase tracking-wide text-primary">Marketing</div>
              <h3 className="text-sm font-semibold leading-snug">Marketing Digitale per Agenzie Immobiliari</h3>
              <span className="text-xs text-primary flex items-center gap-1">Leggi <ArrowRight className="h-3 w-3" /></span>
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="site-container pb-16 sm:pb-20">
          <div className="rounded-3xl bg-gradient-to-r from-primary to-primary-hover p-10 text-center text-primary-foreground space-y-6">
            <h2 className="text-3xl font-bold">Inizia a gestire i lead con l&apos;AI</h2>
            <p className="text-lg text-primary-foreground/80">
              CRM incluso in tutti i piani. Piano Free con 5 valutazioni/mese.
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
