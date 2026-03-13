import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { ArrowRight, ArrowLeft } from "lucide-react"
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema"
import { ArticoliCorrelati } from "@/components/blog/articoli-correlati"

export const metadata = {
  title: "Come Qualificare i Lead Immobiliari: Guida per Agenti",
  description: "Tecniche e strumenti per qualificare i contatti della tua agenzia immobiliare. Distingui curiosi da venditori seri con AI, scoring e domande strategiche.",
  keywords: [
    "qualificare lead immobiliari",
    "qualificazione contatti immobiliare",
    "lead scoring immobiliare",
    "come filtrare lead immobiliari",
    "lead qualificati agenzia immobiliare",
    "contatti qualificati immobiliare",
  ],
  alternates: {
    canonical: "https://domusreport.com/blog/qualificare-lead-immobiliari",
  },
  openGraph: {
    title: "Come Qualificare i Lead Immobiliari | DomusReport",
    description: "Tecniche per distinguere curiosi da venditori seri: AI, scoring e domande strategiche.",
    url: "https://domusreport.com/blog/qualificare-lead-immobiliari",
    type: "article",
  },
}

export default function ArticoloQualificazione() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="h-20" />
      <BreadcrumbSchema items={[
        { name: "Home", url: "https://domusreport.com" },
        { name: "Blog", url: "https://domusreport.com/blog" },
        { name: "Come Qualificare i Lead Immobiliari", url: "https://domusreport.com/blog/qualificare-lead-immobiliari" },
      ]} />

      <main className="w-full">
        <article className="site-container py-12 sm:py-16 max-w-3xl mx-auto">
          <div className="mb-8">
            <Link href="/blog" className="text-sm text-primary hover:underline flex items-center gap-1 mb-4">
              <ArrowLeft className="h-3 w-3" /> Blog
            </Link>
            <div className="text-sm text-primary font-semibold uppercase tracking-wide mb-2">Lead Management</div>
            <h1 className="text-3xl sm:text-4xl font-black leading-tight mb-4">
              Come Qualificare i Lead Immobiliari: Guida Pratica per Agenti
            </h1>
            <p className="text-foreground-muted">27 Febbraio 2026 &middot; 7 min di lettura</p>
          </div>

          <div className="prose-custom space-y-6 text-lg text-foreground-muted">
            <p>
              <strong className="text-foreground">Qualificare i lead</strong> significa distinguere i contatti con reale
              intenzione di vendere (o acquistare) da quelli che stanno solo curiosando. Come illustrato nella nostra{" "}
              <Link href="/blog/guida-lead-generation-immobiliare" className="text-primary hover:underline">guida completa alla lead generation immobiliare</Link>,
              per un agente immobiliare questa distinzione &egrave; la differenza tra una giornata produttiva e una persa dietro a contatti che
              non porteranno mai a un incarico.
            </p>

            <h2 className="text-2xl font-bold text-foreground pt-4">Perch&eacute; la qualificazione &egrave; fondamentale</h2>
            <p>
              I dati del settore mostrano che solo il 15-20% dei contatti che arrivano tramite il sito web di un&apos;agenzia
              ha un&apos;intenzione concreta. Chiamare tutti indistintamente significa sprecare l&apos;80% del tempo.
              Un sistema di qualificazione efficace permette di concentrare le energie sui contatti giusti.
            </p>

            <h2 className="text-2xl font-bold text-foreground pt-4">Le 5 domande chiave per qualificare</h2>
            <p>Ogni lead dovrebbe essere valutato su questi criteri:</p>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong className="text-foreground">Ha un immobile specifico?</strong> Chi fornisce indirizzo, tipologia e metratura
                ha un&apos;intenzione concreta. Chi dice &quot;sto valutando&quot; senza dettagli &egrave; ancora lontano.
              </li>
              <li>
                <strong className="text-foreground">Qual &egrave; la tempistica?</strong> &quot;Entro 3 mesi&quot; &egrave; un lead caldo.
                &quot;Forse l&apos;anno prossimo&quot; &egrave; freddo ma da coltivare.
              </li>
              <li>
                <strong className="text-foreground">Conosce il valore del suo immobile?</strong> Chi ha gi&agrave; un&apos;idea
                del prezzo (magari grazie a una valutazione online) &egrave; pi&ugrave; avanti nel processo decisionale.
              </li>
              <li>
                <strong className="text-foreground">Ha gi&agrave; contattato altre agenzie?</strong> Se s&igrave;, &egrave; in fase
                attiva. Se no, potrebbe essere ancora esplorativo.
              </li>
              <li>
                <strong className="text-foreground">Ha lasciato dati di contatto completi?</strong> Nome, cognome, telefono e email
                indicano disponibilit&agrave; al contatto. Solo email suggerisce meno urgenza.
              </li>
            </ol>

            <h2 className="text-2xl font-bold text-foreground pt-4">Qualificazione automatica con AI</h2>
            <p>
              Un <Link href="/funzionalita/chatbot-immobiliare" className="text-primary hover:underline">chatbot AI</Link> pu&ograve;
              automatizzare la qualificazione facendo tutte queste domande durante una conversazione naturale. Il visitatore
              non percepisce di essere &quot;qualificato&quot;: sta semplicemente ottenendo una valutazione gratuita del suo immobile.
            </p>
            <p>
              Nel frattempo, il sistema raccoglie 15+ dati: indirizzo, tipologia, superficie, piano, stato conservativo,
              classe energetica, anno di costruzione, parcheggio, motivazione e tempistica. Quando il lead arriva nella
              tua <Link href="/funzionalita/crm-immobiliare" className="text-primary hover:underline">dashboard CRM</Link>, hai gi&agrave;
              tutto il contesto per decidere la priorit&agrave;.
            </p>

            <h2 className="text-2xl font-bold text-foreground pt-4">Lead scoring: dare un punteggio ai contatti</h2>
            <p>
              Il lead scoring assegna un punteggio a ogni contatto in base ai criteri di qualificazione. Un sistema semplice:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-foreground">+30 punti</strong>: ha fornito indirizzo completo dell&apos;immobile</li>
              <li><strong className="text-foreground">+20 punti</strong>: ha indicato una tempistica di vendita definita</li>
              <li><strong className="text-foreground">+20 punti</strong>: ha lasciato numero di telefono</li>
              <li><strong className="text-foreground">+15 punti</strong>: ha completato tutta la conversazione con il chatbot</li>
              <li><strong className="text-foreground">+15 punti</strong>: ha indicato una motivazione specifica (trasferimento, cambio casa, eredit&agrave;)</li>
            </ul>
            <p>
              Lead con 70+ punti vanno richiamati entro 2 ore. Lead con 40-69 punti entro 24 ore.
              Lead sotto 40 punti vanno nel flusso di nurturing via email.
            </p>

            <h2 className="text-2xl font-bold text-foreground pt-4">Il follow-up giusto per ogni tipo di lead</h2>
            <p>
              <strong className="text-foreground">Lead caldo</strong> (ha completato la valutazione, ha lasciato il telefono):
              chiama entro 2 ore. Apri con &quot;Ho visto che ha ricevuto una valutazione per [indirizzo]. Posso offrirle
              un sopralluogo gratuito per affinare la stima?&quot;
            </p>
            <p>
              <strong className="text-foreground">Lead tiepido</strong> (ha iniziato la conversazione ma non ha completato):
              invia un&apos;email con il link per completare la valutazione e un breve messaggio personalizzato.
            </p>
            <p>
              <strong className="text-foreground">Lead freddo</strong> (solo nome e email, pochi dati):
              inserisci nel flusso di email marketing con contenuti di valore (report di mercato, consigli per venditori).
            </p>
          </div>

          <ArticoliCorrelati currentSlug="qualificare-lead-immobiliari" />

          <div className="mt-12 rounded-2xl bg-surface border border-border p-8 text-center space-y-4">
            <h3 className="text-xl font-bold">Qualifica i lead automaticamente con l&apos;AI</h3>
            <p className="text-foreground-muted">Il chatbot raccoglie 15+ dati per lead. Tu chiami solo quelli giusti.</p>
            <Link href="/register">
              <Button>
                Registrati gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  )
}
