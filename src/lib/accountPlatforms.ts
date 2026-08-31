import 'server-only';

import {unstable_cache} from 'next/cache';

import type {Locale} from '@/i18n/routing';
import {CACHE_TAGS} from '@/lib/cacheTags';
import {getPayloadClient, hasDb} from '@/lib/payload';

export type AccountPlatform = {
  id: string;
  name: string;
  desc: string;
  panelLabel: string;
  order: number;
};

// Default panel badges, applied by position when a doc/seed omits `panelLabel`.
const FALLBACK_PANEL_LABELS = ['MT4', 'MT5', 'TradingView'];

/**
 * i18n seed fallback (`accounts.platforms.items`). Panel badges are assigned by
 * position to match the original Figma order.
 */
async function getAccountPlatformsFallback(
  locale: Locale
): Promise<AccountPlatform[]> {
  const messages = (await import(`../messages/${locale}.json`)).default as {
    accounts?: {platforms?: {items?: {name?: string; desc?: string}[]}};
  };

  const rows = messages.accounts?.platforms?.items ?? [];

  return rows
    .filter((row) => row.name)
    .map((row, index) => ({
      id: `seed-${index}`,
      name: row.name ?? '',
      desc: row.desc ?? '',
      panelLabel: FALLBACK_PANEL_LABELS[index] ?? '',
      order: index
    }));
}

async function fetchAccountPlatformsFromDb(
  locale: Locale
): Promise<AccountPlatform[]> {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: 'account-platforms',
      locale,
      where: {enabled: {equals: true}},
      sort: 'order',
      limit: 50
    });

    if (res.docs.length === 0) {
      return getAccountPlatformsFallback(locale);
    }

    return res.docs.map((doc, index) => ({
      id: String(doc.id),
      name: (doc.name as string) || '',
      desc: (doc.desc as string) || '',
      panelLabel:
        (doc.panelLabel as string) || FALLBACK_PANEL_LABELS[index] || '',
      order: (doc.order as number) ?? 0
    }));
  } catch {
    return getAccountPlatformsFallback(locale);
  }
}

const getAccountPlatformsCached = unstable_cache(
  async (locale: Locale) => fetchAccountPlatformsFromDb(locale),
  ['account-platforms'],
  {tags: [CACHE_TAGS.accountPlatforms]}
);

/**
 * Supported-platform cards for `/accounts`. DB when configured; otherwise the
 * i18n seed. Empty CMS list also falls back to the seed.
 */
export async function getAccountPlatforms(
  locale: Locale
): Promise<AccountPlatform[]> {
  if (!hasDb()) {
    return getAccountPlatformsFallback(locale);
  }
  return getAccountPlatformsCached(locale);
}
