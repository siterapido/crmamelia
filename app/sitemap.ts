import { MetadataRoute } from 'next'

/**
 * Sitemap Generator
 * Automatically generates sitemap.xml for SEO
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ameliasaude.com.br'
  const lastModified = new Date()

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/sobre`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacidade`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/termos`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/lgpd`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
