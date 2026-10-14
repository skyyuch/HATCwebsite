import {
  formatChangePercent,
  formatPrice,
  type LiveQuote
} from '@/lib/marketQuoteTypes';
import FlashOnChange from '@/components/market/FlashOnChange';
import {SAMPLE_PRICE_CARDS} from '../sampleMarketData';

/**
 * Loco gold/silver price cards. Real gateway quotes when the feed is up, the
 * labelled sample figures otherwise. The section-level label
 * (ServiceMarketPanel) states which of the two is on screen.
 */
export default function ServicePriceCards({
  names,
  quotes
}: {
  names: {gold: string; silver: string};
  quotes: {gold: LiveQuote | null; silver: LiveQuote | null};
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {SAMPLE_PRICE_CARDS.map((card) => (
        <PriceCard
          key={card.symbol}
          symbol={card.symbol}
          name={names[card.nameKey]}
          quote={quotes[card.nameKey]}
          sampleValue={card.value}
          sampleChange={card.change}
        />
      ))}
    </div>
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
      <div className="mt-3">
        <FlashOnChange
          value={quote?.bid ?? null}
          className="inline-block font-[family-name:var(--font-ticker)] text-[22px] font-bold text-gold"
        >
          {value}
        </FlashOnChange>
      </div>
    </div>
  );
}
