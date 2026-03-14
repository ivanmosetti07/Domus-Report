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
        <section className="relative w-full overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-16 sm:py-24 lg:py-32">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] opacity-50" />
            <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px] opacity-50" />
          </div>
          <div className="relative site-container text-center space-y-8 max-w-4xl mx-auto">
            <FadeIn>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-balance">
                Soluzioni per ogni esigenza nel Real Estate
              </h1>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-lg sm:text-xl text-foreground-muted text-balance mx-auto max-w-2xl leading-relaxed">
                Che tu voglia generare pi&ugrave; contatti, qualificare i tuoi visitatori o offrire un servizio di valutazione sul tuo sito, abbiamo lo strumento giusto per te.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Griglia Soluzioni */}
        <section className="site-container py-16 sm:py-24">
          <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {soluzioni.map((soluzione) => (
              <StaggerItem key={soluzione.title}>
                <Link href={soluzione.href} className="group block h-full">
                  <div className="rounded-2xl border border-border/50 bg-surface/50 backdrop-blur-sm p-6 sm:p-8 h-full transition-all duration-300 hover:border-primary/30 hover:bg-surface/80 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
                    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground shadow-sm">
                      <soluzione.icon className="h-7 w-7" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold leading-tight">{soluzione.title}</h2>
                        <ArrowRight className="h-5 w-5 text-foreground-muted opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-primary" />
                      </div>
                      <p className="text-foreground-muted leading-relaxed text-base">
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
        <section className="w-full bg-surface/30 border-y border-border/50 py-16 sm:py-24 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl -z-10" />
          <div className="site-container max-w-4xl mx-auto space-y-16">
            <SlideUp>
              <h2 className="text-3xl sm:text-4xl font-bold text-center text-balance mb-4">
                L&apos;Ecosistema per l&apos;Agenzia del Futuro
              </h2>
              <div className="h-1 w-20 bg-primary mx-auto rounded-full opacity-50"></div>
            </SlideUp>
            
            <div className="grid gap-10 md:grid-cols-2 relative z-10">
              <SlideUp delay={0.1}>
                <div className="space-y-5 p-8 rounded-3xl bg-background/50 border border-border/50 backdrop-blur-sm shadow-xl shadow-primary/5 hover:border-primary/20 transition-colors h-full">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                     <Target className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold">Tecnologia che lavora per te</h3>
                  <p className="text-foreground-muted leading-relaxed text-lg">
                    Il mercato immobiliare sta cambiando. I clienti si aspettano risposte immediate e strumenti digitali all&apos;avanguardia. Con DomusReport, trasformi la tua agenzia tradizionale in un&apos;agenzia proptech: attiri pi&ugrave; venditori, qualifichi meglio i contatti e automatizzi le attività ripetitive.
                  </p>
                </div>
              </SlideUp>
              
              <SlideUp delay={0.2}>
                <div className="space-y-5 p-8 rounded-3xl bg-background/50 border border-border/50 backdrop-blur-sm shadow-xl shadow-primary/5 hover:border-primary/20 transition-colors h-full">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                     <Users className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold">Dalla valutazione all&apos;acquisizione</h3>
                  <p className="text-foreground-muted leading-relaxed text-lg">
                    I nostri strumenti sono progettati per affiancarti in ogni fase: offri report puntuali gratuiti per attirare l&apos;attenzione, usa il chatbot per raccogliere i dati del potenziale cliente in modo naturale, e gestisci il lead qualificato nel nostro CRM ottimizzato per il real estate.
                  </p>
                </div>
              </SlideUp>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="site-container py-16 sm:py-24">
          <SlideUp>
            <div className="rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary-hover p-8 sm:p-14 text-center text-primary-foreground space-y-8 relative overflow-hidden shadow-2xl shadow-primary/20">
              <div className="absolute top-0 left-0 p-12 opacity-10 pointer-events-none">
                <Building2 className="w-32 h-32" />
              </div>
              <div className="absolute bottom-0 right-0 p-12 opacity-10 pointer-events-none transform rotate-12">
                <Target className="w-40 h-40" />
              </div>
              <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance leading-tight">
                  Pronto a trasformare il tuo sito web in una macchina da generare lead immobiliari?
                </h2>
                <p className="text-lg sm:text-xl text-primary-foreground/90 font-medium text-balance mx-auto max-w-2xl">
                  Attiva subito un Chatbot AI. Potrai provarlo gratis per testarlo da subito. Setup in 2 minuti, assistenza in italiano.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                  <Link href="/register">
                    <button className="flex h-14 items-center justify-center rounded-full bg-white px-8 text-base font-bold text-primary shadow-xl transition-all hover:scale-105 hover:bg-white/90 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary">
                      Inizia la prova gratuita
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </button>
                  </Link>
                  <Link href="/contatti">
                    <button className="flex h-14 items-center justify-center rounded-full border border-white/30 bg-white/10 px-8 text-base font-semibold text-white backdrop-blur transition-all hover:bg-white/20 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary">
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
