import 'server-only';

import {unstable_cache} from 'next/cache';

import type {Locale} from '@/i18n/routing';
import {CACHE_TAGS} from '@/lib/cacheTags';
import {getPayloadClient, hasDb} from '@/lib/payload';

export type AccountSpreadRow = {
  id: string;
  pair: string;
  bid: string;
  ask: string;
  spread: string;
  order: number;
};

type SampleRow = {pair?: string; bid?: string; ask?: string; spread?: string};

/**
 * i18n seed fallback (`accounts.spreadsSample`). SAMPLE rows only — the UI keeps
 * the「示意數據」label. Approved average spreads live in `tradingConditions.ts`.
 */
async function getAccountSpreadsFallback(
  locale: Locale
): Promise<AccountSpreadRow[]> {
  const messages = (await import(`../messages/${locale}.json`)).default as {
    accounts?: {spreadsSample?: SampleRow[]};
  };

  const rows = messages.accounts?.spreadsSample ?? [];

  return rows
    .filter((row) => row.pair)
    .map((row, index) => ({
      id: `seed-${index}`,
      pair: row.pair ?? '',
      bid: row.bid ?? '',
      ask: row.ask ?? '',
      spread: row.spread ?? '',
      order: index
    }));
}

async function fetchAccountSpreadsFromDb(
  locale: Locale
): Promise<AccountSpreadRow[]> {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: 'account-spreads',
      locale,
      where: {enabled: {equals: true}},
      sort: 'order',
      limit: 50
    });

    if (res.docs.length === 0) {
      return getAccountSpreadsFallback(locale);
    }

    return res.docs.map((doc) => ({
      id: String(doc.id),
      pair: (doc.pair as string) || '',
      bid: (doc.bid as string) || '',
      ask: (doc.ask as string) || '',
      spread: (doc.spread as string) || '',
      order: (doc.order as number) ?? 0
    }));
  } catch {
    return getAccountSpreadsFallback(locale);
  }
}

const getAccountSpreadsCached = unstable_cache(
  async (locale: Locale) => fetchAccountSpreadsFromDb(locale),
  ['account-spreads'],
  {tags: [CACHE_TAGS.accountSpreads]}
);

/**
 * Sample spreads preview for `/accounts`. DB when configured; otherwise the i18n
 * SAMPLE seed. Empty CMS list also falls back to the seed.
 */
export async function getAccountSpreads(
  locale: Locale
): Promise<AccountSpreadRow[]> {
  if (!hasDb()) {
    return getAccountSpreadsFallback(locale);
  }
  return getAccountSpreadsCached(locale);
}
