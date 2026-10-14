import type {MetadataRoute} from 'next';
import type {Locale} from '@/i18n/routing';
import {routing} from '@/i18n/routing';
import {getAcademyArticleSlugsByLocale} from '@/lib/academyArticles';
import {getAnnouncementSlugsByLocale} from '@/lib/announcements';
import {siteUrl} from '@/lib/seo';

// Static pages available for indexing.
//
// 🚩 The `/<locale>/embed/*` webview twins are deliberately absent: they
// duplicate the public pages for the HATC app and are marked noindex in
// src/app/(embed)/[locale]/embed/layout.tsx. Do not "fix" the omission.
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
  '/announcements',
  '/academy',
  '/privacy',
  '/disclaimer'
];

/**
 * A page and the locales that can actually serve it.
 *
 * 🚩 CMS detail pages are **not** available in every locale: a notice or article
 * whose title is empty in a locale is dropped by its reader, so that locale's
 * URL 404s. Enumerating per locale keeps those 404s out of the sitemap, keeps
 * `hreflang` truthful — and, the reason this was rewritten (第七十一輪), stops
 * the whole entry from disappearing just because 繁體中文 is missing: the
 * previous version derived one slug list from the default locale, so seven
 * Simplified-only announcements were absent from the sitemap in every locale.
 */
type Entry = {path: string; locales: readonly Locale[]};

function cmsEntries(
  prefix: string,
  slugsByLocale: Record<Locale, string[]>
): Entry[] {
  const localesBySlug = new Map<string, Locale[]>();

  for (const locale of routing.locales) {
    for (const slug of slugsByLocale[locale] ?? []) {
      const list = localesBySlug.get(slug);
      if (list) list.push(locale);
      else localesBySlug.set(slug, [locale]);
    }
  }

  return [...localesBySlug].map(([slug, locales]) => ({
    path: `${prefix}/${slug}`,
    locales
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articleSlugs, announcementSlugs] = await Promise.all([
    getAcademyArticleSlugsByLocale(),
    getAnnouncementSlugsByLocale()
  ]);

  const entries: Entry[] = [
    ...staticPaths.map((path) => ({path, locales: routing.locales})),
    ...cmsEntries('/academy', articleSlugs),
    ...cmsEntries('/announcements', announcementSlugs)
  ];

  return entries.flatMap(({path, locales}) =>
    locales.map((locale) => ({
      url: `${siteUrl}/${locale}${path}`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, `${siteUrl}/${l}${path}`]))
      }
    }))
  );
}
