'use client';

import {useMemo, useState} from 'react';
import {
  MARKET_SYMBOLS,
  formatPrice,
  withLiveCandle,
  type LiveQuote,
  type MarketSymbol
} from '@/lib/marketQuoteTypes';
import {useLiveQuotes} from '@/components/market/LiveQuotesProvider';
import useDailyBars from '@/components/market/useDailyBars';
import ServiceChart from './ServiceChart';
import ServicePriceCards from './ServicePriceCards';

/**
 * Market column of the gold-services section: daily candles + price cards.
 *
 * The cards pick which product the chart draws, and the selected product's
 * live tick re-prices the current day's candle and the chart's price marker,
 * so the chart tracks the market between bar polls.
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
    chartTitles: Record<MarketSymbol, string>;
    chartDaily: string;
    chartUnavailable: string;
    sampleLabel: string;
    liveLabel: string;
    sourceNote: string;
    pickerLabel: string;
    names: Record<MarketSymbol, string>;
  };
}) {
  const [selected, setSelected] = useState<MarketSymbol>(
    MARKET_SYMBOLS[0].symbol
  );

  const liveQuotes = useLiveQuotes();
  const quotes = useMemo(() => {
    const bySymbol = new Map<string, LiveQuote>();
    for (const quote of liveQuotes ?? []) bySymbol.set(quote.symbol, quote);
    return bySymbol;
  }, [liveQuotes]);

  const selectedQuote = quotes.get(selected) ?? null;
  const polledBars = useDailyBars(selected);
  const bars = useMemo(
    () => (polledBars ? withLiveCandle(polledBars, selectedQuote) : null),
    [polledBars, selectedQuote]
  );

  const live = Boolean(liveQuotes || bars);
  const currentPrice = selectedQuote
    ? {
        value: selectedQuote.bid,
        label: formatPrice(selectedQuote.bid, selectedQuote.digits)
      }
    : null;

  return (
    <div className="flex flex-col gap-5">
      <ServiceChart
        bars={bars}
        live={live}
        currentPrice={currentPrice}
        locale={locale}
        labels={{
          title: labels.chartTitles[selected],
          daily: labels.chartDaily,
          sample: labels.sampleLabel,
          unavailable: labels.chartUnavailable
        }}
      />

      <ServicePriceCards
        names={labels.names}
        quotes={quotes}
        selected={selected}
        onSelect={setSelected}
        groupLabel={labels.pickerLabel}
      />

      <p className="text-[11px] leading-relaxed text-[var(--fig-text-muted)]">
        {live
          ? `${labels.liveLabel} · ${labels.sourceNote}`
          : labels.sampleLabel}
      </p>
    </div>
  );
}
