import 'server-only';

import {unstable_cache} from 'next/cache';

import type {Locale} from '@/i18n/routing';
import {CACHE_TAGS} from '@/lib/cacheTags';
import {getPayloadClient, hasDb} from '@/lib/payload';

export type FundingType = 'deposit' | 'withdrawal';

export type FundingMethodRow = {
  id: string;
  method: string;
  time: string;
  fee: string;
  free: boolean;
  currencies: string;
  order: number;
};

type SampleRow = {
  method?: string;
  time?: string;
  fee?: string;
  free?: boolean;
  currencies?: string;
};

// i18n groups deposit/withdrawal samples under different keys.
const SAMPLE_KEY: Record<FundingType, 'deposit' | 'withdraw'> = {
  deposit: 'deposit',
  withdrawal: 'withdraw'
};

/**
 * i18n seed fallback (`funding.{deposit,withdraw}.methodsSample`). SAMPLE rows
 * only — the UI keeps the「示意數據」label; these are not approved facts or
 * delivery guarantees.
 */
async function getFundingMethodsFallback(
  locale: Locale,
  type: FundingType
): Promise<FundingMethodRow[]> {
  const messages = (await import(`../messages/${locale}.json`)).default as {
    funding?: {
      deposit?: {methodsSample?: SampleRow[]};
      withdraw?: {methodsSample?: SampleRow[]};
    };
  };

  const rows = messages.funding?.[SAMPLE_KEY[type]]?.methodsSample ?? [];

  return rows
    .filter((row) => row.method)
    .map((row, index) => ({
      id: `seed-${type}-${index}`,
      method: row.method ?? '',
      time: row.time ?? '',
      fee: row.fee ?? '',
      free: Boolean(row.free),
      currencies: row.currencies ?? '',
      order: index
    }));
}

async function fetchFundingMethodsFromDb(
  locale: Locale,
  type: FundingType
): Promise<FundingMethodRow[]> {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: 'funding-methods',
      locale,
      where: {
        and: [{enabled: {equals: true}}, {type: {equals: type}}]
      },
      sort: 'order',
      limit: 50
    });

    if (res.docs.length === 0) {
      return getFundingMethodsFallback(locale, type);
    }

    return res.docs.map((doc) => ({
      id: String(doc.id),
      method: (doc.method as string) || '',
      time: (doc.time as string) || '',
      fee: (doc.fee as string) || '',
      free: Boolean(doc.free),
      currencies: (doc.currencies as string) || '',
      order: (doc.order as number) ?? 0
    }));
  } catch {
    return getFundingMethodsFallback(locale, type);
  }
}

const getFundingMethodsCached = unstable_cache(
  async (locale: Locale, type: FundingType) =>
    fetchFundingMethodsFromDb(locale, type),
  ['funding-methods'],
  {tags: [CACHE_TAGS.fundingMethods]}
);

/**
 * Sample deposit / withdrawal channels for `/funding`. DB when configured;
 * otherwise the i18n SAMPLE seed. Empty CMS list also falls back to the seed.
 */
export async function getFundingMethods(
  locale: Locale,
  type: FundingType
): Promise<FundingMethodRow[]> {
  if (!hasDb()) {
    return getFundingMethodsFallback(locale, type);
  }
  return getFundingMethodsCached(locale, type);
}
