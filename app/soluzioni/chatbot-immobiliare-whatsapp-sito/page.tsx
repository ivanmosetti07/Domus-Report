import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, Clock, DollarSign, MessageSquare, UserCheck, Target } from "lucide-react"
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
        <section className="relative w-full overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-16 sm:py-24 lg:py-32">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] opacity-40" />
            <div className="absolute bottom-[0%] -left-[10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] opacity-30" />
          </div>
          <div className="relative site-container text-center space-y-8 max-w-4xl mx-auto flex flex-col items-center">
            <FadeIn>
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-2 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                Confronto Soluzioni 2024
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight text-balance">
                Chatbot Immobiliare: <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Sito Web vs WhatsApp</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-lg sm:text-xl text-foreground-muted text-balance mx-auto max-w-2xl leading-relaxed">
                Quale chatbot converte di pi&ugrave; per la tua agenzia? Confronto completo tra chatbot AI sul sito web e automazioni WhatsApp Business: costi, funzionalit&agrave; e risultati concreti.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8 hover:scale-105 transition-transform shadow-lg shadow-primary/20">
                    Prova il chatbot gratis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/#demo" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-12 px-8 hover:scale-105 transition-transform bg-background/50 backdrop-blur-sm border-border/50">
                    Vedi la demo
                  </Button>
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Features 2x2 */}
        <section className="site-container py-16 sm:py-24 relative">
          <SlideUp>
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-14 text-balance">
              Vantaggi del chatbot sul sito web
            </h2>
          </SlideUp>
          <StaggerContainer className="grid gap-6 md:grid-cols-2">
            {features.map((f, i) => (
              <StaggerItem key={f.title} className="w-full">
                <div className="rounded-3xl border border-border/50 bg-surface/50 backdrop-blur-sm p-8 sm:p-10 space-y-6 h-full transition-all duration-300 hover:border-primary/20 hover:bg-surface/80 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none transform translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 text-primary">
                    <f.icon className="w-32 h-32" />
                  </div>
                  <div className="flex flex-col items-start gap-5 relative z-10">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground shadow-sm group-hover:shadow-md group-hover:scale-110 group-hover:-rotate-3">
                      <f.icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-2xl font-bold">{f.title}</h3>
                  </div>
                  <p className="text-foreground-muted leading-relaxed text-lg relative z-10">{f.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* Tabella confronto */}
        <section className="w-full bg-surface/30 border-y border-border/50 py-16 sm:py-24 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
          <div className="site-container max-w-5xl mx-auto space-y-12">
            <SlideUp>
              <h2 className="text-3xl sm:text-4xl font-bold text-center text-balance">
                Confronto diretto: Sito Web vs WhatsApp
              </h2>
            </SlideUp>
            <SlideUp delay={0.1}>
              <p className="text-center text-foreground-muted text-lg sm:text-xl text-balance max-w-3xl mx-auto leading-relaxed">
                Ecco come si confrontano le due soluzioni sui criteri pi&ugrave; importanti per un&apos;agenzia immobiliare.
              </p>
            </SlideUp>
            <SlideUp delay={0.2} className="overflow-x-auto rounded-3xl border border-border/50 bg-background/50 backdrop-blur-md shadow-2xl shadow-primary/5">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border/50 bg-surface/50">
                    <th className="text-left py-6 px-8 font-bold text-lg w-1/3">Criterio</th>
                    <th className="text-left py-6 px-8 font-bold text-lg text-primary bg-primary/5 w-1/3">Chatbot Sito Web</th>
                    <th className="text-left py-6 px-8 font-bold text-lg text-foreground-muted w-1/3">WhatsApp Business</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {confronto.map((row) => (
                    <tr key={row.criterio} className="transition-colors hover:bg-surface/50 group">
                      <td className="py-5 px-8 font-semibold text-foreground/90">{row.criterio}</td>
                      <td className="py-5 px-8 font-medium bg-primary/5 text-primary/90 flex items-center gap-2">
                         <CheckCircle className="h-4 w-4 text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                         {row.sito}
                      </td>
                      <td className="py-5 px-8 text-foreground-muted">{row.whatsapp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </SlideUp>
          </div>
        </section>

        {/* Contenuto SEO */}
        <section className="site-container py-16 sm:py-24 max-w-3xl mx-auto space-y-12">
          <SlideUp>
            <div className="inline-flex items-center justify-center w-full mb-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Target className="h-6 w-6" />
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-balance">
              Quando scegliere il chatbot sul sito
            </h2>
          </SlideUp>
          <SlideUp delay={0.1}>
            <div className="space-y-6 text-lg text-foreground-muted leading-relaxed p-8 rounded-3xl bg-surface/30 border border-border/50">
              <p>
                Un <strong className="text-foreground">chatbot immobiliare su WhatsApp</strong> pu&ograve; essere utile per gestire richieste di clienti gi&agrave; acquisiti, ma presenta limiti importanti nella fase di acquisizione. WhatsApp Business API ha costi variabili per messaggio, richiede un numero telefonico verificato e non supporta nativamente la valutazione immobiliare.
              </p>
              <p>
                Il <Link href="/funzionalita/chatbot-immobiliare" className="text-primary hover:underline font-medium">chatbot sul sito web</Link>, al contrario, intercetta i visitatori nel momento in cui stanno cercando informazioni sulla vendita del proprio immobile. La conversazione AI raccoglie i dati, calcola la valutazione e genera un <Link href="/funzionalita/lead-generation-immobiliare" className="text-primary hover:underline font-medium">lead qualificato</Link> in modo automatico.
              </p>
              <p>
                L&apos;approccio conversazionale funziona perch&eacute; offre <strong className="text-foreground">valore immediato al visitatore</strong>. Invece di compilare un form freddo, il proprietario interagisce con un assistente che gli fornisce una stima del valore del suo immobile. Questo aumenta il tasso di conversione e la qualit&agrave; dei lead ricevuti.
              </p>
              <div className="pt-4 border-t border-border/50 mt-4">
                <p className="text-base text-foreground-muted/80">
                  Per approfondire come l&apos;intelligenza artificiale sta trasformando il settore immobiliare, leggi il nostro articolo su{" "}
                  <Link href="/blog/intelligenza-artificiale-immobiliare" className="text-primary hover:underline font-semibold flex inline-flex items-center gap-1">AI e immobiliare<ArrowRight className="h-3 w-3" /></Link>.
                </p>
              </div>
            </div>
          </SlideUp>
        </section>

        {/* CTA */}
        <section className="site-container pb-16 sm:pb-24">
          <SlideUp>
            <div className="rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary-hover p-8 sm:p-14 text-center text-primary-foreground space-y-8 relative overflow-hidden shadow-2xl shadow-primary/20">
              <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none transform rotate-12">
                <MessageSquare className="w-40 h-40" />
              </div>
              <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance leading-tight">
                  Prova il chatbot sul tuo sito
                </h2>
                <p className="text-lg sm:text-xl text-primary-foreground/90 font-medium text-balance mx-auto max-w-2xl">
                  Costo fisso, conversazioni illimitate, valutazione OMI integrata. Setup in 2 minuti.
                </p>
                <div className="flex justify-center pt-6">
                  <Link href="/register">
                    <button className="flex h-14 items-center justify-center rounded-full bg-white px-8 text-base font-bold text-primary shadow-xl transition-all hover:scale-105 hover:bg-white/90 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary">
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
