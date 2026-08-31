import 'server-only';

import {unstable_cache} from 'next/cache';

import type {Locale} from '@/i18n/routing';
import {CACHE_TAGS} from '@/lib/cacheTags';
import {getPayloadClient, hasDb} from '@/lib/payload';

/**
 * Homepage / news activity cards. Source of truth = Payload `home-activities`
 * (owner-editable, localised).
 *
 * DB→fallback pattern (CMS-first): when the database is not configured, or the
 * CMS list is empty / errors, we return `[]`. The front-end renders a **neutral
 * empty UI** from i18n chrome (`news.*`) — never fabricated promotions or
 * sample news items (governance: do not invent activities). Mirrors
 * `src/lib/faqs.ts` / `siteSettings.ts`, except FAQ has an approved i18n seed
 * and activities intentionally do not.
 */
export type HomeActivity = {
  id: string;
  tag?: string;
  title: string;
  summary?: string;
  href?: string;
  date?: string;
  imageUrl?: string;
};

async function fetchHomeActivitiesFromDb(locale: Locale): Promise<HomeActivity[]> {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: 'home-activities',
      locale,
      where: {enabled: {equals: true}},
      sort: 'order',
      depth: 1,
      limit: 50
    });

    return res.docs.map((doc) => {
      const image = doc.image;
      const imageUrl =
        image && typeof image === 'object' && 'url' in image
          ? (image.url as string) ?? undefined
          : undefined;
      return {
        id: String(doc.id),
        tag: (doc.tag as string) || undefined,
        title: (doc.title as string) || '',
        summary: (doc.summary as string) || undefined,
        href: (doc.href as string) || undefined,
        date: (doc.date as string) || undefined,
        imageUrl
      };
    }).filter((item) => item.title);
  } catch {
    return [];
  }
}

const getHomeActivitiesCached = unstable_cache(
  async (locale: Locale) => fetchHomeActivitiesFromDb(locale),
  ['home-activities'],
  {tags: [CACHE_TAGS.homeActivities]}
);

export async function getHomeActivities(locale: Locale): Promise<HomeActivity[]> {
  if (!hasDb()) return [];

  return getHomeActivitiesCached(locale);
}
