import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://domusreport.com'

  return [
    // Homepage - massima priorità
    {
      url: baseUrl,
      lastModified: '2026-03-13',
      changeFrequency: 'weekly',
      priority: 1,
    },
    // Registrazione - alta priorità (conversione)
    {
      url: `${baseUrl}/register`,
      lastModified: '2026-03-01',
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    // Pagine funzionalità - alta priorità SEO
    {
      url: `${baseUrl}/funzionalita/valutazione-immobiliare-online`,
      lastModified: '2026-03-13',
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/funzionalita/lead-generation-immobiliare`,
      lastModified: '2026-03-13',
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/funzionalita/crm-immobiliare`,
      lastModified: '2026-03-13',
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/funzionalita/chatbot-immobiliare`,
      lastModified: '2026-03-13',
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    // Chi siamo
    {
      url: `${baseUrl}/about`,
      lastModified: '2026-03-01',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Programma affiliati
    {
      url: `${baseUrl}/affiliate`,
      lastModified: '2026-03-01',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Soluzioni
    {
      url: `${baseUrl}/soluzioni`,
      lastModified: '2026-03-13',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/soluzioni/widget-valutazione-immobili-sito-web`,
      lastModified: '2026-03-13',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/soluzioni/chatbot-immobiliare-whatsapp-sito`,
      lastModified: '2026-03-13',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/soluzioni/software-stima-immobiliare-white-label`,
      lastModified: '2026-03-13',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/soluzioni/migliori-software-valutazione-immobiliare`,
      lastModified: '2026-03-13',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Blog
    {
      url: `${baseUrl}/blog`,
      lastModified: '2026-03-13',
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // Pillar pages
    {
      url: `${baseUrl}/blog/guida-lead-generation-immobiliare`,
      lastModified: '2026-03-13',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/guida-dati-omi-valutazioni`,
      lastModified: '2026-03-10',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/come-generare-lead-immobiliari`,
      lastModified: '2026-03-13',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/valutazione-immobiliare-guida-agenzie`,
      lastModified: '2026-03-10',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/intelligenza-artificiale-immobiliare`,
      lastModified: '2026-03-07',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/marketing-digitale-agenzie-immobiliari`,
      lastModified: '2026-03-03',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/dati-omi-guida-completa`,
      lastModified: '2026-03-01',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/qualificare-lead-immobiliari`,
      lastModified: '2026-02-27',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/strumenti-digitali-agenzie-immobiliari`,
      lastModified: '2026-02-25',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/report-valutazione-immobiliare-professionale`,
      lastModified: '2026-02-22',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/acquisizione-immobili-strategie-agenzie`,
      lastModified: '2026-02-20',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/come-leggere-quotazioni-omi`,
      lastModified: '2026-02-18',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/valutazione-omi-vs-stima-commerciale`,
      lastModified: '2026-02-16',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/notizie-immobiliari-online`,
      lastModified: '2026-02-15',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/valutazione-immobile-online-gratis-agenzie`,
      lastModified: '2026-02-14',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/acquisizione-incarichi-vendita`,
      lastModified: '2026-02-12',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/social-media-acquisizione-immobili`,
      lastModified: '2026-02-10',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/farming-immobiliare-digitale`,
      lastModified: '2026-02-08',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/intelligenza-artificiale-stime-immobiliari`,
      lastModified: '2026-02-06',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // Registrazione affiliati
    {
      url: `${baseUrl}/affiliate/register`,
      lastModified: '2026-03-01',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // Documentazione
    {
      url: `${baseUrl}/docs/wordpress`,
      lastModified: '2026-03-01',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/docs/webflow`,
      lastModified: '2026-03-01',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/docs/html`,
      lastModified: '2026-03-01',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // Login
    {
      url: `${baseUrl}/login`,
      lastModified: '2026-03-01',
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    // Pagine legali
    {
      url: `${baseUrl}/privacy`,
      lastModified: '2024-12-01',
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: '2024-12-01',
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
