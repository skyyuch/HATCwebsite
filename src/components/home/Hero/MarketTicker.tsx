'use client';

import {formatChange, formatPrice} from '@/lib/marketQuoteTypes';
import FlashOnChange from '@/components/market/FlashOnChange';
import {useLiveQuotes} from '@/components/market/LiveQuotesProvider';
import {SAMPLE_TICKER} from '../sampleMarketData';

/**
 * Hero market ticker. Renders real gateway quotes once the live feed answers,
 * otherwise the clearly-labelled sample quotes. Inter powers the numbers; a
 * subtle top border separates it from the hero. Horizontally scrollable on
 * small screens so all quotes stay reachable.
 */
export default function MarketTicker({
  sampleLabel,
  liveLabel
}: {
  sampleLabel: string;
  liveLabel: string;
}) {
  const live = useLiveQuotes();

  const rows = live
    ? live.map((quote) => ({
        symbol: quote.display,
        value: formatPrice(quote.bid, quote.digits),
        bid: quote.bid,
        change: formatChange(quote),
        up: (quote.change ?? 0) >= 0
      }))
    : SAMPLE_TICKER.map((quote) => ({
        symbol: quote.symbol,
        value: quote.value,
        bid: null,
        change: quote.change,
        up: quote.dir === 'up'
      }));

  return (
    <div className="relative border-t border-[color:rgba(51,56,71,0.5)] bg-[var(--fig-ticker-bg)] backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-4 overflow-x-auto px-6 sm:justify-center sm:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {rows.map((q, i) => (
          <div key={q.symbol} className="flex items-center gap-4">
            {i > 0 ? (
              <span
                aria-hidden
                className="h-6 w-px bg-[color:rgba(64,69,82,0.6)]"
              />
            ) : null}
            <div className="flex shrink-0 items-baseline gap-2 font-[family-name:var(--font-ticker)]">
              <span className="text-xs text-[#8c94a1]">{q.symbol}</span>
              <FlashOnChange
                value={q.bid}
                className="text-[13px] font-semibold text-[#ebedf2]"
              >
                {q.value}
              </FlashOnChange>
              {q.change ? (
                <span
                  className={
                    q.up
                      ? 'text-xs text-[var(--fig-up-ticker)]'
                      : 'text-xs text-[var(--fig-down)]'
                  }
                >
                  {q.change}
                </span>
              ) : null}
            </div>
          </div>
        ))}
        <span className="shrink-0 whitespace-nowrap pl-1 text-[10px] text-[#666b75]">
          {live ? liveLabel : sampleLabel}
        </span>
      </div>
    </div>
  );
}
