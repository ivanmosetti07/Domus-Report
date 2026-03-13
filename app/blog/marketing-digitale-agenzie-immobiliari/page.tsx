import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { ArrowRight, ArrowLeft } from "lucide-react"
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema"
import { ArticoliCorrelati } from "@/components/blog/articoli-correlati"

export const metadata = {
  title: "Marketing Digitale per Agenzie Immobiliari: Guida 2026",
  description: "Strategie di marketing digitale per agenzie immobiliari: SEO locale, Google Ads, social media, email marketing, chatbot AI e automazione. Guida pratica con esempi.",
  keywords: [
    "marketing digitale agenzie immobiliari",
    "marketing immobiliare",
    "marketing online agenzia immobiliare",
    "strategia digitale immobiliare",
    "pubblicità agenzia immobiliare",
    "social media immobiliare",
    "SEO agenzia immobiliare",
  ],
  alternates: {
    canonical: "https://domusreport.com/blog/marketing-digitale-agenzie-immobiliari",
  },
  openGraph: {
    title: "Marketing Digitale per Agenzie Immobiliari | DomusReport",
    description: "Guida pratica al marketing digitale immobiliare: SEO, Ads, social, email e chatbot AI.",
    url: "https://domusreport.com/blog/marketing-digitale-agenzie-immobiliari",
    type: "article",
  },
}

