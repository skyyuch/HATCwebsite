import 'server-only';

import {unstable_cache} from 'next/cache';

import type {Locale} from '@/i18n/routing';
import {
  ACCOUNT_ROWS,
  PRICING_ROWS,
  type AccountCell,
  type AccountRow,
  type PricingRow
} from '@/components/trading/sampleTradingData';
import {CACHE_TAGS} from '@/lib/cacheTags';
import {loadMessages, msgString, pickText} from '@/lib/copyPick';
import {getPayloadClient, hasDb} from '@/lib/payload';
import type {SampleTradingCondition} from '@/payload-types';

/**
 * SAMPLE trading tables for /trading.
 *
 * Source = Payload `sample-trading-conditions` when DB is set and arrays are
 * non-empty; otherwise `sampleTradingData.ts` seeds. Always labelled「示意數據」
 * in the UI. Approved gold27/silver30/1:100 live only in
 * `products/tradingConditions.ts` and are never read from this CMS global.
 */

export type ResolvedAccountCell =
  | {type: 'pending'}
  | {type: 'text'; value: string}
  | {type: 'check'}
  | {type: 'priority'}
  | {type: 'dash'};

export type ResolvedAccountRow = {
  key: string;
  standard: ResolvedAccountCell;
  professional: ResolvedAccountCell;
};

export type SampleTradingTables = {
  pricingRows: PricingRow[];
  accountRows: ResolvedAccountRow[];
};

type CmsCell = NonNullable<
  NonNullable<SampleTradingCondition['accountRows']>[number]['standard']
>;

function resolveSeedCell(
  cell: AccountCell,
  messages: Record<string, unknown>
): ResolvedAccountCell {
  switch (cell.type) {
    case 'text':
      return {
        type: 'text',
        value: msgString(messages, `trading.accounts.${cell.key}`)
      };
    case 'pending':
      return {type: 'pending'};
    case 'check':
      return {type: 'check'};
    case 'priority':
      return {type: 'priority'};
    case 'dash':
      return {type: 'dash'};
  }
}

function resolveSeedRows(
  rows: ReadonlyArray<AccountRow>,
  messages: Record<string, unknown>
): ResolvedAccountRow[] {
  return rows.map((row) => ({
    key: row.key,
    standard: resolveSeedCell(row.standard, messages),
    professional: resolveSeedCell(row.professional, messages)
  }));
}

function resolveCmsCell(
  cell: CmsCell | null | undefined,
  messages: Record<string, unknown>
): ResolvedAccountCell {
  const type = cell?.type ?? 'pending';
  if (type === 'text') {
    const fromValue = pickText(cell?.value, '');
    if (fromValue) return {type: 'text', value: fromValue};
    const key =
      typeof cell?.textKey === 'string' && cell.textKey.trim()
        ? cell.textKey.trim()
        : '';
    if (key) {
      return {
        type: 'text',
        value: msgString(messages, `trading.accounts.${key}`)
      };
    }
    return {type: 'pending'};
  }
  if (type === 'check') return {type: 'check'};
  if (type === 'priority') return {type: 'priority'};
  if (type === 'dash') return {type: 'dash'};
  return {type: 'pending'};
}

async function fallbackTables(locale: Locale): Promise<SampleTradingTables> {
  const messages = await loadMessages(locale);
  return {
    pricingRows: [...PRICING_ROWS],
    accountRows: resolveSeedRows(ACCOUNT_ROWS, messages)
  };
}

async function fetchTables(locale: Locale): Promise<SampleTradingTables> {
  const base = await fallbackTables(locale);
  try {
    const payload = await getPayloadClient();
    const doc = await payload.findGlobal({
      slug: 'sample-trading-conditions',
      locale
    });

    const messages = await loadMessages(locale);
    let pricingRows = base.pricingRows;
    let accountRows = base.accountRows;

    const cmsPricing = doc.pricingRows ?? [];
    if (cmsPricing.length > 0) {
      pricingRows = cmsPricing
        .map((row): PricingRow | null => {
          const symbol = pickText(row.symbol, '');
          const bid = pickText(row.bid, '');
          const ask = pickText(row.ask, '');
          const spread = pickText(row.spread, '');
          const change = pickText(row.change, '');
          if (!symbol || !bid || !ask || !spread || !change) return null;
          return {
            symbol,
            nameKey: row.nameKey,
            bid,
            ask,
            spread,
            change
          };
        })
        .filter((row): row is PricingRow => row !== null);
      if (pricingRows.length === 0) {
        pricingRows = base.pricingRows;
      }
    }

    const cmsAccounts = doc.accountRows ?? [];
    if (cmsAccounts.length > 0) {
      accountRows = cmsAccounts
        .map((row): ResolvedAccountRow | null => {
          const key = pickText(row.rowKey, '');
          if (!key) return null;
          return {
            key,
            standard: resolveCmsCell(row.standard, messages),
            professional: resolveCmsCell(row.professional, messages)
          };
        })
        .filter((row): row is ResolvedAccountRow => row !== null);
      if (accountRows.length === 0) {
        accountRows = base.accountRows;
      }
    }

    return {pricingRows, accountRows};
  } catch {
    return base;
  }
}

const getSampleTradingTablesCached = unstable_cache(
  async (locale: Locale) => fetchTables(locale),
  ['sample-trading-conditions'],
  {tags: [CACHE_TAGS.sampleTradingConditions]}
);

export async function getSampleTradingTables(
  locale: Locale
): Promise<SampleTradingTables> {
  if (!hasDb()) {
    return fallbackTables(locale);
  }
  return getSampleTradingTablesCached(locale);
}
