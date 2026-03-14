import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/animations/fade-in"
import { SlideUp } from "@/components/animations/slide-up"
import { StaggerContainer, StaggerItem } from "@/components/animations/stagger-container"
import { ArrowRight, CheckCircle, EyeOff, FileText, Paintbrush, Shield } from "lucide-react"

export const metadata = {
  title: "Software Stima Immobiliare White Label",
  description: "Software di valutazione immobiliare white label per agenzie. Branding completo, CSS personalizzabile, report PDF brandizzati, nessun riferimento a DomusReport. Piano Premium con personalizzazione totale.",
  keywords: [
    "software stima immobiliare white label",
    "valutazione immobiliare personalizzabile",
    "software valutazione white label",
    "white label immobiliare",
    "software stima casa personalizzato",
    "piattaforma valutazione immobiliare brandizzata",
    "chatbot immobiliare white label",
  ],
  alternates: {
    canonical: "https://domusreport.com/soluzioni/software-stima-immobiliare-white-label",
  },
  openGraph: {
    title: "Software Stima Immobiliare White Label | DomusReport",
    description: "Personalizza il software di valutazione con il tuo brand. Logo, colori, CSS, report PDF brandizzati. Nessun riferimento a DomusReport.",
    url: "https://domusreport.com/soluzioni/software-stima-immobiliare-white-label",
    type: "website",
  },
}

export default function WhiteLabelPage() {
  const features = [
    {
      icon: Paintbrush,
      title: "Branding Completo",
      description: "Logo della tua agenzia, colori aziendali, font e stile grafico personalizzati. Il widget e il chatbot appaiono come un prodotto interamente tuo, coerente con l'identità visiva della tua agenzia.",
    },
    {
      icon: Shield,
      title: "CSS Personalizzabile",
      description: "Con il piano Premium hai accesso completo al CSS custom. Modifica ogni aspetto grafico: dimensioni, spaziature, bordi, ombre, animazioni. Adatta il widget perfettamente al design del tuo sito.",
    },
    {
      icon: FileText,
      title: "Report PDF Brandizzato",
      description: "I report di valutazione che i tuoi clienti ricevono portano il logo e i colori della tua agenzia. Un documento professionale che rafforza il tuo brand ad ogni interazione.",
    },
    {
      icon: EyeOff,
      title: "Nessun Riferimento a DomusReport",
      description: "Con il piano Premium, ogni traccia di DomusReport viene rimossa. I tuoi clienti vedono solo il tuo brand, il tuo logo e i tuoi colori. Il software lavora dietro le quinte, invisibile.",
    },
  ]

  const personalizzazioni = [
    "Logo e favicon della tua agenzia",
    "Palette colori primari e secondari",
    "Font e tipografia personalizzati",
    "CSS custom illimitato (Premium)",
    "Report PDF con header e footer brandizzati",
    "Email di notifica con il tuo brand",
    "Dominio personalizzato (Enterprise)",
    "Rimozione completa del marchio DomusReport",
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="h-20" />
      <BreadcrumbSchema items={[
        { name: "Home", url: "https://domusreport.com" },
        { name: "Soluzioni", url: "https://domusreport.com/soluzioni" },
        { name: "Software White Label", url: "https://domusreport.com/soluzioni/software-stima-immobiliare-white-label" },
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
                Software di Stima Immobiliare White Label
              </h1>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-lg sm:text-xl text-foreground-muted mx-auto text-balance">
                Offri valutazioni immobiliari professionali con il tuo brand. Logo, colori, CSS e report PDF completamente personalizzati. I tuoi clienti vedono solo la tua agenzia.
              </p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8 hover:scale-105 transition-transform">
                    Inizia con il white label
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
              Personalizzazione senza compromessi
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

        {/* Cosa puoi personalizzare */}
        <section className="w-full bg-surface/30 border-y border-border/50 py-16 sm:py-24">
          <div className="site-container max-w-3xl mx-auto space-y-10">
            <SlideUp className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-center text-balance">
                Cosa puoi personalizzare
              </h2>
              <p className="text-center text-foreground-muted text-lg max-w-2xl mx-auto text-balance">
                Il piano Premium sblocca la personalizzazione completa. Ecco tutte le opzioni disponibili per rendere il software interamente tuo.
              </p>
            </SlideUp>
            <StaggerContainer className="grid gap-4 sm:grid-cols-2 bg-background/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
              {personalizzazioni.map((p) => (
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
              Perch&eacute; il white label per la tua agenzia
            </h2>
          </SlideUp>
          <SlideUp delay={0.1} className="space-y-6 text-lg text-foreground-muted leading-relaxed">
            <p>
              Un <strong className="text-foreground">software di stima immobiliare white label</strong> permette alla tua agenzia di offrire un servizio di valutazione professionale senza sviluppare la tecnologia internamente. Mantieni il controllo completo sul brand e sull&apos;esperienza utente.
            </p>
            <p>
              Con DomusReport, la <Link href="/funzionalita/valutazione-immobiliare-online" className="text-primary hover:underline">valutazione immobiliare</Link> e il <Link href="/funzionalita/chatbot-immobiliare" className="text-primary hover:underline">chatbot AI</Link> diventano parte integrante del tuo sito. I visitatori interagiscono con un assistente che porta il tuo logo e i tuoi colori, senza mai vedere il marchio DomusReport.
            </p>
            <p>
              I <Link href="/blog/report-valutazione-immobiliare-professionale" className="text-primary hover:underline">report PDF</Link> che vengono generati sono documenti professionali con header e footer della tua agenzia. Puoi inviarli ai clienti come materiale di presentazione, rafforzando la tua immagine di agenzia innovativa e tecnologicamente avanzata.
            </p>
            <p>
              Il white label &egrave; ideale per <strong className="text-foreground">agenzie strutturate, reti immobiliari e franchising</strong> che vogliono offrire un servizio uniforme su tutti i punti vendita, mantenendo l&apos;identit&agrave; del brand di rete. Ogni filiale pu&ograve; avere il proprio widget personalizzato, con i lead che confluiscono in un CRM centralizzato.
            </p>
          </SlideUp>
        </section>

        {/* CTA */}
        <section className="site-container pb-16 sm:pb-24">
          <SlideUp>
            <div className="rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary-hover p-8 sm:p-12 text-center text-primary-foreground space-y-8 relative overflow-hidden shadow-2xl shadow-primary/20">
              <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                <Paintbrush className="w-32 h-32" />
              </div>
              <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold text-balance">Il tuo brand, la nostra tecnologia</h2>
                <p className="text-lg sm:text-xl text-primary-foreground/90 text-balance">
                  Piano Premium con personalizzazione completa. Prova gratis per scoprire tutte le opzioni di branding.
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
