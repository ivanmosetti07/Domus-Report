import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, Clock, DollarSign, MessageSquare, UserCheck } from "lucide-react"
import { FadeIn } from "@/components/animations/fade-in"
import { SlideUp } from "@/components/animations/slide-up"
import { StaggerContainer, StaggerItem } from "@/components/animations/stagger-container"

export const metadata = {
  title: "Chatbot Immobiliare: Sito Web vs WhatsApp",
  description: "Confronto tra chatbot immobiliare su sito web e WhatsApp Business. Scopri costi, vantaggi, esempi d'uso e perché un chatbot AI sul sito converte di più per le agenzie immobiliari.",
  keywords: [
    "chatbot immobiliare whatsapp",
    "chatbot sito agenzia immobiliare",
    "costi chatbot immobiliare",
    "chatbot whatsapp agenzia immobiliare",
    "chatbot AI immobiliare confronto",
    "bot immobiliare sito web",
    "automazione whatsapp immobiliare",
  ],
  alternates: {
    canonical: "https://domusreport.com/soluzioni/chatbot-immobiliare-whatsapp-sito",
  },
  openGraph: {
    title: "Chatbot Immobiliare: Sito Web vs WhatsApp | DomusReport",
    description: "Confronto completo tra chatbot su sito web e WhatsApp per agenzie immobiliari. Costi, vantaggi e quale scegliere.",
    url: "https://domusreport.com/soluzioni/chatbot-immobiliare-whatsapp-sito",
    type: "website",
  },
}

