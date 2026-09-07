import { MetadataRoute } from 'next';
import { BASE_URL } from '@/i18n/routing';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/login', '/api'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
