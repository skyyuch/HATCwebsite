'use client';

import {
  formatChangePercent,
  formatPrice,
  type LiveQuote
} from '@/lib/marketQuoteTypes';
import {
  useLiveQuote,
  useLiveQuotes
} from '@/components/market/LiveQuotesProvider';
import {cn} from '@/lib/utils';

export type ConditionRow = {
  key: string;
  /** localized product name */
  name: string;
  /** symbol as displayed on the site, e.g. XAU/USD */
  symbol: string;
  /** symbol used by the quote gateway, e.g. XAUUSD */
  gatewaySymbol: string;
  /** approved lowest spread, already formatted ("20 點起") */
  spread: string;
  leverage: string;
  platform: string;
};

export type ConditionLabels = {
  product: string;
  price: string;
  change: string;
  spread: string;
  leverage: string;
  platform: string;
  /** shown only while real quotes are flowing */
  liveLabel: string;
  sourceNote: string;
};

/**
 * Approved trading conditions, with live MT5 prices layered on top when the
 * feed answers.
 *
 * The price/change columns exist only while real quotes are available: the
 * server always renders the conditions-only table (so the page stays static and
 * hydration matches), and this component adds the live columns after the first
 * successful poll. When the feed is down the columns disappear again rather
 * than falling back to placeholder prices — a quote is either real and labelled
 * 「即時報價」, or absent.
 */
export default function ConditionsTable({
  rows,
  labels
}: {
  rows: ConditionRow[];
  labels: ConditionLabels;
}) {
  const live = useLiveQuotes() !== null;

  return (
    <>
      <div className="overflow-x-auto rounded-[12px] border border-[var(--trd-border)]">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="bg-[var(--trd-navy)] text-sm font-semibold text-white">
              <th scope="col" className="px-5 py-4">
                {labels.product}
              </th>
              {live ? (
                <>
                  <th scope="col" className="px-5 py-4 text-right">
                    <span className="inline-flex items-center gap-2">
                      <span
                        aria-hidden
                        className="size-1.5 rounded-full bg-[var(--trd-up)]"
                      />
                      {labels.price}
                    </span>
                  </th>
                  <th scope="col" className="px-5 py-4 text-right">
                    {labels.change}
                  </th>
                </>
              ) : null}
              <th scope="col" className="px-5 py-4 text-right">
                {labels.spread}
              </th>
              <th scope="col" className="px-5 py-4 text-right">
                {labels.leverage}
              </th>
              <th scope="col" className="px-5 py-4 text-right">
                {labels.platform}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.key}
                className={cn(
                  'border-t border-[var(--trd-border)]',
                  i % 2 === 1 && 'bg-[var(--trd-row-alt)]'
                )}
              >
                <th scope="row" className="px-5 py-4 text-left">
                  <span className="block text-base font-bold text-[var(--trd-heading)]">
                    {row.name}
                  </span>
                  <span className="block text-xs text-[var(--trd-body)]">
                    {row.symbol}
                  </span>
                </th>
                {live ? <PriceCells symbol={row.gatewaySymbol} /> : null}
                <td className="px-5 py-4 text-right text-base font-semibold text-[var(--trd-gold)]">
                  {row.spread}
                </td>
                <td className="px-5 py-4 text-right text-sm font-semibold text-[var(--trd-heading)]">
                  {row.leverage}
                </td>
                <td className="px-5 py-4 text-right text-sm text-[var(--trd-body)]">
                  {row.platform}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {live ? (
        <p className="text-xs text-[var(--trd-muted)]">
          {labels.liveLabel} · {labels.sourceNote}
        </p>
      ) : null}
    </>
  );
}

/** Live price + change for one product; dashes while that symbol lags behind. */
function PriceCells({symbol}: {symbol: string}) {
  const quote: LiveQuote | null = useLiveQuote(symbol);
  const change = quote ? formatChangePercent(quote) : null;
  const rising = (quote?.change ?? 0) >= 0;

  return (
    <>
      <td className="px-5 py-4 text-right font-[family-name:var(--font-ticker)] text-base font-semibold text-[var(--trd-navy)]">
        {quote ? formatPrice(quote.bid, quote.digits) : '—'}
      </td>
      <td
        className={cn(
          'px-5 py-4 text-right font-[family-name:var(--font-ticker)] text-sm font-semibold',
          rising ? 'text-[var(--trd-up)]' : 'text-[var(--trd-down)]'
        )}
      >
        {change ?? '—'}
      </td>
    </>
  );
}
