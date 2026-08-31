import 'server-only';

import {unstable_cache} from 'next/cache';

import type {Locale} from '@/i18n/routing';
import {CACHE_TAGS} from '@/lib/cacheTags';
import {getPayloadClient, hasDb} from '@/lib/payload';

export type AccountTier = {
  id: string;
  code: string;
  badge: string;
  popular: boolean;
  name: string;
  desc: string;
  minDeposit: string;
  spread: string;
  commission: string;
  leverage: string;
  execution: string;
  platform: string;
  order: number;
};

type SampleTier = {
  key?: string;
  code?: string;
  badge?: string;
  popular?: boolean;
  name?: string;
  desc?: string;
  minDeposit?: string;
  spread?: string;
  commission?: string;
  leverage?: string;
  execution?: string;
  platform?: string;
};

/**
 * i18n seed fallback (`accounts.tiersSample`). These are clearly SAMPLE cards
 * (the UI keeps the「示意數據」label). No approved facts are duplicated here —
 * approved conditions live in `tradingConditions.ts`.
 */
async function getAccountTiersFallback(locale: Locale): Promise<AccountTier[]> {
  const messages = (await import(`../messages/${locale}.json`)).default as {
    accounts?: {tiersSample?: SampleTier[]};
  };

  const rows = messages.accounts?.tiersSample ?? [];

  return rows
    .filter((row) => row.name && row.code)
    .map((row, index) => ({
      id: `seed-${index}`,
      code: row.code ?? '',
      badge: row.badge ?? '',
      popular: Boolean(row.popular),
      name: row.name ?? '',
      desc: row.desc ?? '',
      minDeposit: row.minDeposit ?? '',
      spread: row.spread ?? '',
      commission: row.commission ?? '',
      leverage: row.leverage ?? '',
      execution: row.execution ?? '',
      platform: row.platform ?? '',
      order: index
    }));
}

async function fetchAccountTiersFromDb(locale: Locale): Promise<AccountTier[]> {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: 'account-tiers',
      locale,
      where: {enabled: {equals: true}},
      sort: 'order',
      limit: 50
    });

    if (res.docs.length === 0) {
      return getAccountTiersFallback(locale);
    }

    return res.docs.map((doc) => ({
      id: String(doc.id),
      code: (doc.code as string) || '',
      badge: (doc.badge as string) || '',
      popular: Boolean(doc.popular),
      name: (doc.name as string) || '',
      desc: (doc.desc as string) || '',
      minDeposit: (doc.minDeposit as string) || '',
      spread: (doc.spread as string) || '',
      commission: (doc.commission as string) || '',
      leverage: (doc.leverage as string) || '',
      execution: (doc.execution as string) || '',
      platform: (doc.platform as string) || '',
      order: (doc.order as number) ?? 0
    }));
  } catch {
    return getAccountTiersFallback(locale);
  }
}

const getAccountTiersCached = unstable_cache(
  async (locale: Locale) => fetchAccountTiersFromDb(locale),
  ['account-tiers'],
  {tags: [CACHE_TAGS.accountTiers]}
);

/**
 * Account tiers for `/accounts`. DB when configured; otherwise the i18n SAMPLE
 * seed. Empty CMS list also falls back to the seed.
 */
export async function getAccountTiers(locale: Locale): Promise<AccountTier[]> {
  if (!hasDb()) {
    return getAccountTiersFallback(locale);
  }
  return getAccountTiersCached(locale);
}
