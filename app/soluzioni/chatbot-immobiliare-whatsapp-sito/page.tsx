import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, Clock, DollarSign, MessageSquare, UserCheck } from "lucide-react"

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
            <h1 className="text-4xl sm:text-5xl font-black leading-tight">
              Chatbot Immobiliare: Sito Web vs WhatsApp
            </h1>
            <p className="text-lg sm:text-xl text-foreground-muted">
              Quale chatbot converte di pi&ugrave; per la tua agenzia? Confronto completo tra chatbot AI sul sito web e automazioni WhatsApp Business: costi, funzionalit&agrave; e risultati concreti.
            </p>
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
          <h2 className="text-3xl font-bold text-center mb-12">
            Vantaggi del chatbot sul sito web
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

        {/* Tabella confronto */}
        <section className="w-full bg-surface border-y border-border py-16 sm:py-20">
          <div className="site-container max-w-4xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold text-center">
              Confronto diretto: Sito Web vs WhatsApp
            </h2>
            <p className="text-center text-foreground-muted text-lg">
              Ecco come si confrontano le due soluzioni sui criteri pi&ugrave; importanti per un&apos;agenzia immobiliare.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Criterio</th>
                    <th className="text-left py-3 px-4 font-semibold text-primary">Chatbot Sito Web</th>
                    <th className="text-left py-3 px-4 font-semibold">WhatsApp Business</th>
                  </tr>
                </thead>
                <tbody>
                  {confronto.map((row) => (
                    <tr key={row.criterio} className="border-b border-border/50">
                      <td className="py-3 px-4 font-medium">{row.criterio}</td>
                      <td className="py-3 px-4 text-foreground-muted">{row.sito}</td>
                      <td className="py-3 px-4 text-foreground-muted">{row.whatsapp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Contenuto SEO */}
        <section className="site-container py-16 sm:py-20 max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl font-bold text-center">
            Quando scegliere il chatbot sul sito
          </h2>
          <div className="space-y-4 text-lg text-foreground-muted">
            <p>
              Un <strong className="text-foreground">chatbot immobiliare su WhatsApp</strong> pu&ograve; essere utile per gestire richieste di clienti gi&agrave; acquisiti, ma presenta limiti importanti nella fase di acquisizione. WhatsApp Business API ha costi variabili per messaggio, richiede un numero telefonico verificato e non supporta nativamente la valutazione immobiliare.
            </p>
            <p>
              Il <Link href="/funzionalita/chatbot-immobiliare" className="text-primary hover:underline">chatbot sul sito web</Link>, al contrario, intercetta i visitatori nel momento in cui stanno cercando informazioni sulla vendita del proprio immobile. La conversazione AI raccoglie i dati, calcola la valutazione e genera un <Link href="/funzionalita/lead-generation-immobiliare" className="text-primary hover:underline">lead qualificato</Link> in modo automatico.
            </p>
            <p>
              L&apos;approccio conversazionale funziona perch&eacute; offre <strong className="text-foreground">valore immediato al visitatore</strong>. Invece di compilare un form freddo, il proprietario interagisce con un assistente che gli fornisce una stima del valore del suo immobile. Questo aumenta il tasso di conversione e la qualit&agrave; dei lead ricevuti.
            </p>
            <p>
              Per approfondire come l&apos;intelligenza artificiale sta trasformando il settore immobiliare, leggi il nostro articolo su{" "}
              <Link href="/blog/intelligenza-artificiale-immobiliare" className="text-primary hover:underline">AI e immobiliare</Link>.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="site-container pb-16 sm:pb-20">
          <div className="rounded-3xl bg-gradient-to-r from-primary to-primary-hover p-10 text-center text-primary-foreground space-y-6">
            <h2 className="text-3xl font-bold">Prova il chatbot sul tuo sito</h2>
            <p className="text-lg text-primary-foreground/80">
              Costo fisso, conversazioni illimitate, valutazione OMI integrata. Setup in 2 minuti.
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
