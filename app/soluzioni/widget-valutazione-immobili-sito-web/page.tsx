import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/animations/fade-in"
import { SlideUp } from "@/components/animations/slide-up"
import { StaggerContainer, StaggerItem } from "@/components/animations/stagger-container"
import { ArrowRight, CheckCircle, Code, Database, Palette, Users } from "lucide-react"

export const metadata = {
  title: "Widget Valutazione Immobili per Sito Web",
  description: "Integra un widget di valutazione immobiliare nel tuo sito web. Dati OMI ufficiali, installazione in 2 minuti, compatibile con WordPress, Webflow e HTML. Genera lead qualificati automaticamente.",
  keywords: [
    "widget valutazione immobiliare",
    "widget stima casa sito web",
    "plugin valutazione immobile",
    "widget immobiliare WordPress",
    "widget stima immobile sito",
    "widget valutazione casa online",
    "plugin stima immobiliare sito web",
  ],
  alternates: {
    canonical: "https://domusreport.com/soluzioni/widget-valutazione-immobili-sito-web",
  },
  openGraph: {
    title: "Widget Valutazione Immobili per Sito Web | DomusReport",
    description: "Installa un widget di valutazione OMI sul tuo sito. Compatibile WordPress, Webflow, HTML. Lead qualificati automatici.",
    url: "https://domusreport.com/soluzioni/widget-valutazione-immobili-sito-web",
    type: "website",
  },
}

