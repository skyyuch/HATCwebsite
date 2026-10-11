'use client';

import {MARKET_SYMBOLS} from '@/lib/marketQuoteTypes';
import {useLiveQuote} from '@/components/market/LiveQuotesProvider';
import useDailyBars from '@/components/market/useDailyBars';
import ServiceChart from './ServiceChart';
import ServicePriceCards from './ServicePriceCards';

const [GOLD, SILVER] = MARKET_SYMBOLS;

/**
 * Market column of the gold-services section: daily candles + price cards.
 *
 * Both widgets read the same gateway, so the source label lives here once:
 * real data gets "live quotes" plus the feed disclaimer, otherwise the
 * "sample data" label covers the Figma placeholder figures.
 */
export default function ServiceMarketPanel({
  locale,
  labels
}: {
  locale: string;
  labels: {
    chartSymbol: string;
    chartDaily: string;
    chartUnavailable: string;
    sampleLabel: string;
    liveLabel: string;
    sourceNote: string;
    names: {gold: string; silver: string};
  };
}) {
  // Fixed symbol set, so these hooks always run in the same order.
  const goldQuote = useLiveQuote(GOLD.symbol);
  const silverQuote = useLiveQuote(SILVER.symbol);
  const bars = useDailyBars(GOLD.symbol);
  const live = Boolean(goldQuote || silverQuote || bars);

  return (
    <div className="flex flex-col gap-5">
      <ServiceChart
        bars={bars}
        live={live}
        locale={locale}
        labels={{
          symbol: labels.chartSymbol,
          daily: labels.chartDaily,
          sample: labels.sampleLabel,
          unavailable: labels.chartUnavailable
        }}
      />

      <ServicePriceCards
        names={labels.names}
        quotes={{gold: goldQuote, silver: silverQuote}}
      />

      <p className="text-[11px] leading-relaxed text-[var(--fig-text-muted)]">
        {live
          ? `${labels.liveLabel} · ${labels.sourceNote}`
          : labels.sampleLabel}
      </p>
    </div>
  );
}
