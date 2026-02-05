import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://domusreport.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/register',
          '/login',
          '/about',
          '/docs/',
          '/privacy',
          '/terms',
        ],
        disallow: [
          '/dashboard/',
          '/api/',
          '/admin/',
          '/_next/',
          '/private/',
          '/widget/',
          '/onboarding/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        crawlDelay: 0,
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        crawlDelay: 0,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