export default function WidgetValutazionePage() {
  const features = [
    {
      icon: Code,
      title: "Installazione in 2 Minuti",
      description: "Copia una singola riga di codice e incollala nel tuo sito. Funziona su WordPress, Webflow, Wix, Squarespace e qualsiasi pagina HTML. Nessuna competenza tecnica richiesta.",
    },
    {
      icon: Database,
      title: "Dati OMI Ufficiali",
      description: "Ogni valutazione si basa su oltre 133.000 quotazioni dell'Osservatorio del Mercato Immobiliare dell'Agenzia delle Entrate, coprendo 7.889 comuni italiani.",
    },
    {
      icon: Palette,
      title: "Personalizzazione Completa",
      description: "Scegli tra 12 temi predefiniti oppure personalizza colori, logo, posizione e animazioni. Con il piano Premium puoi applicare CSS custom per un risultato completamente su misura.",
    },
    {
      icon: Users,
      title: "Lead Generation Automatica",
      description: "Ogni visitatore che utilizza il widget diventa un lead qualificato con nome, email, telefono e tutti i dati dell'immobile. Ricevi notifiche in tempo reale e gestisci tutto dal CRM integrato.",
    },
  ]

  const piattaforme = [
    "WordPress (plugin o snippet HTML)",
    "Webflow (embed code nel designer)",
    "Wix (HTML iframe o Velo)",
    "Squarespace (code injection)",
    "HTML statico (script tag)",
    "React, Next.js, Vue, Angular",
    "Qualsiasi CMS o page builder",
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="h-20" />
      <BreadcrumbSchema items={[
        { name: "Home", url: "https://domusreport.com" },
        { name: "Soluzioni", url: "https://domusreport.com/soluzioni" },
        { name: "Widget Valutazione Immobili", url: "https://domusreport.com/soluzioni/widget-valutazione-immobili-sito-web" },
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
                Widget Valutazione Immobili per il Tuo Sito Web
              </h1>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-lg sm:text-xl text-foreground-muted mx-auto text-balance">
                Trasforma il tuo sito in una macchina per acquisire incarichi. I visitatori ottengono una stima immobiliare gratuita basata su dati OMI, tu ricevi lead con tutti i dettagli dell&apos;immobile.
              </p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8 hover:scale-105 transition-transform">
                    Installa il widget gratis
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

        {/* Features 2x2 */}
        <section className="site-container py-16 sm:py-24">
          <SlideUp>
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-balance">
              Tutto quello che serve per il tuo sito
            </h2>
          </SlideUp>
          <StaggerContainer className="grid gap-8 md:grid-cols-2">
            {features.map((f) => (
              <StaggerItem key={f.title} className="rounded-2xl border border-border/50 bg-surface/50 backdrop-blur-sm p-8 space-y-4 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold">{f.title}</h3>
                </div>
                <p className="text-foreground-muted leading-relaxed">{f.description}</p>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* Piattaforme compatibili */}
        <section className="w-full bg-surface/30 border-y border-border/50 py-16 sm:py-24">
          <div className="site-container max-w-3xl mx-auto space-y-10">
            <SlideUp className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-center text-balance">
                Compatibile con qualsiasi piattaforma
              </h2>
              <p className="text-center text-foreground-muted text-lg max-w-2xl mx-auto text-balance">
                Il widget DomusReport funziona su ogni sito web. Basta un tag script per integrarlo, senza modificare il tuo codice esistente.
              </p>
            </SlideUp>
            <StaggerContainer className="grid gap-4 sm:grid-cols-2 bg-background/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
              {piattaforme.map((p) => (
                <StaggerItem key={p} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <span className="text-foreground-muted font-medium">{p}</span>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Contenuto SEO */}
        <section className="site-container py-16 sm:py-24 max-w-3xl mx-auto space-y-8 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl -z-10" />
          <SlideUp>
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-balance pb-4">
              Come funziona il widget di valutazione
            </h2>
          </SlideUp>
          <SlideUp delay={0.1} className="space-y-6 text-lg text-foreground-muted leading-relaxed">
            <p>
              Un <strong className="text-foreground">widget di valutazione immobiliare</strong> &egrave; un componente interattivo che si integra nel sito della tua agenzia. Invece di un semplice form di contatto, offri ai visitatori un servizio concreto: la possibilit&agrave; di ottenere una stima del valore del proprio immobile in tempo reale.
            </p>
            <p>
              Il widget DomusReport utilizza un&apos;interfaccia conversazionale basata su <strong className="text-foreground">intelligenza artificiale</strong>. Il visitatore interagisce con un chatbot che raccoglie indirizzo, tipologia, superficie, piano, stato conservativo e classe energetica. La <Link href="/funzionalita/valutazione-immobiliare-online" className="text-primary hover:underline">valutazione</Link> viene calcolata in tempo reale sui <Link href="/blog/dati-omi-guida-completa" className="text-primary hover:underline">dati OMI ufficiali</Link>.
            </p>
            <p>
              Il vantaggio per la tua agenzia &egrave; duplice: il visitatore ottiene valore immediato (e quindi &egrave; pi&ugrave; propenso a lasciare i propri dati), e tu ricevi un lead gi&agrave; qualificato con tutte le informazioni sull&apos;immobile che vuole vendere o valutare.
            </p>
            <p>
              L&apos;installazione richiede meno di 2 minuti. Per istruzioni dettagliate, consulta le guide per{" "}
              <Link href="/docs/wordpress" className="text-primary hover:underline">WordPress</Link>,{" "}
              <Link href="/docs/webflow" className="text-primary hover:underline">Webflow</Link> e{" "}
              <Link href="/docs/html" className="text-primary hover:underline">HTML</Link>.
            </p>
          </SlideUp>
        </section>

        {/* CTA */}
        <section className="site-container pb-16 sm:pb-24">
          <SlideUp>
            <div className="rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary-hover p-8 sm:p-12 text-center text-primary-foreground space-y-8 relative overflow-hidden shadow-2xl shadow-primary/20">
              <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                <Code className="w-32 h-32" />
              </div>
              <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold text-balance">Installa il widget sul tuo sito oggi</h2>
                <p className="text-lg sm:text-xl text-primary-foreground/90 text-balance">
                  Setup in 2 minuti. Piano gratuito con 5 valutazioni al mese. Nessuna carta di credito.
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
