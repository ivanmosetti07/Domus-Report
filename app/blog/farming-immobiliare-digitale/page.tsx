import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ArticoliCorrelati } from "@/components/blog/articoli-correlati"
import { Button } from "@/components/ui/button"
import { ArrowRight, ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Farming Immobiliare Digitale: Guida Pratica",
  description: "Cos'è il farming immobiliare digitale e come applicarlo: scelta della zona, SEO locale, Google Business, contenuti geolocalizzati e misurazione dei risultati.",
  keywords: [
    "farming immobiliare",
    "farming digitale immobiliare",
    "zona di competenza immobiliare",
    "presidio territorio agenzia",
  ],
  alternates: {
    canonical: "https://domusreport.com/blog/farming-immobiliare-digitale",
  },
  openGraph: {
    title: "Farming Immobiliare Digitale: Guida Pratica | DomusReport",
    description: "Come diventare l'agente di riferimento nella tua zona con il farming digitale immobiliare.",
    url: "https://domusreport.com/blog/farming-immobiliare-digitale",
    type: "article",
  },
}

export default function ArticoloFarmingDigitale() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="h-20" />

      <main className="w-full">
        <article className="site-container py-12 sm:py-16 max-w-3xl mx-auto">
          <div className="mb-8">
            <Link href="/blog" className="text-sm text-primary hover:underline flex items-center gap-1 mb-4">
              <ArrowLeft className="h-3 w-3" /> Blog
            </Link>
            <div className="text-sm text-primary font-semibold uppercase tracking-wide mb-2">Acquisizione</div>
            <h1 className="text-3xl sm:text-4xl font-black leading-tight mb-4">
              Farming Immobiliare Digitale: Guida Pratica per Agenti
            </h1>
            <p className="text-foreground-muted">8 Febbraio 2026 &middot; 7 min di lettura</p>
          </div>

          <div className="prose-custom space-y-6 text-lg text-foreground-muted">
            <p>
              Il <strong className="text-foreground">farming immobiliare digitale</strong> &egrave; la versione moderna
              di una delle strategie pi&ugrave; efficaci nel settore: concentrare tutte le attivit&agrave; di marketing
              e acquisizione su una zona geografica specifica per diventarne il punto di riferimento. All&apos;interno
              di una <Link href="/blog/guida-lead-generation-immobiliare" className="text-primary hover:underline">strategia
              di lead generation immobiliare</Link>, il farming digitale trasforma la tua presenza online in un
              vantaggio territoriale concreto.
            </p>

            <h2 className="text-2xl font-bold text-foreground pt-4">Cos&apos;&egrave; il farming immobiliare</h2>
            <p>
              Il farming immobiliare tradizionale consiste nel presidiare un quartiere o una zona con attivit&agrave;
              costanti: volantini, cartoline, sponsorizzazioni locali, porta a porta. Il farming digitale applica
              lo stesso principio ai canali online: SEO locale, social media geolocalizzati, contenuti specifici
              per la zona, Google Business Profile e advertising mirato.
            </p>
            <p>
              Il vantaggio del digitale &egrave; la misurabilit&agrave;: puoi sapere esattamente quante persone
              della tua zona vedono i tuoi contenuti, quante visitano il tuo sito e quante richiedono una valutazione.
            </p>

            <h2 className="text-2xl font-bold text-foreground pt-4">Come scegliere la zona giusta</h2>
            <p>
              Non tutte le zone sono uguali. Per scegliere la tua &quot;farm&quot; ideale, valuta questi fattori:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-foreground">Volume di compravendite</strong>: una zona con almeno 50-100 transazioni annue offre opportunit&agrave; sufficienti</li>
              <li><strong className="text-foreground">Concorrenza</strong>: evita zone gi&agrave; presidiate da agenzie molto forti, a meno che tu non possa offrire un servizio nettamente superiore</li>
              <li><strong className="text-foreground">Conoscenza personale</strong>: &egrave; pi&ugrave; facile diventare il riferimento di una zona che conosci bene (meglio ancora se ci vivi)</li>
              <li><strong className="text-foreground">Prezzo medio</strong>: zone con immobili di valore medio-alto generano provvigioni pi&ugrave; interessanti</li>
              <li><strong className="text-foreground">Turnover</strong>: quartieri con famiglie giovani o anziani soli hanno un tasso di vendita pi&ugrave; alto</li>
            </ul>

            <h2 className="text-2xl font-bold text-foreground pt-4">Google Business Profile: il fondamento</h2>
            <p>
              Il primo passo del farming digitale &egrave; ottimizzare il tuo Google Business Profile per la
              zona scelta. Quando un proprietario cerca &quot;agenzia immobiliare [quartiere]&quot; o
              &quot;vendere casa [zona]&quot;, devi apparire nella mappa e nei primi risultati.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Compila ogni campo del profilo con parole chiave locali</li>
              <li>Pubblica post settimanali con aggiornamenti di mercato della zona</li>
              <li>Chiedi recensioni a ogni cliente della zona (le recensioni con il nome del quartiere pesano di pi&ugrave;)</li>
              <li>Aggiungi foto degli immobili venduti nella zona con descrizioni geolocalizzate</li>
            </ul>

            <h2 className="text-2xl font-bold text-foreground pt-4">SEO locale: contenuti per la tua zona</h2>
            <p>
              Crea contenuti sul tuo sito web specifici per la zona di farming. Pagine dedicate come
              &quot;Vendere casa a [quartiere]: prezzi e tendenze&quot; o &quot;Mercato immobiliare [zona]: analisi 2026&quot;
              attirano traffico organico di proprietari locali. Integra questi contenuti con il tuo{" "}
              <Link href="/funzionalita/chatbot-immobiliare" className="text-primary hover:underline">chatbot
              immobiliare</Link> per convertire i visitatori in lead.
            </p>
            <p>
              Pubblica regolarmente analisi di mercato per la zona con dati aggiornati: prezzi al metro quadro,
              tempi medi di vendita, numero di compravendite. Questi contenuti ti posizionano come l&apos;esperto
              locale e attirano proprietari che vogliono capire il valore del loro immobile.
            </p>

            <h2 className="text-2xl font-bold text-foreground pt-4">Combinare online e offline</h2>
            <p>
              Il farming digitale funziona meglio quando &egrave; integrato con attivit&agrave; offline. La
              combinazione pi&ugrave; efficace, come descritto anche nella{" "}
              <Link href="/blog/acquisizione-immobili-strategie-agenzie" className="text-primary hover:underline">guida
              all&apos;acquisizione immobiliare</Link>:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cartoline fisiche con QR code che rimanda alla valutazione online gratuita</li>
              <li>Sponsorizzazione di eventi locali con raccolta contatti digitale</li>
              <li>Collaborazioni con commercianti della zona (bar, edicole, farmacie) per esporre materiale informativo</li>
              <li>Open house con promozione sui social geolocalizzata</li>
            </ul>

            <h2 className="text-2xl font-bold text-foreground pt-4">Usare il CRM per gestire la farm</h2>
            <p>
              Un <Link href="/funzionalita/crm-immobiliare" className="text-primary hover:underline">CRM
              immobiliare</Link> &egrave; indispensabile per gestire il farming digitale. Traccia ogni contatto
              della zona: proprietari che hanno richiesto una valutazione, residenti che hanno interagito con
              i tuoi contenuti, segnalazioni ricevute. Il CRM ti permette di segmentare i contatti per zona
              e creare comunicazioni mirate.
            </p>

            <h2 className="text-2xl font-bold text-foreground pt-4">Misurare i risultati del farming digitale</h2>
            <p>
              Il vantaggio del{" "}
              <Link href="/blog/marketing-digitale-agenzie-immobiliari" className="text-primary hover:underline">marketing
              digitale</Link> &egrave; la misurabilit&agrave;. Per valutare l&apos;efficacia del tuo farming, monitora:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li><strong className="text-foreground">Traffico locale</strong>: quante visite al sito provengono dalla tua zona di farming</li>
              <li><strong className="text-foreground">Lead generati</strong>: quante richieste di valutazione ricevi dalla zona</li>
              <li><strong className="text-foreground">Incarichi acquisiti</strong>: quanti mandati ottieni nella zona rispetto al totale delle compravendite</li>
              <li><strong className="text-foreground">Quota di mercato</strong>: quale percentuale delle vendite della zona passa per la tua agenzia</li>
              <li><strong className="text-foreground">Costo per lead</strong>: quanto spendi in marketing per ogni contatto acquisito nella zona</li>
            </ol>

            <h2 className="text-2xl font-bold text-foreground pt-4">Conclusione</h2>
            <p>
              Il farming immobiliare digitale &egrave; una strategia a medio-lungo termine che richiede costanza
              e investimento. I risultati non arrivano in una settimana, ma in 6-12 mesi di attivit&agrave;
              costante puoi diventare il punto di riferimento della tua zona. Scegli una farm, presidia
              tutti i canali digitali e misura i risultati. Chi domina una zona, domina il mercato locale.
            </p>
          </div>

          <ArticoliCorrelati currentSlug="farming-immobiliare-digitale" />

          <div className="mt-12 rounded-2xl bg-surface border border-border p-8 text-center space-y-4">
            <h3 className="text-xl font-bold">Diventa il riferimento della tua zona</h3>
            <p className="text-foreground-muted">Valutazioni OMI, chatbot AI e CRM per presidiare il tuo territorio digitale.</p>
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
