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
    // Registrazione affiliati
    {
      url: `${baseUrl}/affiliate/register`,
      lastModified: '2026-03-01',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // Documentazione - importante per SEO long-tail
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
