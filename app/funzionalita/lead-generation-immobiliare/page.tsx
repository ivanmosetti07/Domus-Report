import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/animations/fade-in"
import { SlideUp } from "@/components/animations/slide-up"
import { StaggerContainer, StaggerItem } from "@/components/animations/stagger-container"
import { Target, MessageSquare, Zap, ArrowRight, XCircle, CheckCircle, BarChart3 } from "lucide-react"
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema"

export const metadata = {
  title: "Lead Generation Immobiliare con AI",
  description: "Genera lead qualificati per la tua agenzia immobiliare con il chatbot AI. Qualificazione automatica, valutazione OMI in tempo reale, tasso di conversione 3x superiore ai form tradizionali.",
  keywords: [
    "lead generation immobiliare",
    "lead generation agenzie immobiliari",
    "generare contatti immobiliare",
    "acquisire clienti venditori immobili",
    "contatti qualificati immobiliare",
    "lead immobiliari qualificati",
    "generare lead agenzia immobiliare",
  ],
  alternates: {
    canonical: "https://domusreport.com/funzionalita/lead-generation-immobiliare",
  },
  openGraph: {
    title: "Lead Generation Immobiliare con AI | DomusReport",
    description: "Genera lead qualificati con il chatbot AI. Qualificazione automatica e valutazione OMI in tempo reale.",
    url: "https://domusreport.com/funzionalita/lead-generation-immobiliare",
  },
}

