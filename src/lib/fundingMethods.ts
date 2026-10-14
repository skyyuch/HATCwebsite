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
    return [];
  }
}

const getFundingMethodsCached = unstable_cache(
  async (locale: Locale, type: FundingType) =>
    fetchFundingMethodsFromDb(locale, type),
  ['funding-methods'],
  {tags: [CACHE_TAGS.fundingMethods]}
);

/**
 * Deposit / withdrawal channels for `/funding`, from the CMS only.
 *
 * 🚩 **No i18n fallback on purpose (第六十九輪).** These rows are the owner's real
 * channels and the front-end no longer labels them「示意數據」, so there is nothing
 * safe to substitute: the retired i18n seed listed Figma-template providers HATC
 * does not offer (Neteller, Skrill, JCB…), which unlabelled would read as fact.
 * No DB / read failure / empty list all return `[]`, and `FundingMethods` then
 * renders nothing — the same "no data → stay silent" rule as testimonials and news.
 */
export async function getFundingMethods(
  locale: Locale,
  type: FundingType
): Promise<FundingMethodRow[]> {
  if (!hasDb()) {
    return [];
  }
  return getFundingMethodsCached(locale, type);
}
