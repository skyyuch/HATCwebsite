import {SAMPLE_TICKER} from '../sampleMarketData';

/**
 * Hero market ticker — SAMPLE quotes only (clearly labelled "示意數據").
 * Inter powers the numbers; a subtle top border separates it from the hero.
 * Horizontally scrollable on small screens so all quotes stay reachable.
 */
export default function MarketTicker({sampleLabel}: {sampleLabel: string}) {
  return (
    <div className="relative border-t border-[color:rgba(51,56,71,0.5)] bg-[var(--fig-ticker-bg)] backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-4 overflow-x-auto px-6 sm:justify-center sm:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SAMPLE_TICKER.map((q, i) => (
          <div key={q.symbol} className="flex items-center gap-4">
            {i > 0 ? (
              <span
                aria-hidden
                className="h-6 w-px bg-[color:rgba(64,69,82,0.6)]"
              />
            ) : null}
            <div className="flex shrink-0 items-baseline gap-2 font-[family-name:var(--font-ticker)]">
              <span className="text-xs text-[#8c94a1]">{q.symbol}</span>
              <span className="text-[13px] font-semibold text-[#ebedf2]">
                {q.value}
              </span>
              <span
                className={
                  q.dir === 'up'
                    ? 'text-xs text-[var(--fig-up-ticker)]'
                    : 'text-xs text-[var(--fig-down)]'
                }
              >
                {q.change}
              </span>
            </div>
          </div>
        ))}
        <span className="shrink-0 whitespace-nowrap pl-1 text-[10px] text-[#666b75]">
          {sampleLabel}
        </span>
      </div>
    </div>
  );
}
