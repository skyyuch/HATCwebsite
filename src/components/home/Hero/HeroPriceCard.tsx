'use client';

import {
  formatChangePercent,
  formatPrice,
  MARKET_SYMBOLS
} from '@/lib/marketQuoteTypes';
import FlashOnChange from '@/components/market/FlashOnChange';
import {
  useLiveQuote,
  useQuoteHistory
} from '@/components/market/LiveQuotesProvider';
import {SAMPLE_HERO_PRICE, SAMPLE_SPARKLINE} from '../sampleMarketData';

const GOLD = MARKET_SYMBOLS[0];
/** Below this, the observed series is too short to draw a meaningful line. */
const MIN_SPARKLINE_POINTS = 3;

/**
 * Hero live-price card for spot gold. Shows real gateway quotes when the feed
 * is up (labelled "live") and the labelled sample figures otherwise.
 *
 * The sparkline is drawn from prices this session has actually observed, never
 * from the sample curve while real numbers are on screen — a real price next
 * to an invented trend line would misrepresent the market.
 */
export default function HeroPriceCard({
  title,
  sampleLabel,
  liveLabel,
  highLabel,
  lowLabel,
  sourceNote
}: {
  title: string;
  sampleLabel: string;
  liveLabel: string;
  highLabel: string;
  lowLabel: string;
  sourceNote: string;
}) {
  const quote = useLiveQuote(GOLD.symbol);
  const history = useQuoteHistory(GOLD.symbol);

  const value = quote
    ? formatPrice(quote.bid, quote.digits)
    : SAMPLE_HERO_PRICE.value;
  const change = quote ? formatChangePercent(quote) : SAMPLE_HERO_PRICE.change;
  const high =
    quote && quote.high !== null
      ? formatPrice(quote.high, quote.digits)
      : quote
        ? null
        : SAMPLE_HERO_PRICE.high;
  const low =
    quote && quote.low !== null
      ? formatPrice(quote.low, quote.digits)
      : quote
        ? null
        : SAMPLE_HERO_PRICE.low;
  const path = quote ? sparklinePath(history) : SAMPLE_SPARKLINE;
  const rising = quote ? (quote.change ?? 0) >= 0 : true;

  return (
    <div className="w-full max-w-[481px] justify-self-end rounded-2xl border border-[var(--fig-border)] bg-[rgba(17,22,37,0.8)] p-6 backdrop-blur-lg">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-gold">
          {title} {GOLD.display}
        </span>
        <span className="text-xs text-[var(--fig-text-dim)]">
          {quote ? liveLabel : sampleLabel}
        </span>
      </div>

      <div className="mt-5 flex items-end gap-3">
        <FlashOnChange
          value={quote?.bid ?? null}
          className="font-[family-name:var(--font-ticker)] text-[32px] font-extrabold leading-none text-white"
        >
          {value}
        </FlashOnChange>
        {change ? (
          <span
            className={
              rising
                ? 'pb-1 text-sm font-bold text-[var(--fig-up)]'
                : 'pb-1 text-sm font-bold text-[var(--fig-down)]'
            }
          >
            {change}
          </span>
        ) : null}
      </div>

      <svg
        aria-hidden
        viewBox="0 0 105 32"
        preserveAspectRatio="none"
        className="mt-5 h-12 w-full"
      >
        {path ? (
          <path
            d={path}
            fill="none"
            stroke="var(--fig-gold)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
      </svg>

      <div className="mt-5 flex justify-between border-t border-[var(--fig-border)] pt-4">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] text-[var(--fig-text-dim)]">
            {highLabel}
          </span>
          <span className="text-sm font-bold text-white">{high ?? '—'}</span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[11px] text-[var(--fig-text-dim)]">
            {lowLabel}
          </span>
          <span className="text-sm font-bold text-white">{low ?? '—'}</span>
        </div>
      </div>

      {quote ? (
        <p className="mt-4 text-[11px] leading-relaxed text-[var(--fig-text-dim)]">
          {sourceNote}
        </p>
      ) : null}
    </div>
  );
}

/** Maps an observed price series into the card's 105x32 sparkline viewBox. */
function sparklinePath(points: number[]): string | null {
  if (points.length < MIN_SPARKLINE_POINTS) return null;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min;
  const stepX = 105 / (points.length - 1);

  return points
    .map((price, index) => {
      const x = (index * stepX).toFixed(1);
      // A flat series (market closed) draws through the middle rather than
      // collapsing onto the baseline.
      const y = span > 0 ? (28 - ((price - min) / span) * 24).toFixed(1) : '16';
      return `${index === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');
}
