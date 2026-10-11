import 'server-only';

import {unstable_cache} from 'next/cache';

import {CFD_PRODUCTS, type ProductKey} from '@/components/products/tradingConditions';
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
  /**
   * Key into CFD_PRODUCTS when this row is one of the approved products, so
   * the table can render its APPROVED contract size / spread / leverage /
   * hours. `null` for a CMS-only row, whose conditions render as pending.
   */
  productKey: ProductKey | null;
  order: number;
};

function toCategory(value: unknown): InstrumentCategory {
  return INSTRUMENT_CATEGORIES.includes(value as InstrumentCategory)
    ? (value as InstrumentCategory)
    : 'metals';
}

/**
 * The approved products, in code order. Names come from the shared
 * `products.items.*` messages so `/products` and `/products/all` never drift.
 */
async function getApprovedRows(locale: Locale): Promise<Instrument[]> {
  const messages = (await import(`../messages/${locale}.json`)).default as {
    products?: {items?: Record<string, {name?: string}>};
  };
  const items = messages.products?.items ?? {};

  return CFD_PRODUCTS.map((product, index) => ({
    id: `product-${product.key}`,
    name: items[product.key]?.name ?? product.symbol,
    symbol: product.symbol,
    category: 'metals' as const,
    productKey: product.key,
    order: index
  }));
}

/**
 * Applies the CMS overlay. The collection owns presentation only — display
 * name, grouping, order and whether a row shows at all. It deliberately
 * cannot carry contract size / spread / leverage / hours, because those are
 * approved facts (docs/HATC_FACTS.md) and live in tradingConditions.ts.
 */
async function applyCmsOverlay(
  locale: Locale,
  approved: Instrument[]
): Promise<Instrument[]> {
  const payload = await getPayloadClient();
  const res = await payload.find({
    collection: 'instruments',
    locale,
    sort: 'order',
    limit: 200
  });

  const bySymbol = new Map(approved.map((row) => [row.symbol, row]));
  const extras: Instrument[] = [];

  res.docs.forEach((doc, index) => {
    const symbol = (doc.symbol as string) || '';
    const enabled = doc.enabled !== false;
    const base = bySymbol.get(symbol);

    if (base) {
      if (!enabled) {
        bySymbol.delete(symbol);
        return;
      }
      bySymbol.set(symbol, {
        ...base,
        name: (doc.name as string) || base.name,
        category: toCategory(doc.category),
        order: (doc.order as number) ?? base.order
      });
      return;
    }

    // A product the owner added in the CMS. It has no approved conditions, so
    // the table renders those cells as "將另行公佈" rather than inventing any.
    if (!enabled || !symbol || !doc.name) return;
    extras.push({
      id: String(doc.id),
      name: doc.name as string,
      symbol,
      category: toCategory(doc.category),
      productKey: null,
      order: (doc.order as number) ?? approved.length + index
    });
  });

  return [...bySymbol.values(), ...extras].sort((a, b) => a.order - b.order);
}

const getInstrumentsCached = unstable_cache(
  async (locale: Locale) => {
    const approved = await getApprovedRows(locale);
    try {
      return await applyCmsOverlay(locale, approved);
    } catch {
      return approved;
    }
  },
  ['instruments'],
  {tags: [CACHE_TAGS.instruments]}
);

/**
 * Rows for the `/products/all` table. The approved products always appear
 * (facts from code); the CMS only adjusts how they are presented and may add
 * further products that have no approved conditions yet.
 */
export async function getInstruments(locale: Locale): Promise<Instrument[]> {
  if (!hasDb()) {
    return getApprovedRows(locale);
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
