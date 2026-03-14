import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ArrowRight, Bot, Target, Zap, Building2, Code, LineChart, Users } from "lucide-react"
import { FadeIn } from "@/components/animations/fade-in"
import { SlideUp } from "@/components/animations/slide-up"
import { StaggerContainer, StaggerItem } from "@/components/animations/stagger-container"
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema"
import { Button } from "@/components/ui/button"

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
    icon: Building2,
    title: "Widget Valutazione Immobili",
    description: "Installa un widget di valutazione immobiliare sul tuo sito web. I visitatori ottengono una stima OMI istantanea, tu ricevi lead qualificati con tutti i dati dell'immobile.",
    href: "/soluzioni/widget-valutazione-immobili-sito-web",
    cta: "Scopri il widget",
  },
  {
    icon: Bot,
    title: "Chatbot Immobiliare: Sito vs WhatsApp",
    description: "Confronta le soluzioni chatbot per agenzie immobiliari. Scopri vantaggi, costi e differenze tra chatbot sul sito web e automazioni WhatsApp Business.",
    href: "/soluzioni/chatbot-immobiliare-whatsapp-sito",
    cta: "Confronta le opzioni",
  },
  {
    icon: Code,
    title: "Software Stima White Label",
    description: "Personalizza completamente il software di valutazione con il tuo brand: logo, colori, CSS custom e report PDF brandizzati. Nessun riferimento a DomusReport.",
    href: "/soluzioni/software-stima-immobiliare-white-label",
    cta: "Scopri il white label",
  },
  {
    icon: LineChart,
    title: "Migliori Software Valutazione",
    description: "Guida alla scelta del miglior software di valutazione immobiliare. Criteri di confronto: dati ufficiali, AI, integrazioni, white label e modello di prezzo.",
    href: "/soluzioni/migliori-software-valutazione-immobiliare",
    cta: "Leggi il confronto",
  },
  {
    icon: Target,
    title: "Lead Generation Immobiliare",
    description: "Strategie e strumenti per generare lead qualificati per la tua agenzia immobiliare, trasformando i visitatori del sito in potenziali clienti.",
    href: "/soluzioni/lead-generation-immobiliare",
    cta: "Scopri come",
  },
  {
    icon: Zap,
    title: "Automazione Marketing Immobiliare",
    description: "Automatizza le tue campagne di marketing, dalla gestione dei lead all'invio di newsletter, per ottimizzare il tempo e massimizzare i risultati.",
    href: "/soluzioni/automazione-marketing-immobiliare",
    cta: "Inizia ad automatizzare",
  },
  {
    icon: Users,
    title: "CRM Immobiliare Integrato",
    description: "Un CRM pensato per le agenzie immobiliari, integrato con i nostri strumenti per una gestione fluida dei contatti e delle trattative.",
    href: "/soluzioni/crm-immobiliare-integrato",
    cta: "Scopri il CRM",
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
            <FadeIn>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-balance">
                Soluzioni per ogni esigenza nel Real Estate
              </h1>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-lg sm:text-xl text-foreground-muted text-balance mx-auto">
                Che tu voglia generare pi&ugrave; contatti, qualificare i tuoi visitatori o offrire un servizio di valutazione sul tuo sito, abbiamo lo strumento giusto per te.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Griglia Soluzioni */}
        <section className="site-container py-16 sm:py-20">
          <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {soluzioni.map((soluzione) => (
              <StaggerItem key={soluzione.title}>
                <Link href={soluzione.href} className="group block h-full">
                  <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 h-full transition-all duration-300 hover:border-primary/30 hover:bg-surface-hover hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
                    <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                      <soluzione.icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">{soluzione.title}</h2>
                        <ArrowRight className="h-5 w-5 text-foreground-muted opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-primary" />
                      </div>
                      <p className="text-foreground-muted leading-relaxed">
                        {soluzione.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* Contenuto SEO */}
        <section className="w-full bg-surface border-y border-border py-16 sm:py-20">
          <div className="site-container max-w-4xl mx-auto space-y-12">
            <SlideUp>
              <h2 className="text-3xl sm:text-4xl font-bold text-center text-balance mb-8">
                L&apos;Ecosistema per l&apos;Agenzia del Futuro
              </h2>
            </SlideUp>
            
            <div className="grid gap-8 md:grid-cols-2">
              <SlideUp delay={0.1}>
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold">Tecnologia che lavora per te</h3>
                  <p className="text-foreground-muted leading-relaxed">
                    Il mercato immobiliare sta cambiando. I clienti si aspettano risposte immediate e strumenti digitali all&apos;avanguardia. Con DomusReport, trasformi la tua agenzia tradizionale in un&apos;agenzia proptech: attiri pi&ugrave; venditori, qualifichi meglio i contatti e automatizzi le attività ripetitive.
                  </p>
                </div>
              </SlideUp>
              
              <SlideUp delay={0.2}>
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold">Dalla valutazione all&apos;acquisizione</h3>
                  <p className="text-foreground-muted leading-relaxed">
                    I nostri strumenti sono progettati per affiancarti in ogni fase: offri report puntuali gratuiti per attirare l&apos;attenzione, usa il chatbot per raccogliere i dati del potenziale cliente in modo naturale, e gestisci il lead qualificato nel nostro CRM ottimizzato per il real estate.
                  </p>
                </div>
              </SlideUp>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="site-container pb-16 sm:pb-20">
          <SlideUp>
            <div className="rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary-hover p-8 sm:p-12 text-center text-primary-foreground space-y-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
              <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                <h2 className="text-3xl sm:text-4xl font-bold text-balance leading-tight">
                  Pronto a trasformare il tuo sito web in una macchina da generare lead immobiliari?
                </h2>
                <p className="text-lg text-primary-foreground/90 font-medium text-balance">
                  Attiva subito un Chatbot AI. Potrai provarlo gratis per testarlo da subito. Setupe in 2 minuti, assistenza in italiano.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <Link href="/register">
                    <button className="flex h-12 items-center justify-center rounded-full bg-white px-8 text-base font-semibold text-primary shadow-lg transition-transform hover:scale-105">
                      Inizia la prova gratuita
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </button>
                  </Link>
                  <Link href="/contatti">
                    <button className="flex h-12 items-center justify-center rounded-full border border-white/30 bg-white/10 px-8 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white/20">
                      Parla con noi
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </SlideUp>
        </section>
      </main>

      <Footer />
    </div>
  )
}
