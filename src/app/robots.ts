import type {MetadataRoute} from 'next';
import {siteUrl, siteIndexable} from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  // Non-production deployments (local, UAT) are built with
  // SITE_INDEXABLE=false so they cannot compete with www.hatchk.com for the
  // same content. See src/lib/seo.ts.
  if (!siteIndexable) {
    return {rules: {userAgent: '*', disallow: '/'}};
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api']
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl
  };
}
