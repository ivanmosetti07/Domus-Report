import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Building2, Users, Target, ArrowRight } from "lucide-react"

export const metadata = {
  title: "Chi Siamo - DomusReport",
  description: "Scopri la storia e la missione di DomusReport",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="marketing-shell marketing-prose">
        <header className="stack-md text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-foreground-muted">
            La tecnologia al servizio delle agenzie immobiliari
          </p>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Chi siamo
          </h1>
          <p className="text-lg text-foreground-muted">
            Cresciamo insieme alle agenzie che vogliono automatizzare la generazione di lead
          </p>
        </header>

        <section className="stack-md rounded-2xl border border-border bg-surface p-8">
          <div className="cluster gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Target className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold">La nostra missione</h2>
          </div>
          <div className="stack-md text-lg text-foreground-muted">
            <p>
              DomusReport nasce dall'esperienza di <strong>Mainstream Agency</strong>, agenzia digitale specializzata nello sviluppo di soluzioni software innovative per il settore immobiliare.
            </p>
            <p>
              La nostra missione è semplice: aiutare le agenzie immobiliari a generare più lead qualificati attraverso l'intelligenza artificiale e l'automazione, senza richiedere competenze tecniche.
            </p>
            <p>
              Con DomusReport, ogni agenzia può offrire ai visitatori del proprio sito un servizio di valutazione immobiliare immediato e accurato, basato sui dati ufficiali dell'Osservatorio del Mercato Immobiliare (OMI).
            </p>
          </div>
        </section>

        <section className="stack-md">
          <div className="cluster gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success">
              <Users className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold">I nostri valori</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                title: "Semplicità",
                copy:
                  "Crediamo che la tecnologia debba essere accessibile. Per questo DomusReport si integra in pochi minuti, senza bisogno di sviluppatori.",
              },
              {
                title: "Precisione",
                copy:
                  "Le nostre valutazioni sono basate su dati OMI certificati e algoritmi che tengono conto di oltre 15 variabili immobiliari.",
              },
              {
                title: "Trasparenza",
                copy: "Niente costi nascosti. Il piano gratuito è davvero gratuito e puoi scalare quando vuoi senza vincoli.",
              },
              {
                title: "Supporto",
                copy: "Siamo al tuo fianco. Il nostro team risponde rapidamente e ti aiuta a ottenere il massimo dalla piattaforma.",
              },
            ].map((value) => (
              <div key={value.title} className="rounded-2xl border border-border bg-surface-2 p-6">
                <h3 className="text-lg font-semibold text-foreground">{value.title}</h3>
                <p className="mt-2 text-sm text-foreground-muted">{value.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="stack-md rounded-2xl border border-border bg-surface p-8">
          <div className="cluster gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Building2 className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold">Mainstream Agency</h2>
          </div>
          <div className="stack-md text-lg text-foreground-muted">
            <p>
              DomusReport è sviluppato da Mainstream Agency, agenzia digitale con sede a Milano specializzata in progetti SaaS per il real estate.
            </p>
            <p>
              Il nostro team è composto da sviluppatori, designer e professionisti del settore immobiliare che lavorano ogni giorno per migliorare la piattaforma e offrire nuove funzionalità.
            </p>
          </div>
        </section>

        <section className="stack-md rounded-3xl bg-gradient-to-r from-primary to-primary-hover p-10 text-center text-primary-foreground">
          <h2 className="text-3xl font-bold">Pronto a far crescere la tua agenzia?</h2>
          <p className="text-lg text-primary-foreground/80">
            Unisciti alle agenzie che stanno già generando lead con DomusReport
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="min-w-[200px] text-primary">
                Inizia gratis
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
