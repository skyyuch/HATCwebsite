'use client';

import {
  formatChangePercent,
  formatPrice,
  MARKET_SYMBOLS,
  type LiveQuote
} from '@/lib/marketQuoteTypes';
import {useLiveQuote} from '@/components/market/LiveQuotesProvider';
import {SAMPLE_PRICE_CARDS} from '../sampleMarketData';

const [GOLD, SILVER] = MARKET_SYMBOLS;

/**
 * Loco gold/silver price cards. Real gateway quotes when the feed is up, the
 * labelled sample figures otherwise.
 */
export default function ServicePriceCards({
  names,
  sampleLabel,
  liveLabel
}: {
  names: {gold: string; silver: string};
  sampleLabel: string;
  liveLabel: string;
}) {
  // Fixed symbol set, so these hooks always run in the same order.
  const goldQuote = useLiveQuote(GOLD.symbol);
  const silverQuote = useLiveQuote(SILVER.symbol);
  const quoteByKey = {gold: goldQuote, silver: silverQuote};
  const live = Boolean(goldQuote || silverQuote);

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        {SAMPLE_PRICE_CARDS.map((card) => (
          <PriceCard
            key={card.symbol}
            symbol={card.symbol}
            name={names[card.nameKey]}
            quote={quoteByKey[card.nameKey]}
            sampleValue={card.value}
            sampleChange={card.change}
          />
        ))}
      </div>
      <p className="text-[11px] text-[var(--fig-text-muted)]">
        {live ? liveLabel : sampleLabel}
      </p>
    </>
  );
}

function PriceCard({
  symbol,
  name,
  quote,
  sampleValue,
  sampleChange
}: {
  symbol: string;
  name: string;
  quote: LiveQuote | null;
  sampleValue: string;
  sampleChange: string;
}) {
  const value = quote ? formatPrice(quote.bid, quote.digits) : sampleValue;
  const change = quote ? formatChangePercent(quote) : sampleChange;
  const rising = quote ? (quote.change ?? 0) >= 0 : true;

  return (
    <div className="rounded-lg border border-[var(--fig-border)] bg-[var(--fig-surface)] p-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">{symbol}</span>
          <span className="text-xs text-[var(--fig-text-dim)]">{name}</span>
        </div>
        {change ? (
          <span
            className={
              rising
                ? 'rounded-[4px] bg-[rgba(16,185,129,0.1)] px-2 py-1 text-xs font-semibold text-[var(--fig-up)]'
                : 'rounded-[4px] bg-[rgba(239,68,68,0.1)] px-2 py-1 text-xs font-semibold text-[var(--fig-down)]'
            }
          >
            {change}
          </span>
        ) : null}
      </div>
      <div className="mt-3 font-[family-name:var(--font-ticker)] text-[22px] font-bold text-gold">
        {value}
      </div>
    </div>
  );
}
