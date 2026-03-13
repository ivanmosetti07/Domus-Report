import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Target, MessageSquare, Zap, ArrowRight, XCircle, CheckCircle, BarChart3 } from "lucide-react"

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
      <div className="h-16" />

      <main className="w-full">
        {/* Hero */}
        <section className="relative w-full overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-16 sm:py-20 lg:py-28">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-30" />
          </div>
          <div className="relative site-container text-center space-y-6 max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-black leading-tight">
              Lead Generation Immobiliare con Intelligenza Artificiale
            </h1>
            <p className="text-lg sm:text-xl text-foreground-muted">
              Sostituisci i form statici con un chatbot AI che qualifica i visitatori, raccoglie dati completi sull&apos;immobile e genera contatti pronti per la chiamata.
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

        {/* Metriche */}
        <section className="w-full bg-surface border-y border-border py-8">
          <div className="site-container grid grid-cols-2 md:grid-cols-4 gap-6">
            {metriche.map((m) => (
              <div key={m.label} className="text-center space-y-1">
                <div className="text-2xl sm:text-3xl font-black text-primary">{m.valore}</div>
                <div className="text-xs sm:text-sm font-medium text-foreground-muted">{m.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Problema vs Soluzione */}
        <section className="site-container py-16 sm:py-20">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 p-6 space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <XCircle className="h-6 w-6 text-red-500" />
                Il problema dei form tradizionali
              </h2>
              <ul className="space-y-3">
                {problemiForm.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-foreground-muted">
                    <XCircle className="h-4 w-4 text-red-400 mt-1 flex-shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20 p-6 space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                La soluzione AI di DomusReport
              </h2>
              <ul className="space-y-3">
                {vantaggiAI.map((v, i) => (
                  <li key={i} className="flex items-start gap-2 text-foreground-muted">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <span>{v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Come funziona */}
        <section className="w-full bg-surface border-y border-border py-16 sm:py-20">
          <div className="site-container max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold text-center">
              Come genera lead qualificati
            </h2>
            <div className="space-y-6">
              {[
                { step: "1", icon: MessageSquare, title: "Il visitatore inizia una conversazione", desc: "Il chatbot si attiva sul tuo sito e invita il visitatore a scoprire il valore del suo immobile. Nessun form, solo una conversazione naturale." },
                { step: "2", icon: Target, title: "L'AI qualifica durante il dialogo", desc: "Raccoglie indirizzo, tipologia, superficie, piano, stato conservativo, classe energetica e motivazione alla vendita. Filtra curiosi da venditori seri." },
                { step: "3", icon: Zap, title: "Valutazione OMI in tempo reale", desc: "In 3 secondi calcola la stima basata su dati OMI ufficiali e la mostra al visitatore. Il valore percepito spinge il contatto a lasciare i propri dati." },
                { step: "4", icon: BarChart3, title: "Lead completo nella tua dashboard", desc: "Ricevi il contatto con tutti i dati dell'immobile, la valutazione calcolata, lo storico della conversazione e i recapiti verificati. Pronto per la chiamata." },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold flex-shrink-0">
                    {s.step}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">{s.title}</h3>
                    <p className="text-foreground-muted">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contenuto SEO */}
        <section className="site-container py-16 sm:py-20 max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl font-bold text-center">
            Lead generation immobiliare: perch&eacute; l&apos;AI cambia le regole
          </h2>
          <div className="space-y-4 text-lg text-foreground-muted">
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
        </section>

        {/* CTA */}
        <section className="site-container pb-16 sm:pb-20">
          <div className="rounded-3xl bg-gradient-to-r from-primary to-primary-hover p-10 text-center text-primary-foreground space-y-6">
            <h2 className="text-3xl font-bold">Inizia a generare lead qualificati</h2>
            <p className="text-lg text-primary-foreground/80">
              Il chatbot lavora 24/7 sul tuo sito. Prova gratis, nessuna carta di credito.
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
