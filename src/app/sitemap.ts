import type {MetadataRoute} from 'next';
import {routing} from '@/i18n/routing';
import {getAcademyArticleSlugs} from '@/lib/academyArticles';
import {siteUrl} from '@/lib/seo';

// Static pages available for indexing.
const staticPaths = [
  '',
  '/about',
  '/trading',
  '/products',
  '/products/all',
  '/accounts',
  '/funding',
  '/platforms',
  '/news',
  '/academy'
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articleSlugs = await getAcademyArticleSlugs();
  const paths = [
    ...staticPaths,
    ...articleSlugs.map((slug) => `/academy/${slug}`)
  ];

  return paths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${siteUrl}/${locale}${path}`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${siteUrl}/${l}${path}`])
        )
      }
    }))
  );
}
