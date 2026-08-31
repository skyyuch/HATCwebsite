import 'server-only';

import {unstable_cache} from 'next/cache';

import type {Locale} from '@/i18n/routing';
import {CACHE_TAGS} from '@/lib/cacheTags';
import {getPayloadClient, hasDb} from '@/lib/payload';

/** Display categories, in the order they render on `/products/all`. */
export const INSTRUMENT_CATEGORIES = [
  'metals',
  'forex',
  'indices',
  'energy',
  'other'
] as const;

export type InstrumentCategory = (typeof INSTRUMENT_CATEGORIES)[number];

export type Instrument = {
  id: string;
  name: string;
  symbol: string;
  category: InstrumentCategory;
  contractSize: string;
  spread: string;
  leverage: string;
  tradingHours: string;
  order: number;
};

type SampleRow = {
  symbol: string;
  name: string;
  category?: InstrumentCategory;
  contractSize?: string;
  spread?: string;
  leverage?: string;
  tradingHours?: string;
};

function toCategory(value: unknown): InstrumentCategory {
  return INSTRUMENT_CATEGORIES.includes(value as InstrumentCategory)
    ? (value as InstrumentCategory)
    : 'metals';
}

/**
 * i18n seed fallback. These are clearly SAMPLE rows (the UI keeps the「示意數據」
 * label). No approved facts are duplicated here — approved spreads/leverage live
 * in `tradingConditions.ts`.
 */
async function getInstrumentsFallback(locale: Locale): Promise<Instrument[]> {
  const messages = (await import(`../messages/${locale}.json`)).default as {
    productsAll?: {sample?: {rows?: SampleRow[]}};
  };

  const rows = messages.productsAll?.sample?.rows ?? [];

  return rows
    .filter((row) => row.symbol && row.name)
    .map((row, index) => ({
      id: `seed-${index}`,
      name: row.name,
      symbol: row.symbol,
      category: toCategory(row.category),
      contractSize: row.contractSize ?? '',
      spread: row.spread ?? '',
      leverage: row.leverage ?? '',
      tradingHours: row.tradingHours ?? '',
      order: index
    }));
}

async function fetchInstrumentsFromDb(locale: Locale): Promise<Instrument[]> {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: 'instruments',
      locale,
      where: {enabled: {equals: true}},
      sort: 'order',
      limit: 200
    });

    if (res.docs.length === 0) {
      return getInstrumentsFallback(locale);
    }

    return res.docs.map((doc) => ({
      id: String(doc.id),
      name: (doc.name as string) || '',
      symbol: (doc.symbol as string) || '',
      category: toCategory(doc.category),
      contractSize: (doc.contractSize as string) || '',
      spread: (doc.spread as string) || '',
      leverage: (doc.leverage as string) || '',
      tradingHours: (doc.tradingHours as string) || '',
      order: (doc.order as number) ?? 0
    }));
  } catch {
    return getInstrumentsFallback(locale);
  }
}

const getInstrumentsCached = unstable_cache(
  async (locale: Locale) => fetchInstrumentsFromDb(locale),
  ['instruments'],
  {tags: [CACHE_TAGS.instruments]}
);

/**
 * All tradeable products for `/products/all`. DB when configured; otherwise the
 * i18n SAMPLE seed. Empty CMS list also falls back to the seed.
 */
export async function getInstruments(locale: Locale): Promise<Instrument[]> {
  if (!hasDb()) {
    return getInstrumentsFallback(locale);
  }
  return getInstrumentsCached(locale);
}

/** Group instruments by category, preserving display order and dropping empties. */
export function groupInstruments(
  items: Instrument[]
): {category: InstrumentCategory; items: Instrument[]}[] {
  return INSTRUMENT_CATEGORIES.map((category) => ({
    category,
    items: items.filter((item) => item.category === category)
  })).filter((group) => group.items.length > 0);
}
