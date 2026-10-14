import type {MetadataRoute} from 'next';
import {siteUrl, siteIndexable} from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  // Non-production deployments (local, UAT) are built with
  // SITE_INDEXABLE=false so they cannot compete with www.hatcmarket.com for
  // the same content. See src/lib/seo.ts.
  if (!siteIndexable) {
    return {rules: {userAgent: '*', disallow: '/'}};
  }

  return {
    rules: {
      userAgent: '*',
      // Uploaded media has to stay crawlable: academy article covers are
      // served from /api/media/file/… and are the `og:image` of every article,
      // and the Facebook/WhatsApp scrapers honour robots.txt — a blanket
      // `Disallow: /api` leaves those shares with no thumbnail.
      allow: ['/', '/api/media/'],
      disallow: ['/admin', '/api']
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl
  };
}
