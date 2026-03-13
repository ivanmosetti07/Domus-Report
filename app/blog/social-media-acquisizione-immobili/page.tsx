import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ArticoliCorrelati } from "@/components/blog/articoli-correlati"
import { Button } from "@/components/ui/button"
import { ArrowRight, ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Social Media per Acquisire Immobili da Vendere",
  description: "Come usare Instagram, Facebook, LinkedIn e TikTok per acquisire immobili da vendere. Strategie social media per agenzie immobiliari con esempi pratici.",
  keywords: [
    "social media immobiliare",
    "instagram agenzia immobiliare",
    "facebook agenzia immobiliare",
    "social media acquisizione immobili",
  ],
  alternates: {
    canonical: "https://domusreport.com/blog/social-media-acquisizione-immobili",
  },
  openGraph: {
    title: "Social Media per Acquisire Immobili da Vendere | DomusReport",
    description: "Strategie Instagram, Facebook, LinkedIn e TikTok per acquisire immobili. Guida pratica per agenzie.",
    url: "https://domusreport.com/blog/social-media-acquisizione-immobili",
    type: "article",
  },
}

export default function ArticoloSocialMediaAcquisizione() {
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
            <div className="text-sm text-primary font-semibold uppercase tracking-wide mb-2">Social Media</div>
            <h1 className="text-3xl sm:text-4xl font-black leading-tight mb-4">
              Social Media per Acquisire Immobili da Vendere: Guida Pratica
            </h1>
            <p className="text-foreground-muted">10 Febbraio 2026 &middot; 7 min di lettura</p>
          </div>

          <div className="prose-custom space-y-6 text-lg text-foreground-muted">
            <p>
              I <strong className="text-foreground">social media</strong> non servono solo a promuovere gli immobili
              gi&agrave; in portafoglio: se usati con strategia, sono uno strumento potente per acquisire nuovi
              immobili da vendere. All&apos;interno di una{" "}
              <Link href="/blog/guida-lead-generation-immobiliare" className="text-primary hover:underline">strategia
              di lead generation immobiliare</Link>, i social media ti permettono di raggiungere proprietari che
              stanno pensando di vendere, anche prima che contattino un&apos;agenzia.
            </p>

            <h2 className="text-2xl font-bold text-foreground pt-4">Instagram: il canale pi&ugrave; efficace per il real estate</h2>
            <p>
              Instagram &egrave; la piattaforma ideale per le agenzie immobiliari. Il formato visivo si presta
              perfettamente a mostrare immobili, ma il vero potenziale &egrave; nella costruzione del personal brand
              dell&apos;agente e della credibilit&agrave; dell&apos;agenzia. Ecco i formati che funzionano:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-foreground">Reels</strong>: tour virtuali, prima/dopo ristrutturazione, consigli per venditori in 30-60 secondi. I Reels hanno la reach organica pi&ugrave; alta</li>
              <li><strong className="text-foreground">Stories</strong>: dietro le quinte dell&apos;agenzia, sondaggi (&quot;Stai pensando di vendere casa?&quot;), countdown per open house, testimonianze dei clienti</li>
              <li><strong className="text-foreground">Caroselli</strong>: analisi di mercato della tua zona, checklist per venditori, errori da evitare quando si vende casa</li>
              <li><strong className="text-foreground">Post statici</strong>: vendite concluse con i numeri (giorni sul mercato, prezzo richiesto vs. prezzo finale), quote motivazionali del settore</li>
            </ul>

            <h2 className="text-2xl font-bold text-foreground pt-4">Facebook: gruppi, ads e marketplace</h2>
            <p>
              Facebook resta fondamentale per il target over 40, che &egrave; anche il segmento pi&ugrave; probabile
              di proprietari venditori. Le tre leve principali:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-foreground">Gruppi locali</strong>: partecipa attivamente ai gruppi del tuo quartiere o citt&agrave;. Rispondi alle domande sul mercato, condividi analisi gratuite. Non fare spam: offri valore</li>
              <li><strong className="text-foreground">Facebook Ads</strong>: crea campagne mirate con target geografico preciso. L&apos;annuncio pi&ugrave; efficace offre una valutazione gratuita come lead magnet, collegata alla tua piattaforma di <Link href="/funzionalita/lead-generation-immobiliare" className="text-primary hover:underline">lead generation</Link></li>
              <li><strong className="text-foreground">Marketplace</strong>: monitora gli annunci di privati che vendono casa nella tua zona. Sono potenziali clienti da contattare con un&apos;offerta di servizio</li>
            </ul>

            <h2 className="text-2xl font-bold text-foreground pt-4">LinkedIn: personal branding e B2B</h2>
            <p>
              LinkedIn non &egrave; il canale per vendere appartamenti, ma &egrave; perfetto per costruire la tua
              reputazione come esperto del mercato immobiliare. Pubblica:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Analisi di mercato con dati e grafici</li>
              <li>Riflessioni sui trend del settore</li>
              <li>Casi studio di vendite complesse gestite con successo</li>
              <li>Contenuti sulla tua esperienza e sul tuo metodo di lavoro</li>
            </ul>
            <p>
              Su LinkedIn raggiungi anche professionisti (avvocati, commercialisti, notai) che possono segnalarti
              immobili da vendere. &Egrave; un canale di referral indiretto molto efficace.
            </p>

            <h2 className="text-2xl font-bold text-foreground pt-4">TikTok: il canale emergente</h2>
            <p>
              TikTok sta crescendo anche nel settore immobiliare. I video brevi e informali funzionano bene
              per raggiungere un pubblico nuovo. Idee di contenuto:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>&quot;Un giorno da agente immobiliare&quot; — mostra il tuo lavoro reale</li>
              <li>&quot;Quanto vale una casa a [citt&agrave;]?&quot; — analisi rapide e curiosit&agrave;</li>
              <li>&quot;3 errori quando vendi casa&quot; — consigli pratici in formato breve</li>
              <li>Tour di immobili particolari o lussuosi (attirano visualizzazioni e follower)</li>
            </ul>

            <h2 className="text-2xl font-bold text-foreground pt-4">Idee di contenuto che generano lead venditori</h2>
            <p>
              Non tutti i contenuti social sono uguali. Per acquisire immobili da vendere, concentrati su
              contenuti che parlano direttamente ai proprietari:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li><strong className="text-foreground">Aggiornamenti di mercato</strong>: &quot;I prezzi nella tua zona sono saliti del 5% nell&apos;ultimo anno. Scopri quanto vale la tua casa&quot;</li>
              <li><strong className="text-foreground">Testimonianze clienti</strong>: video o citazioni di proprietari soddisfatti della vendita</li>
              <li><strong className="text-foreground">Prima e dopo</strong>: home staging, ristrutturazioni, foto professionali vs. foto amatoriali</li>
              <li><strong className="text-foreground">Consigli per venditori</strong>: documenti necessari, come preparare la casa per le visite, tempistiche</li>
              <li><strong className="text-foreground">Risultati concreti</strong>: &quot;Venduto in 15 giorni al 98% del prezzo richiesto&quot;</li>
            </ol>

            <h2 className="text-2xl font-bold text-foreground pt-4">Integrare social e{" "}
              <Link href="/blog/marketing-digitale-agenzie-immobiliari" className="text-primary hover:underline">marketing digitale</Link>
            </h2>
            <p>
              I social media funzionano meglio quando sono integrati con gli altri canali digitali. Collega
              ogni post a una landing page con valutazione gratuita, usa il retargeting per mostrare annunci
              a chi ha visitato il tuo sito, e alimenta il CRM con i contatti raccolti dai social.
              L&apos;obiettivo &egrave; trasformare follower in lead e lead in incarichi.
            </p>

            <h2 className="text-2xl font-bold text-foreground pt-4">Conclusione</h2>
            <p>
              I social media per acquisire immobili richiedono costanza e strategia. Non basta pubblicare
              annunci: devi creare contenuti che posizionino te e la tua agenzia come il punto di riferimento
              per chi vuole vendere nella tua zona. Pubblica con regolarit&agrave;, offri valore prima di
              chiedere l&apos;incarico e misura i risultati.
            </p>
          </div>

          <ArticoliCorrelati currentSlug="social-media-acquisizione-immobili" />

          <div className="mt-12 rounded-2xl bg-surface border border-border p-8 text-center space-y-4">
            <h3 className="text-xl font-bold">Converti i follower in lead qualificati</h3>
            <p className="text-foreground-muted">Collega i tuoi social a una valutazione AI che cattura contatti automaticamente.</p>
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
