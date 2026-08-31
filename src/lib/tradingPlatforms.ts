import 'server-only';

import {unstable_cache} from 'next/cache';

import type {Locale} from '@/i18n/routing';
import {CACHE_TAGS} from '@/lib/cacheTags';
import {getPayloadClient, hasDb} from '@/lib/payload';

export type TradingPlatform = {
  id: string;
  name: string;
  panelLabel: string;
  tagline: string;
  desc: string;
  /** CMS-uploaded screenshot URL; undefined = front-end uses a Figma sample mockup. */
  visual?: string;
  order: number;
};

/** Extract a usable URL from a Payload upload field (populated object or empty). */
function mediaUrl(value: unknown): string | undefined {
  if (value && typeof value === 'object' && 'url' in value) {
    const url = (value as {url?: unknown}).url;
    if (typeof url === 'string' && url.trim()) return url;
  }
  return undefined;
}

type PlatformSeed = {
  name?: string;
  panelLabel?: string;
  tagline?: string;
  desc?: string;
};

/**
 * i18n seed fallback (`platforms.types.items`).
 */
async function getTradingPlatformsFallback(
  locale: Locale
): Promise<TradingPlatform[]> {
  const messages = (await import(`../messages/${locale}.json`)).default as {
    platforms?: {types?: {items?: PlatformSeed[]}};
  };

  const rows = messages.platforms?.types?.items ?? [];

  return rows
    .filter((row) => row.name)
    .map((row, index) => ({
      id: `seed-${index}`,
      name: row.name ?? '',
      panelLabel: row.panelLabel ?? '',
      tagline: row.tagline ?? '',
      desc: row.desc ?? '',
      order: index
    }));
}

async function fetchTradingPlatformsFromDb(
  locale: Locale
): Promise<TradingPlatform[]> {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: 'trading-platforms',
      locale,
      where: {enabled: {equals: true}},
      sort: 'order',
      depth: 1,
      limit: 50
    });

    if (res.docs.length === 0) {
      return getTradingPlatformsFallback(locale);
    }

    return res.docs.map((doc) => ({
      id: String(doc.id),
      name: (doc.name as string) || '',
      panelLabel: (doc.panelLabel as string) || '',
      tagline: (doc.tagline as string) || '',
      desc: (doc.desc as string) || '',
      visual: mediaUrl(doc.visual),
      order: (doc.order as number) ?? 0
    }));
  } catch {
    return getTradingPlatformsFallback(locale);
  }
}

const getTradingPlatformsCached = unstable_cache(
  async (locale: Locale) => fetchTradingPlatformsFromDb(locale),
  ['trading-platforms'],
  {tags: [CACHE_TAGS.tradingPlatforms]}
);

/**
 * Platform tab cards for `/platforms`. DB when configured; otherwise the i18n
 * seed. Empty CMS list also falls back to the seed.
 */
export async function getTradingPlatforms(
  locale: Locale
): Promise<TradingPlatform[]> {
  if (!hasDb()) {
    return getTradingPlatformsFallback(locale);
  }
  return getTradingPlatformsCached(locale);
}
