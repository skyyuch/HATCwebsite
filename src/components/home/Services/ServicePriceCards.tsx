'use client';

import {
  MARKET_SYMBOLS,
  formatChangePercent,
  formatPrice,
  type LiveQuote,
  type MarketSymbol
} from '@/lib/marketQuoteTypes';
import {cn} from '@/lib/utils';
import FlashOnChange from '@/components/market/FlashOnChange';
import {SAMPLE_PRICE_CARDS} from '../sampleMarketData';

/**
 * One card per approved CFD product. Real gateway quotes when the feed is up,
 * the labelled sample figures otherwise — the section-level label
 * (ServiceMarketPanel) states which of the two is on screen.
 *
 * The cards double as the chart's product picker, so the chart can only ever
 * show a symbol that is also priced here.
 */
export default function ServicePriceCards({
  names,
  quotes,
  selected,
  onSelect,
  groupLabel
}: {
  names: Record<MarketSymbol, string>;
  quotes: Map<string, LiveQuote>;
  selected: MarketSymbol;
  onSelect: (symbol: MarketSymbol) => void;
  groupLabel: string;
}) {
  return (
    <div
      role="group"
      aria-label={groupLabel}
      className="grid gap-4 sm:grid-cols-3"
    >
      {MARKET_SYMBOLS.map((entry) => (
        <PriceCard
          key={entry.symbol}
          display={entry.display}
          name={names[entry.symbol]}
          quote={quotes.get(entry.symbol) ?? null}
          sample={SAMPLE_PRICE_CARDS[entry.symbol]}
          selected={entry.symbol === selected}
          onSelect={() => onSelect(entry.symbol)}
        />
      ))}
    </div>
  );
}

function PriceCard({
  display,
  name,
  quote,
  sample,
  selected,
  onSelect
}: {
  display: string;
  name: string;
  quote: LiveQuote | null;
  sample: {value: string; change: string};
  selected: boolean;
  onSelect: () => void;
}) {
  const value = quote ? formatPrice(quote.bid, quote.digits) : sample.value;
  const change = quote ? formatChangePercent(quote) : sample.change;
  const rising = quote ? (quote.change ?? 0) >= 0 : true;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'cursor-pointer rounded-lg border bg-[var(--fig-surface)] p-4 text-left',
        'transition-colors focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-gold/60',
        selected
          ? 'border-gold ring-1 ring-gold/40'
          : 'border-[var(--fig-border)] hover:border-gold/40'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-col">
          <span className="text-sm font-semibold text-white">{display}</span>
          <span className="truncate text-xs text-[var(--fig-text-dim)]">
            {name}
          </span>
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
      <div className="mt-3">
        <FlashOnChange
          value={quote?.bid ?? null}
          className="inline-block font-[family-name:var(--font-ticker)] text-[22px] font-bold text-gold"
        >
          {value}
        </FlashOnChange>
      </div>
    </button>
  );
}