export default function LeadGenerationPage() {
  const problemiForm = [
    "Raccolgono solo nome, email e telefono — zero contesto sull'immobile",
    "Non filtrano curiosi da venditori seri",
    "Tasso di conversione medio sotto il 2%",
    "Il 70% dei contatti non risponde al primo richiamo",
  ]

  const vantaggiAI = [
    "Il chatbot dialoga, qualifica e raccoglie 15+ dati sull'immobile",
    "Filtra automaticamente curiosi da venditori con intenzione reale",
    "Tasso di conversione 3x superiore ai form tradizionali",
    "Ogni lead arriva con valutazione, storico conversazione e contatti verificati",
  ]

  const metriche = [
    { valore: "1.200+", label: "Lead generati" },
    { valore: "3x", label: "Conversione vs form" },
    { valore: "98%", label: "Precisione valutazioni" },
    { valore: "24/7", label: "Attivo sempre" },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="h-20" />
      <BreadcrumbSchema items={[
        { name: "Home", url: "https://domusreport.com" },
        { name: "Funzionalità", url: "https://domusreport.com/funzionalita" },
        { name: "Lead Generation Immobiliare", url: "https://domusreport.com/funzionalita/lead-generation-immobiliare" },
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
                Lead Generation Immobiliare con Intelligenza Artificiale
              </h1>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-lg sm:text-xl text-foreground-muted mx-auto text-balance">
                Sostituisci i form statici con un chatbot AI che qualifica i visitatori, raccoglie dati completi sull&apos;immobile e genera contatti pronti per la chiamata.
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

        {/* Metriche */}
        <section className="w-full bg-surface/30 border-y border-border/50 py-12 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-primary/5 via-transparent to-primary/5 blur-3xl -z-10" />
          <StaggerContainer className="site-container grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10">
            {metriche.map((m) => (
              <StaggerItem key={m.label} className="text-center space-y-2 p-6 rounded-2xl bg-surface/50 backdrop-blur-sm border border-border/30 hover:border-primary/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-br from-primary to-primary-hover bg-clip-text text-transparent">{m.valore}</div>
                <div className="text-sm font-medium text-foreground-muted">{m.label}</div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* Problema vs Soluzione */}
        <section className="site-container py-16 sm:py-24">
          <StaggerContainer className="grid gap-8 md:grid-cols-2">
            <StaggerItem className="rounded-3xl border border-red-200/50 dark:border-red-900/50 bg-gradient-to-b from-red-50/50 to-transparent dark:from-red-950/20 p-8 sm:p-10 space-y-6 hover:shadow-xl hover:shadow-red-500/5 transition-all duration-300">
              <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 text-balance">
                <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/40">
                  <XCircle className="h-6 w-6 text-red-500" />
                </div>
                Il problema dei form tradizionali
              </h2>
              <ul className="space-y-4">
                {problemiForm.map((p, i) => (
                  <li key={i} className="flex items-start gap-3 text-foreground-muted text-lg">
                    <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="leading-snug">{p}</span>
                  </li>
                ))}
              </ul>
            </StaggerItem>

            <StaggerItem className="rounded-3xl border border-green-200/50 dark:border-green-900/50 bg-gradient-to-b from-green-50/50 to-transparent dark:from-green-950/20 p-8 sm:p-10 space-y-6 hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Target className="w-32 h-32 text-green-500" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 text-balance relative">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/40">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                La soluzione AI di DomusReport
              </h2>
              <ul className="space-y-4 relative">
                {vantaggiAI.map((v, i) => (
                  <li key={i} className="flex items-start gap-3 text-foreground-muted text-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="leading-snug">{v}</span>
                  </li>
                ))}
              </ul>
            </StaggerItem>
          </StaggerContainer>
        </section>

        {/* Come funziona */}
        <section className="w-full bg-surface/30 border-y border-border/50 py-16 sm:py-24 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10" />
          <div className="site-container max-w-3xl mx-auto space-y-12">
            <SlideUp>
              <h2 className="text-3xl sm:text-4xl font-bold text-center text-balance">
                Come genera lead qualificati
              </h2>
            </SlideUp>
            <StaggerContainer className="space-y-6">
              {[
                { step: "1", icon: MessageSquare, title: "Il visitatore inizia una conversazione", desc: "Il chatbot si attiva sul tuo sito e invita il visitatore a scoprire il valore del suo immobile. Nessun form, solo una conversazione naturale." },
                { step: "2", icon: Target, title: "L'AI qualifica durante il dialogo", desc: "Raccoglie indirizzo, tipologia, superficie, piano, stato conservativo, classe energetica e motivazione alla vendita. Filtra curiosi da venditori seri." },
                { step: "3", icon: Zap, title: "Valutazione OMI in tempo reale", desc: "In 3 secondi calcola la stima basata su dati OMI ufficiali e la mostra al visitatore. Il valore percepito spinge il contatto a lasciare i propri dati." },
                { step: "4", icon: BarChart3, title: "Lead completo nella tua dashboard", desc: "Ricevi il contatto con tutti i dati dell'immobile, la valutazione calcolata, lo storico della conversazione e i recapiti verificati. Pronto per la chiamata." },
              ].map((s) => (
                <StaggerItem key={s.step} className="flex items-start gap-6 p-6 sm:p-8 rounded-3xl bg-surface/50 backdrop-blur-sm border border-border/50 hover:border-primary/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20">
                    {s.step}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">{s.title}</h3>
                    <p className="text-foreground-muted leading-relaxed text-base">{s.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Contenuto SEO */}
        <section className="site-container py-16 sm:py-24 max-w-3xl mx-auto space-y-10">
          <SlideUp>
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-balance">
              Lead generation immobiliare: perch&eacute; l&apos;AI cambia le regole
            </h2>
          </SlideUp>
          <SlideUp delay={0.1}>
            <div className="space-y-6 text-lg text-foreground-muted leading-relaxed">
              <p>
                La <strong className="text-foreground">lead generation per agenzie immobiliari</strong> sta attraversando una trasformazione profonda.
                I form statici, che per anni sono stati lo standard per raccogliere contatti sui siti web, oggi mostrano tassi di conversione sempre
                pi&ugrave; bassi. I visitatori sono stanchi di compilare campi generici senza ricevere nulla in cambio.
              </p>
              <p>
                DomusReport ribalta questo paradigma: invece di chiedere dati, <strong className="text-foreground">offre valore immediato</strong>.
                Il chatbot AI conversa con il visitatore, raccoglie informazioni dettagliate sull&apos;immobile e restituisce una valutazione basata
                su dati OMI ufficiali. Il visitatore ottiene una stima professionale gratuita, l&apos;agenzia ottiene un lead completo e qualificato.
              </p>
              <p>
                Questo approccio funziona perch&eacute; trasforma il classico &quot;dammi i tuoi dati&quot; in uno &quot;scambio di valore&quot;:
                il potenziale cliente riceve un servizio utile, e nel processo fornisce spontaneamente tutte le informazioni necessarie per un follow-up
                efficace. Il risultato? Lead che rispondono al telefono perch&eacute; hanno gi&agrave; interagito con il tuo brand.
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
              <Link href="/blog/guida-lead-generation-immobiliare" className="block h-full rounded-2xl border border-border/50 bg-surface/50 backdrop-blur-sm p-6 space-y-3 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300">
                <div className="text-xs font-semibold uppercase tracking-wide text-primary">Guida Completa</div>
                <h3 className="text-base font-semibold leading-snug">Guida Definitiva alla Lead Generation Immobiliare nel 2026</h3>
                <span className="text-sm font-medium text-primary flex items-center gap-1 pt-2">Leggi articolo <ArrowRight className="h-4 w-4" /></span>
              </Link>
            </StaggerItem>
            <StaggerItem>
              <Link href="/blog/come-generare-lead-immobiliari" className="block h-full rounded-2xl border border-border/50 bg-surface/50 backdrop-blur-sm p-6 space-y-3 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300">
                <div className="text-xs font-semibold uppercase tracking-wide text-primary">Lead Generation</div>
                <h3 className="text-base font-semibold leading-snug">Come Generare Lead Immobiliari nel 2026</h3>
                <span className="text-sm font-medium text-primary flex items-center gap-1 pt-2">Leggi articolo <ArrowRight className="h-4 w-4" /></span>
              </Link>
            </StaggerItem>
            <StaggerItem>
              <Link href="/blog/qualificare-lead-immobiliari" className="block h-full rounded-2xl border border-border/50 bg-surface/50 backdrop-blur-sm p-6 space-y-3 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300">
                <div className="text-xs font-semibold uppercase tracking-wide text-primary">Lead Management</div>
                <h3 className="text-base font-semibold leading-snug">Come Qualificare i Lead Immobiliari</h3>
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
                <Target className="w-32 h-32" />
              </div>
              <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold text-balance">Inizia a generare lead qualificati</h2>
                <p className="text-lg sm:text-xl text-primary-foreground/90 text-balance">
                  Il chatbot lavora 24/7 sul tuo sito. Prova gratis, nessuna carta di credito.
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