export default function ChatbotWhatsAppPage() {
  const features = [
    {
      icon: MessageSquare,
      title: "Conversazione Naturale 24/7",
      description: "Il chatbot sul sito risponde ai visitatori in qualsiasi momento, anche fuori orario. Conversazione in italiano naturale, non risposte preconfezionate. I visitatori interagiscono senza uscire dal tuo sito.",
    },
    {
      icon: UserCheck,
      title: "Qualificazione Automatica Lead",
      description: "Durante la chat, l'AI raccoglie indirizzo, tipologia, superficie, piano, stato e motivazione alla vendita. Ogni lead arriva nel CRM già completo di tutti i dati necessari per il primo contatto.",
    },
    {
      icon: CheckCircle,
      title: "Valutazione OMI Integrata",
      description: "A differenza dei chatbot WhatsApp generici, il chatbot sul sito calcola la valutazione immobiliare in tempo reale con dati OMI ufficiali. Il visitatore ottiene valore immediato, tu ottieni un lead motivato.",
    },
    {
      icon: DollarSign,
      title: "Costi Contenuti vs WhatsApp Business",
      description: "WhatsApp Business API parte da 0,05-0,15 EUR per messaggio. Il chatbot sul sito ha un costo fisso mensile, indipendente dal volume di conversazioni. Più lead generi, più risparmi.",
    },
  ]

  const confronto = [
    { criterio: "Costo per messaggio", sito: "Incluso nel piano", whatsapp: "0,05-0,15 EUR/msg" },
    { criterio: "Disponibilità", sito: "24/7 automatica", whatsapp: "24/7 con setup API" },
    { criterio: "Valutazione immobiliare", sito: "Integrata con dati OMI", whatsapp: "Non disponibile" },
    { criterio: "Lead qualificati", sito: "Automatica durante chat", whatsapp: "Manuale o limitata" },
    { criterio: "Personalizzazione grafica", sito: "Completa (colori, logo, CSS)", whatsapp: "Limitata al profilo" },
    { criterio: "Setup tecnico", sito: "1 riga di codice", whatsapp: "API + numero verificato" },
    { criterio: "CRM integrato", sito: "Incluso", whatsapp: "Richiede integrazione esterna" },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="h-20" />
      <BreadcrumbSchema items={[
        { name: "Home", url: "https://domusreport.com" },
        { name: "Soluzioni", url: "https://domusreport.com/soluzioni" },
        { name: "Chatbot: Sito vs WhatsApp", url: "https://domusreport.com/soluzioni/chatbot-immobiliare-whatsapp-sito" },
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
                Chatbot Immobiliare: Sito Web vs WhatsApp
              </h1>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-lg sm:text-xl text-foreground-muted text-balance mx-auto">
                Quale chatbot converte di pi&ugrave; per la tua agenzia? Confronto completo tra chatbot AI sul sito web e automazioni WhatsApp Business: costi, funzionalit&agrave; e risultati concreti.
              </p>
            </FadeIn>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg">
                  Prova il chatbot gratis
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
          <SlideUp>
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-balance">
              Vantaggi del chatbot sul sito web
            </h2>
          </SlideUp>
          <StaggerContainer className="grid gap-8 md:grid-cols-2">
            {features.map((f) => (
              <StaggerItem key={f.title}>
                <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 space-y-4 h-full transition-all duration-300 hover:border-primary/30 hover:bg-surface-hover hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 group">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                      <f.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold">{f.title}</h3>
                  </div>
                  <p className="text-foreground-muted leading-relaxed">{f.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* Tabella confronto */}
        <section className="w-full bg-surface border-y border-border py-16 sm:py-20">
          <div className="site-container max-w-4xl mx-auto space-y-12">
            <SlideUp>
              <h2 className="text-3xl sm:text-4xl font-bold text-center text-balance">
                Confronto diretto: Sito Web vs WhatsApp
              </h2>
            </SlideUp>
            <SlideUp delay={0.1}>
              <p className="text-center text-foreground-muted text-lg sm:text-xl text-balance max-w-2xl mx-auto">
                Ecco come si confrontano le due soluzioni sui criteri pi&ugrave; importanti per un&apos;agenzia immobiliare.
              </p>
            </SlideUp>
            <SlideUp delay={0.2} className="overflow-x-auto rounded-2xl border border-border bg-background/50 backdrop-blur-sm">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface/50">
                    <th className="text-left py-4 px-6 font-semibold">Criterio</th>
                    <th className="text-left py-4 px-6 font-semibold text-primary">Chatbot Sito Web</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground-muted">WhatsApp Business</th>
                  </tr>
                </thead>
                <tbody>
                  {confronto.map((row) => (
                    <tr key={row.criterio} className="border-b border-border/50 transition-colors hover:bg-surface">
                      <td className="py-4 px-6 font-medium">{row.criterio}</td>
                      <td className="py-4 px-6 text-foreground-muted font-medium bg-primary/5">{row.sito}</td>
                      <td className="py-4 px-6 text-foreground-muted">{row.whatsapp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </SlideUp>
          </div>
        </section>

        {/* Contenuto SEO */}
        <section className="site-container py-16 sm:py-20 max-w-3xl mx-auto space-y-12">
          <SlideUp>
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-balance">
              Quando scegliere il chatbot sul sito
            </h2>
          </SlideUp>
          <SlideUp delay={0.1}>
            <div className="space-y-6 text-lg text-foreground-muted leading-relaxed">
              <p>
                Un <strong className="text-foreground">chatbot immobiliare su WhatsApp</strong> pu&ograve; essere utile per gestire richieste di clienti gi&agrave; acquisiti, ma presenta limiti importanti nella fase di acquisizione. WhatsApp Business API ha costi variabili per messaggio, richiede un numero telefonico verificato e non supporta nativamente la valutazione immobiliare.
              </p>
              <p>
                Il <Link href="/funzionalita/chatbot-immobiliare" className="text-primary hover:underline font-medium">chatbot sul sito web</Link>, al contrario, intercetta i visitatori nel momento in cui stanno cercando informazioni sulla vendita del proprio immobile. La conversazione AI raccoglie i dati, calcola la valutazione e genera un <Link href="/funzionalita/lead-generation-immobiliare" className="text-primary hover:underline font-medium">lead qualificato</Link> in modo automatico.
              </p>
              <p>
                L&apos;approccio conversazionale funziona perch&eacute; offre <strong className="text-foreground">valore immediato al visitatore</strong>. Invece di compilare un form freddo, il proprietario interagisce con un assistente che gli fornisce una stima del valore del suo immobile. Questo aumenta il tasso di conversione e la qualit&agrave; dei lead ricevuti.
              </p>
              <p>
                Per approfondire come l&apos;intelligenza artificiale sta trasformando il settore immobiliare, leggi il nostro articolo su{" "}
                <Link href="/blog/intelligenza-artificiale-immobiliare" className="text-primary hover:underline font-medium">AI e immobiliare</Link>.
              </p>
            </div>
          </SlideUp>
        </section>

        {/* CTA */}
        <section className="site-container pb-16 sm:pb-20">
          <SlideUp>
            <div className="rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary-hover p-8 sm:p-12 text-center text-primary-foreground space-y-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
              <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                <h2 className="text-3xl sm:text-4xl font-bold text-balance leading-tight">
                  Prova il chatbot sul tuo sito
                </h2>
                <p className="text-lg text-primary-foreground/90 font-medium text-balance">
                  Costo fisso, conversazioni illimitate, valutazione OMI integrata. Setup in 2 minuti.
                </p>
                <div className="flex justify-center pt-4">
                  <Link href="/register">
                    <button className="flex h-12 items-center justify-center rounded-full bg-white px-8 text-base font-semibold text-primary shadow-lg transition-transform hover:scale-105">
                      Inizia la prova gratuita
                      <ArrowRight className="ml-2 h-5 w-5" />
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
