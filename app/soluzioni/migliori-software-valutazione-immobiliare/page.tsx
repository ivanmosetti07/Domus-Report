import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, Database, Layers, MessageSquare, Settings, X } from "lucide-react"

export const metadata = {
  title: "Migliori Software Valutazione Immobiliare 2026",
  description: "Guida ai migliori software di valutazione immobiliare. Confronto su dati ufficiali, AI, integrazione CRM, white label e prezzi. Come scegliere lo strumento giusto per la tua agenzia.",
  keywords: [
    "migliori software valutazione immobiliare",
    "software stima immobiliare confronto",
    "tools valutazione immobile",
    "software valutazione casa migliore",
    "strumenti stima immobiliare online",
    "piattaforme valutazione immobiliare",
    "confronto software immobiliare",
  ],
  alternates: {
    canonical: "https://domusreport.com/soluzioni/migliori-software-valutazione-immobiliare",
  },
  openGraph: {
    title: "Migliori Software Valutazione Immobiliare 2026 | DomusReport",
    description: "Guida completa alla scelta del software di valutazione immobiliare. Criteri di confronto e analisi dettagliata.",
    url: "https://domusreport.com/soluzioni/migliori-software-valutazione-immobiliare",
    type: "website",
  },
}

export default function MiglioriSoftwarePage() {
  const criteri = [
    {
      icon: Database,
      title: "Fonti Dati Ufficiali",
      description: "Un buon software deve basarsi su dati ufficiali e verificabili, come le quotazioni OMI dell'Agenzia delle Entrate. Diffida di strumenti che non dichiarano le proprie fonti o usano solo stime algoritmiche senza dati reali.",
    },
    {
      icon: MessageSquare,
      title: "Intelligenza Artificiale Conversazionale",
      description: "L'AI conversazionale migliora l'esperienza utente rispetto ai form statici. Un chatbot che guida il visitatore raccoglie dati più precisi, aumenta il tasso di completamento e genera lead di qualità superiore.",
    },
    {
      icon: Layers,
      title: "Integrazione e White Label",
      description: "Il software deve integrarsi facilmente nel tuo sito (WordPress, Webflow, HTML) e offrire opzioni white label per mantenere la coerenza del brand. La personalizzazione grafica non è un extra: è una necessità.",
    },
    {
      icon: Settings,
      title: "CRM e Gestione Lead",
      description: "Generare lead senza un sistema per gestirli è inutile. Cerca un software con CRM integrato, notifiche in tempo reale, storico delle valutazioni e possibilità di export dei dati.",
    },
  ]

  const tabellaConfronto = [
    { criterio: "Dati OMI ufficiali", domus: true, generico: false },
    { criterio: "AI conversazionale", domus: true, generico: false },
    { criterio: "CRM integrato", domus: true, generico: false },
    { criterio: "White Label completo", domus: true, generico: false },
    { criterio: "Setup in meno di 5 minuti", domus: true, generico: false },
    { criterio: "Report PDF professionale", domus: true, generico: true },
    { criterio: "Copertura 7.889 comuni", domus: true, generico: false },
    { criterio: "Piano gratuito disponibile", domus: true, generico: true },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="h-20" />
      <BreadcrumbSchema items={[
        { name: "Home", url: "https://domusreport.com" },
        { name: "Soluzioni", url: "https://domusreport.com/soluzioni" },
        { name: "Migliori Software Valutazione", url: "https://domusreport.com/soluzioni/migliori-software-valutazione-immobiliare" },
      ]} />

      <main className="w-full">
        {/* Hero */}
        <section className="relative w-full overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-16 sm:py-20 lg:py-28">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-30" />
          </div>
          <div className="relative site-container text-center space-y-6 max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-black leading-tight">
              Migliori Software di Valutazione Immobiliare
            </h1>
            <p className="text-lg sm:text-xl text-foreground-muted">
              Come scegliere il software di stima immobiliare giusto per la tua agenzia. Guida ai criteri fondamentali: dati ufficiali, AI, personalizzazione, integrazioni e modello di prezzo.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg">
                  Prova DomusReport gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/#demo">
                <Button size="lg" variant="outline">Vedi la demo</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Criteri 2x2 */}
        <section className="site-container py-16 sm:py-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            I 4 criteri fondamentali per la scelta
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            {criteri.map((c) => (
              <div key={c.title} className="rounded-2xl border border-border bg-surface p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{c.title}</h3>
                </div>
                <p className="text-foreground-muted">{c.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tabella confronto */}
        <section className="w-full bg-surface border-y border-border py-16 sm:py-20">
          <div className="site-container max-w-4xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold text-center">
              Tabella comparativa delle funzionalit&agrave;
            </h2>
            <p className="text-center text-foreground-muted text-lg">
              Confronto tra le funzionalit&agrave; tipiche di un software completo come DomusReport e le soluzioni generiche presenti sul mercato.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Funzionalit&agrave;</th>
                    <th className="text-center py-3 px-4 font-semibold text-primary">DomusReport</th>
                    <th className="text-center py-3 px-4 font-semibold">Software generico</th>
                  </tr>
                </thead>
                <tbody>
                  {tabellaConfronto.map((row) => (
                    <tr key={row.criterio} className="border-b border-border/50">
                      <td className="py-3 px-4 font-medium">{row.criterio}</td>
                      <td className="py-3 px-4 text-center">
                        {row.domus
                          ? <CheckCircle className="h-5 w-5 text-primary inline-block" />
                          : <X className="h-5 w-5 text-foreground-muted inline-block" />
                        }
                      </td>
                      <td className="py-3 px-4 text-center">
                        {row.generico
                          ? <CheckCircle className="h-5 w-5 text-foreground-muted inline-block" />
                          : <X className="h-5 w-5 text-foreground-muted inline-block" />
                        }
                      </td>
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
            Cosa cercare in un software di valutazione
          </h2>
          <div className="space-y-4 text-lg text-foreground-muted">
            <p>
              Il mercato dei <strong className="text-foreground">software di valutazione immobiliare</strong> &egrave; cresciuto significativamente negli ultimi anni. Tuttavia, non tutte le soluzioni offrono lo stesso livello di accuratezza, personalizzazione e funzionalit&agrave;. Ecco cosa valutare nella scelta.
            </p>
            <p>
              <strong className="text-foreground">Fonti dati verificabili.</strong> La qualit&agrave; di una valutazione dipende dai dati su cui si basa. I <Link href="/blog/dati-omi-guida-completa" className="text-primary hover:underline">dati OMI dell&apos;Agenzia delle Entrate</Link> rappresentano lo standard di riferimento in Italia, con quotazioni semestrali per zona, tipologia e stato conservativo. Un software che non utilizza dati ufficiali produce stime meno affidabili.
            </p>
            <p>
              <strong className="text-foreground">Modello di prezzo sostenibile.</strong> Alcuni software applicano un costo per valutazione, altri un canone mensile fisso. Per un&apos;agenzia che vuole usare il software come strumento di lead generation sul proprio sito, il modello a canone fisso &egrave; generalmente pi&ugrave; conveniente e prevedibile.
            </p>
            <p>
              <strong className="text-foreground">Integrazione nel workflow.</strong> Il miglior software di valutazione &egrave; quello che si integra con i tuoi strumenti esistenti. Cerca soluzioni con <Link href="/funzionalita/valutazione-immobiliare-online" className="text-primary hover:underline">valutazione automatica</Link>, CRM integrato e compatibilit&agrave; con le piattaforme web pi&ugrave; diffuse.
            </p>
            <p>
              DomusReport combina tutti questi elementi: dati OMI ufficiali su 7.889 comuni, AI conversazionale, CRM integrato, white label completo e setup in 2 minuti. Per scoprire altri <Link href="/blog/strumenti-digitali-agenzie-immobiliari" className="text-primary hover:underline">strumenti digitali per agenzie immobiliari</Link>, consulta la nostra guida dedicata.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="site-container pb-16 sm:pb-20">
          <div className="rounded-3xl bg-gradient-to-r from-primary to-primary-hover p-10 text-center text-primary-foreground space-y-6">
            <h2 className="text-3xl font-bold">Scegli il software giusto per la tua agenzia</h2>
            <p className="text-lg text-primary-foreground/80">
              Prova DomusReport gratis e confrontalo con qualsiasi altra soluzione. 5 valutazioni gratuite al mese, nessun vincolo.
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
