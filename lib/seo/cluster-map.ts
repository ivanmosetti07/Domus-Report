export interface ArticleInfo {
  slug: string
  titolo: string
  categoria: string
  cluster: "acquisizione" | "valutazioni-omi" | "tecnologia"
  isPillar?: boolean
}

const ALL_ARTICLES: ArticleInfo[] = [
  // Cluster A: Acquisizione Immobiliare
  { slug: "guida-lead-generation-immobiliare", titolo: "Guida Definitiva alla Lead Generation Immobiliare nel 2026", categoria: "Guida Completa", cluster: "acquisizione", isPillar: true },
  { slug: "come-generare-lead-immobiliari", titolo: "Come Generare Lead Immobiliari nel 2026: Guida Completa", categoria: "Lead Generation", cluster: "acquisizione" },
  { slug: "acquisizione-immobili-strategie-agenzie", titolo: "Acquisizione Immobili: 7 Strategie per Agenzie nel 2026", categoria: "Acquisizione", cluster: "acquisizione" },
  { slug: "qualificare-lead-immobiliari", titolo: "Come Qualificare i Lead Immobiliari: Guida Pratica per Agenti", categoria: "Lead Management", cluster: "acquisizione" },
  { slug: "marketing-digitale-agenzie-immobiliari", titolo: "Marketing Digitale per Agenzie Immobiliari: Guida Pratica 2026", categoria: "Marketing", cluster: "acquisizione" },
  { slug: "notizie-immobiliari-online", titolo: "Come Trovare Notizie Immobiliari Online per la Tua Agenzia", categoria: "Acquisizione", cluster: "acquisizione" },
  { slug: "acquisizione-incarichi-vendita", titolo: "Strategie di Acquisizione Incarichi di Vendita Immobiliare", categoria: "Acquisizione", cluster: "acquisizione" },
  { slug: "social-media-acquisizione-immobili", titolo: "Come Usare i Social per Acquisire Immobili da Vendere", categoria: "Social Media", cluster: "acquisizione" },
  { slug: "farming-immobiliare-digitale", titolo: "Farming Immobiliare Digitale: Cos'è e Come Farlo", categoria: "Acquisizione", cluster: "acquisizione" },

  // Cluster B: Valutazioni e Dati OMI
  { slug: "guida-dati-omi-valutazioni", titolo: "Tutto sui Dati OMI: Come Usarli per Valutazioni Perfette", categoria: "Guida Completa", cluster: "valutazioni-omi", isPillar: true },
  { slug: "dati-omi-guida-completa", titolo: "Dati OMI: Guida Completa alle Quotazioni Immobiliari Ufficiali", categoria: "Dati e Analisi", cluster: "valutazioni-omi" },
  { slug: "valutazione-immobiliare-guida-agenzie", titolo: "Valutazione Immobiliare Online: Guida Completa per Agenzie", categoria: "Valutazione", cluster: "valutazioni-omi" },
  { slug: "report-valutazione-immobiliare-professionale", titolo: "Report Valutazione Immobiliare: Come Creare Documenti Professionali", categoria: "Report", cluster: "valutazioni-omi" },
  { slug: "come-leggere-quotazioni-omi", titolo: "Come Leggere le Quotazioni OMI: Guida Pratica", categoria: "Dati e Analisi", cluster: "valutazioni-omi" },
  { slug: "valutazione-omi-vs-stima-commerciale", titolo: "Differenza tra Valutazione OMI e Stima Commerciale", categoria: "Valutazione", cluster: "valutazioni-omi" },
  { slug: "valutazione-immobile-online-gratis-agenzie", titolo: "Valutazione Immobile Online Gratis: Migliori Tool per Agenzie", categoria: "Strumenti", cluster: "valutazioni-omi" },
  { slug: "intelligenza-artificiale-stime-immobiliari", titolo: "Come l'Intelligenza Artificiale Migliora le Stime Immobiliari", categoria: "Tecnologia", cluster: "valutazioni-omi" },

  // Cluster C: Tecnologia
  { slug: "intelligenza-artificiale-immobiliare", titolo: "Intelligenza Artificiale nel Settore Immobiliare: Cosa Cambia per le Agenzie", categoria: "Tecnologia", cluster: "tecnologia" },
  { slug: "strumenti-digitali-agenzie-immobiliari", titolo: "Strumenti Digitali per Agenzie Immobiliari: Guida Completa 2026", categoria: "Strumenti", cluster: "tecnologia" },
]

export function getRelatedArticles(currentSlug: string, limit = 3): ArticleInfo[] {
  const current = ALL_ARTICLES.find((a) => a.slug === currentSlug)
  if (!current) return []

  const sameCluster = ALL_ARTICLES.filter(
    (a) => a.cluster === current.cluster && a.slug !== currentSlug
  )

  // Priorita: pillar page prima, poi gli altri
  sameCluster.sort((a, b) => {
    if (a.isPillar && !b.isPillar) return -1
    if (!a.isPillar && b.isPillar) return 1
    return 0
  })

  return sameCluster.slice(0, limit)
}

export function getArticleCluster(slug: string): string | null {
  const article = ALL_ARTICLES.find((a) => a.slug === slug)
  return article?.cluster ?? null
}

export function getPillarForCluster(cluster: string): ArticleInfo | null {
  return ALL_ARTICLES.find((a) => a.cluster === cluster && a.isPillar) ?? null
}
