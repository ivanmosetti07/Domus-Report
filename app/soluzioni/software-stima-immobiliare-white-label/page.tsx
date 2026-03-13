import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema"
import { Button } from "@/components/ui/button"
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
            <h1 className="text-4xl sm:text-5xl font-black leading-tight">
              Software di Stima Immobiliare White Label
            </h1>
            <p className="text-lg sm:text-xl text-foreground-muted">
              Offri valutazioni immobiliari professionali con il tuo brand. Logo, colori, CSS e report PDF completamente personalizzati. I tuoi clienti vedono solo la tua agenzia.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg">
                  Inizia con il white label
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/#demo">
                <Button size="lg" variant="outline">Vedi la demo</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features 2x2 */}
        <section className="site-container py-16 sm:py-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Personalizzazione senza compromessi
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-border bg-surface p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                </div>
                <p className="text-foreground-muted">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Cosa puoi personalizzare */}
        <section className="w-full bg-surface border-y border-border py-16 sm:py-20">
          <div className="site-container max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold text-center">
              Cosa puoi personalizzare
            </h2>
            <p className="text-center text-foreground-muted text-lg">
              Il piano Premium sblocca la personalizzazione completa. Ecco tutte le opzioni disponibili per rendere il software interamente tuo.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {personalizzazioni.map((p) => (
                <div key={p} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-foreground-muted">{p}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contenuto SEO */}
        <section className="site-container py-16 sm:py-20 max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl font-bold text-center">
            Perch&eacute; il white label per la tua agenzia
          </h2>
          <div className="space-y-4 text-lg text-foreground-muted">
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
          </div>
        </section>

        {/* CTA */}
        <section className="site-container pb-16 sm:pb-20">
          <div className="rounded-3xl bg-gradient-to-r from-primary to-primary-hover p-10 text-center text-primary-foreground space-y-6">
            <h2 className="text-3xl font-bold">Il tuo brand, la nostra tecnologia</h2>
            <p className="text-lg text-primary-foreground/80">
              Piano Premium con personalizzazione completa. Prova gratis per scoprire tutte le opzioni di branding.
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
