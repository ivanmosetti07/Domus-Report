import {
  Sparkles,
  Zap,
  Database,
  Target,
  MessageSquare,
  LineChart,
  Users,
  BarChart3,
  Code,
  Shield,
  Clock,
  FileText,
  XCircle,
  CheckCircle,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

// === HERO ===
export const HERO_BADGE = "Il Primo Chatbot AI per Agenti Immobiliari"
export const HERO_TRUST_ITEMS = [
  "Nessuna carta richiesta",
  "Setup immediato",
  "Cancella quando vuoi",
]

// === TRUST BAR ===
export interface TrustStat {
  value: string
  label: string
}
export const TRUST_STATS: TrustStat[] = [
  { value: "1.200+", label: "Lead generati" },
  { value: "98%", label: "Precisione valutazioni" },
  { value: "24/7", label: "Disponibilità" },
  { value: "2 min", label: "Setup completo" },
]

// === PROBLEM / SOLUTION ===
export interface ProblemItem {
  icon: LucideIcon
  title: string
  description: string
}
export const PROBLEMS: ProblemItem[] = [
  {
    icon: MessageSquare,
    title: "Form statici inutili",
    description: "\"Nome, email, indirizzo\" - Dati superficiali senza contesto. Nessuna qualificazione reale del lead.",
  },
  {
    icon: Target,
    title: "Zero qualificazione",
    description: "I form non filtrano curiosi da venditori seri. Ogni richiesta sembra uguale all'altra.",
  },
  {
    icon: Clock,
    title: "Valutazioni manuali",
    description: "Ore perse a calcolare stime per ogni singola richiesta. Lavoro ripetitivo e improduttivo.",
  },
]

export const SOLUTIONS: ProblemItem[] = [
  {
    icon: Sparkles,
    title: "Conversazione AI naturale",
    description: "Il chatbot dialoga, fa domande intelligenti ed estrae tutti i dati senza form. Solo conversazione.",
  },
  {
    icon: Shield,
    title: "Qualificazione automatica",
    description: "L'AI filtra curiosi da venditori seri. Ricevi solo contatti con intenzione reale e dati completi.",
  },
  {
    icon: Zap,
    title: "Valutazione in 3 secondi",
    description: "Stima OMI calcolata in real-time durante la chat. Il cliente vede il prezzo mentre conversa.",
  },
]

// === HOW IT WORKS ===
export interface StepItem {
  step: string
  icon: LucideIcon
  title: string
  description: string
}
export const STEPS: StepItem[] = [
  {
    step: "01",
    icon: Sparkles,
    title: "Chatbot si attiva",
    description: "Il cliente clicca e inizia una conversazione naturale con l'AI. Nessun form, solo dialogo.",
  },
  {
    step: "02",
    icon: MessageSquare,
    title: "AI qualifica conversando",
    description: "L'AI fa domande intelligenti, estrae indirizzo, tipologia, mq, piano, stato - tutto dialogando.",
  },
  {
    step: "03",
    icon: Zap,
    title: "Valutazione real-time",
    description: "In 3 secondi l'AI calcola la stima OMI ufficiale e la mostra al cliente durante la chat.",
  },
  {
    step: "04",
    icon: Target,
    title: "Lead + Valutazione",
    description: "Ricevi contatto qualificato con stima già calcolata, storico conversazione completo e intenzione chiara.",
  },
]

// === FEATURES GRID (6 principali, bento) ===
export interface FeatureItem {
  icon: LucideIcon
  title: string
  description: string
  gradient: string
  size: "large" | "normal"
}
export const FEATURES: FeatureItem[] = [
  {
    icon: Sparkles,
    title: "AI Conversazionale Avanzata",
    description: "Chatbot che dialoga naturalmente, fa domande intelligenti ed estrae tutti i dati necessari. Zero form, solo conversazione fluida. Ogni lead arriva con contesto completo.",
    gradient: "from-purple-500 to-indigo-600",
    size: "large",
  },
  {
    icon: Database,
    title: "133.000+ Dati OMI",
    description: "Database ufficiale completo per zona e CAP. Stime precise basate su valori di mercato verificati.",
    gradient: "from-cyan-500 to-blue-600",
    size: "normal",
  },
  {
    icon: Target,
    title: "Qualificazione Automatica",
    description: "L'AI filtra curiosi da venditori seri. Ricevi solo contatti con intenzione reale e dati completi.",
    gradient: "from-green-500 to-emerald-600",
    size: "normal",
  },
  {
    icon: LineChart,
    title: "CRM & Analytics Integrati",
    description: "Workflow lead completo con storico AI. Traccia performance chatbot: tasso risposta, conversazioni, valutazioni, conversioni. Dashboard real-time con export CSV/Excel.",
    gradient: "from-orange-500 to-red-600",
    size: "large",
  },
  {
    icon: BarChart3,
    title: "Report PDF Automatici",
    description: "L'AI genera report professionali con valutazione, dati immobile e confronto mercato. Un click.",
    gradient: "from-pink-500 to-rose-600",
    size: "normal",
  },
  {
    icon: Code,
    title: "Setup 1-Click",
    description: "Copia-incolla una riga di codice. Il chatbot AI è live in 60 secondi su qualsiasi sito.",
    gradient: "from-teal-500 to-cyan-600",
    size: "normal",
  },
]

// === FEATURES DEEP DIVE (tabs) ===
export interface DetailedFeature {
  id: string
  icon: LucideIcon
  tabLabel: string
  title: string
  description: string
  bulletPoints: string[]
}
export const DETAILED_FEATURES: DetailedFeature[] = [
  {
    id: "chatbot",
    icon: Sparkles,
    tabLabel: "Chatbot AI",
    title: "Conversazione AI che converte",
    description: "Il chatbot dialoga naturalmente con i visitatori del tuo sito, raccoglie tutti i dati necessari e qualifica ogni lead senza form noiosi.",
    bulletPoints: [
      "Domande intelligenti e contestuali",
      "Supporto per 7+ tipologie immobiliari",
      "Raccolta dati completa (indirizzo, mq, piano, stato, classe energetica)",
      "Storico conversazione salvato per ogni lead",
      "Personalizzabile con 12 temi e colori custom",
    ],
  },
  {
    id: "valutazioni",
    icon: Database,
    tabLabel: "Valutazioni OMI",
    title: "Valutazioni precise in tempo reale",
    description: "Calcolo istantaneo basato su dati OMI ufficiali con oltre 133.000 valori per zona. 15+ coefficienti qualitativi per stime accurate.",
    bulletPoints: [
      "Database OMI ufficiale: 7.889 comuni italiani",
      "Coefficienti: piano, stato, classe energetica, anno, extras",
      "Range min/max per ogni valutazione",
      "Selezione automatica categoria OMI",
      "Calcolo in meno di 3 secondi",
    ],
  },
  {
    id: "crm",
    icon: Users,
    tabLabel: "CRM & Analytics",
    title: "Gestisci lead e monitora risultati",
    description: "CRM completo con gestione stato lead, export dati e analytics real-time delle performance del chatbot.",
    bulletPoints: [
      "Dashboard con KPI: lead, valutazioni, conversioni",
      "Gestione stato lead: nuovo → qualificato → convertito",
      "Export CSV e Excel con tutti i dati",
      "Analytics: impressioni, click, conversion rate",
      "Notifiche email per ogni nuovo lead",
    ],
  },
  {
    id: "report",
    icon: FileText,
    tabLabel: "Report PDF",
    title: "Report professionali automatici",
    description: "Genera report PDF personalizzati con il tuo brand, valutazione dettagliata, mappa e storico conversazione.",
    bulletPoints: [
      "PDF brandizzato con logo e colori agenzia",
      "Valutazione dettagliata con coefficienti",
      "Mappa interattiva dell'immobile",
      "Storico completo della conversazione AI",
      "Invio automatico via email al cliente",
    ],
  },
]

// === PLANS ===
export interface PlanFeature {
  text: string
  included: boolean
}
export interface PlanData {
  name: string
  slug: "free" | "basic" | "premium"
  description: string
  monthlyPrice: number
  features: PlanFeature[]
  recommended?: boolean
  ctaText: string
  ctaVariant: "outline" | "default"
}
export const PLANS: PlanData[] = [
  {
    name: "Free",
    slug: "free",
    description: "Perfetto per testare",
    monthlyPrice: 0,
    features: [
      { text: "5 valutazioni/mese", included: true },
      { text: "1 widget", included: true },
      { text: "CRM base", included: true },
      { text: "Email notifiche", included: true },
      { text: "Analytics", included: false },
      { text: "Custom branding", included: false },
    ],
    ctaText: "Inizia gratis",
    ctaVariant: "outline",
  },
  {
    name: "Basic",
    slug: "basic",
    description: "Per agenzie operative",
    monthlyPrice: 50,
    features: [
      { text: "50 valutazioni/mese", included: true },
      { text: "3 widget", included: true },
      { text: "CRM completo", included: true },
      { text: "Analytics avanzate", included: true },
      { text: "Custom branding", included: true },
      { text: "Export CSV/Excel", included: true },
      { text: "Supporto prioritario", included: true },
    ],
    recommended: true,
    ctaText: "Inizia ora",
    ctaVariant: "default",
  },
  {
    name: "Premium",
    slug: "premium",
    description: "Massimo controllo",
    monthlyPrice: 100,
    features: [
      { text: "150 valutazioni/mese", included: true },
      { text: "10 widget", included: true },
      { text: "CRM avanzato", included: true },
      { text: "Analytics real-time", included: true },
      { text: "White-label", included: true },
      { text: "API access", included: true },
      { text: "Report PDF illimitati", included: true },
      { text: "Supporto dedicato", included: true },
    ],
    ctaText: "Inizia ora",
    ctaVariant: "outline",
  },
]

// === TESTIMONIALS ===
export interface TestimonialItem {
  quote: string
  author: string
  role: string
  company: string
  rating: number
  stat: string
  initials: string
}
export const TESTIMONIALS: TestimonialItem[] = [
  {
    quote: "In un mese abbiamo ricevuto 47 richieste concrete. Il sistema lavora anche di notte e nei weekend. Finalmente lead che rispondono al telefono.",
    author: "Marco Colombo",
    role: "Titolare",
    company: "Immobiliare Milano Centro",
    rating: 5,
    stat: "+234% lead",
    initials: "MC",
  },
  {
    quote: "Valutazioni precise basate su dati veri e contatti già filtrati. Prima sprecavamo giorni dietro curiosi, ora contattiamo solo chi è davvero pronto.",
    author: "Laura Rossi",
    role: "Agente Senior",
    company: "Agenzia Casa Tua",
    rating: 5,
    stat: "-67% tempo perso",
    initials: "LR",
  },
  {
    quote: "Il CRM integrato e le analytics ci permettono di tracciare ogni singolo lead. Sappiamo esattamente cosa funziona e dove investire. ROI misurabile.",
    author: "Giuseppe Bianchi",
    role: "Founder",
    company: "Exclusive Properties",
    rating: 5,
    stat: "+156% conversioni",
    initials: "GB",
  },
]

// === FAQ ===
export interface FaqItem {
  question: string
  answer: string
}
export const FAQS: FaqItem[] = [
  {
    question: "Cos'è DomusReport?",
    answer: "DomusReport è il primo chatbot AI conversazionale per agenti immobiliari. Genera valutazioni immobiliari in tempo reale con dati OMI ufficiali, qualifica automaticamente i lead e include un CRM integrato per gestire ogni contatto.",
  },
  {
    question: "Come funziona la valutazione immobiliare con AI?",
    answer: "Il chatbot AI dialoga con il cliente, raccoglie i dati dell'immobile (indirizzo, tipologia, superficie, piano, stato) e in 3 secondi calcola la valutazione OMI ufficiale mostrandola in tempo reale durante la conversazione.",
  },
  {
    question: "Quanto tempo ci vuole per installare il chatbot?",
    answer: "L'installazione richiede solo 2 minuti. Copia-incolla una riga di codice nel tuo sito e il chatbot AI è immediatamente operativo. Compatibile con WordPress, Webflow, HTML e qualsiasi piattaforma.",
  },
  {
    question: "I dati OMI sono ufficiali?",
    answer: "Sì, utilizziamo il database ufficiale OMI (Osservatorio Mercato Immobiliare) con oltre 133.000 valori per zona e CAP su 7.889 comuni italiani, garantendo stime precise e aggiornate.",
  },
  {
    question: "Posso provare gratis?",
    answer: "Assolutamente sì. Tutti i piani includono 7 giorni di prova gratuita senza carta di credito. Il piano Free è gratuito per sempre con 5 valutazioni al mese.",
  },
  {
    question: "Posso personalizzare l'aspetto del chatbot?",
    answer: "Sì, il chatbot è completamente personalizzabile: 12 temi predefiniti, colori custom, logo della tua agenzia, posizione e animazione. Con il piano Premium puoi anche usare CSS personalizzato per un white-label completo.",
  },
  {
    question: "Come funziona il programma affiliati?",
    answer: "Guadagni il 10% ricorrente su ogni pagamento mensile delle agenzie che referisci. Il tracking è automatico con cookie da 30 giorni e i pagamenti avvengono tramite Stripe Connect. Nessun limite al numero di referral.",
  },
]

// === STRUCTURED DATA (SEO) ===
export const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "DomusReport",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: "Il primo chatbot AI conversazionale per agenti immobiliari. Valutazioni immobiliari real-time con dati OMI ufficiali, qualificazione automatica lead e CRM integrato.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "EUR",
        priceValidUntil: "2026-12-31",
        availability: "https://schema.org/InStock",
        url: "https://domusreport.com/register",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "127",
        bestRating: "5",
      },
      screenshot: "https://domusreport.com/screenshot.png",
      featureList: [
        "Chatbot AI conversazionale",
        "Valutazioni OMI real-time",
        "Qualificazione automatica lead",
        "CRM integrato",
        "Analytics in tempo reale",
        "Setup 1-click",
      ],
    },
    {
      "@type": "Organization",
      name: "DomusReport",
      url: "https://domusreport.com",
      logo: "https://domusreport.com/logo.png",
      description: "Piattaforma AI per agenti immobiliari - Il primo chatbot conversazionale che genera valutazioni immobiliari in tempo reale",
      sameAs: [
        "https://www.linkedin.com/company/domusreport",
        "https://twitter.com/domusreport",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "Customer Support",
        email: "support@domusreport.com",
        availableLanguage: "Italian",
      },
    },
    {
      "@type": "WebSite",
      name: "DomusReport",
      url: "https://domusreport.com",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://domusreport.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Cos'è DomusReport?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "DomusReport è il primo chatbot AI conversazionale per agenti immobiliari che genera valutazioni immobiliari in tempo reale con dati OMI ufficiali, qualifica automaticamente i lead e include un CRM integrato.",
          },
        },
        {
          "@type": "Question",
          name: "Come funziona la valutazione immobiliare con AI?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Il chatbot AI dialoga con il cliente, raccoglie i dati dell'immobile (indirizzo, tipologia, superficie, piano, stato) e in 3 secondi calcola la valutazione OMI ufficiale mostrandola in tempo reale durante la conversazione.",
          },
        },
        {
          "@type": "Question",
          name: "Quanto tempo ci vuole per installare il chatbot?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "L'installazione richiede solo 2 minuti. Copia-incolla una riga di codice nel tuo sito e il chatbot AI è immediatamente operativo.",
          },
        },
        {
          "@type": "Question",
          name: "I dati OMI sono ufficiali?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Sì, utilizziamo il database ufficiale OMI (Osservatorio Mercato Immobiliare) con oltre 133.000 valori per zona e CAP, garantendo stime precise e aggiornate.",
          },
        },
      ],
    },
    {
      "@type": "Service",
      serviceType: "Chatbot AI per Valutazioni Immobiliari",
      provider: {
        "@type": "Organization",
        name: "DomusReport",
      },
      areaServed: "IT",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Piani DomusReport",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: "Piano Free" },
            price: "0",
            priceCurrency: "EUR",
          },
          {
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: "Piano Basic" },
            price: "50",
            priceCurrency: "EUR",
          },
          {
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: "Piano Premium" },
            price: "100",
            priceCurrency: "EUR",
          },
        ],
      },
    },
  ],
}