export default function ArticoloMarketing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="h-20" />
      <BreadcrumbSchema items={[
        { name: "Home", url: "https://domusreport.com" },
        { name: "Blog", url: "https://domusreport.com/blog" },
        { name: "Marketing Digitale per Agenzie Immobiliari", url: "https://domusreport.com/blog/marketing-digitale-agenzie-immobiliari" },
      ]} />

      <main className="w-full">
        <article className="site-container py-12 sm:py-16 max-w-3xl mx-auto">
          <div className="mb-8">
            <Link href="/blog" className="text-sm text-primary hover:underline flex items-center gap-1 mb-4">
              <ArrowLeft className="h-3 w-3" /> Blog
            </Link>
            <div className="text-sm text-primary font-semibold uppercase tracking-wide mb-2">Marketing</div>
            <h1 className="text-3xl sm:text-4xl font-black leading-tight mb-4">
              Marketing Digitale per Agenzie Immobiliari: Guida Pratica 2026
            </h1>
            <p className="text-foreground-muted">3 Marzo 2026 &middot; 10 min di lettura</p>
          </div>

          <div className="prose-custom space-y-6 text-lg text-foreground-muted">
            <p>
              Il <strong className="text-foreground">marketing digitale per agenzie immobiliari</strong> non &egrave; pi&ugrave;
              un&apos;opzione: &egrave; una necessit&agrave;. L&apos;85% degli acquirenti e venditori inizia la ricerca online.
              Come illustrato nella nostra <Link href="/blog/guida-lead-generation-immobiliare" className="text-primary hover:underline">guida completa alla lead generation</Link>,
              ecco come strutturare una strategia digitale efficace per la tua agenzia.
            </p>

            <h2 className="text-2xl font-bold text-foreground pt-4">SEO Locale: essere trovati quando conta</h2>
            <p>
              La SEO locale &egrave; il fondamento del marketing digitale immobiliare. Quando un proprietario cerca
              &quot;agenzia immobiliare [citt&agrave;]&quot; o &quot;vendere casa [quartiere]&quot;, la tua agenzia
              deve apparire nei primi risultati.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-foreground">Google Business Profile</strong>: compila ogni campo, aggiungi foto professionali, rispondi alle recensioni</li>
              <li><strong className="text-foreground">Sito web ottimizzato</strong>: pagine dedicate per ogni zona in cui operi</li>
              <li><strong className="text-foreground">Contenuti locali</strong>: pubblica analisi di mercato per quartiere</li>
              <li><strong className="text-foreground">Recensioni</strong>: chiedi sistematicamente recensioni ai clienti soddisfatti</li>
            </ul>

            <h2 className="text-2xl font-bold text-foreground pt-4">Google Ads: risultati immediati</h2>
            <p>
              Le campagne Google Ads permettono di intercettare domanda attiva. Le keyword pi&ugrave; efficaci per le agenzie sono:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>&quot;vendere casa [citt&agrave;]&quot; — per acquisire incarichi</li>
              <li>&quot;valutazione immobile [zona]&quot; — per generare lead venditori</li>
              <li>&quot;agenzia immobiliare [quartiere]&quot; — per brand awareness locale</li>
              <li>&quot;appartamento in vendita [zona]&quot; — per attrarre acquirenti</li>
            </ul>
            <p>
              La landing page dovrebbe offrire una <Link href="/funzionalita/valutazione-immobiliare-online" className="text-primary hover:underline">valutazione
              immobiliare gratuita</Link> come lead magnet. &Egrave; molto pi&ugrave; efficace di un semplice &quot;Contattaci&quot;.
            </p>

            <h2 className="text-2xl font-bold text-foreground pt-4">Social Media: Instagram e LinkedIn</h2>
            <p>
              <strong className="text-foreground">Instagram</strong> &egrave; il canale pi&ugrave; efficace per il real estate B2C: tour virtuali, foto professionali,
              reel con consigli per venditori e acquirenti. I contenuti che funzionano meglio sono quelli &quot;dietro le quinte&quot;:
              una giornata tipo dell&apos;agente, il prima/dopo di una ristrutturazione, i numeri di una vendita andata bene.
            </p>
            <p>
              <strong className="text-foreground">LinkedIn</strong> funziona per il B2B e per il personal branding dell&apos;agente: condividi analisi di mercato,
              trend del settore, casi studio. Posizionati come esperto della tua zona.
            </p>

            <h2 className="text-2xl font-bold text-foreground pt-4">Email Marketing: il follow-up che converte</h2>
            <p>
              L&apos;email marketing resta uno dei canali con il ROI pi&ugrave; alto. Per le agenzie immobiliari, le email
              pi&ugrave; efficaci sono:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Report di mercato mensile per la zona (posiziona l&apos;agenzia come esperta)</li>
              <li>Nuovi immobili in portafoglio (per gli acquirenti in lista)</li>
              <li>Aggiornamenti di valutazione (per i proprietari che hanno ricevuto una stima)</li>
              <li>Consigli pratici per venditori (documenti necessari, home staging, tempistiche)</li>
            </ul>

            <h2 className="text-2xl font-bold text-foreground pt-4">Chatbot AI: conversione 24/7</h2>
            <p>
              Un <Link href="/funzionalita/chatbot-immobiliare" className="text-primary hover:underline">chatbot AI sul sito web</Link> converte
              visitatori in lead anche quando l&apos;agenzia &egrave; chiusa. Il chatbot offre una valutazione immobiliare in tempo reale
              e raccoglie contatti qualificati senza intervento umano. I dati mostrano un tasso di conversione 3 volte superiore ai form tradizionali.
            </p>

            <h2 className="text-2xl font-bold text-foreground pt-4">Automazione e CRM</h2>
            <p>
              Il <Link href="/funzionalita/crm-immobiliare" className="text-primary hover:underline">CRM</Link> &egrave; il collante di tutta
              la strategia digitale. Senza un sistema per tracciare i contatti dal primo click alla firma del mandato, ogni
              investimento in marketing rischia di essere sprecato. Il CRM deve registrare la fonte del lead, lo stato
              di avanzamento e lo storico delle interazioni.
            </p>

            <h2 className="text-2xl font-bold text-foreground pt-4">Budget: quanto investire</h2>
            <p>
              Una regola pratica per le agenzie immobiliari: destina il 5-10% del fatturato lordo al marketing digitale.
              Distribuisci il budget cos&igrave;:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>40% Google Ads (risultati immediati)</li>
              <li>25% Social media (contenuti + adv)</li>
              <li>20% SEO e contenuti (risultati a lungo termine)</li>
              <li>15% Strumenti e software (CRM, chatbot, email marketing)</li>
            </ul>
          </div>

          <ArticoliCorrelati currentSlug="marketing-digitale-agenzie-immobiliari" />

          <div className="mt-12 rounded-2xl bg-surface border border-border p-8 text-center space-y-4">
            <h3 className="text-xl font-bold">Automatizza la lead generation sul tuo sito</h3>
            <p className="text-foreground-muted">Chatbot AI + valutazione OMI + CRM integrato. Tutto incluso.</p>
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
