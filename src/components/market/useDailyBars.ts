'use client';

import {useEffect, useState} from 'react';
import type {MarketBar} from '@/lib/marketQuoteTypes';

/**
 * Daily OHLC bars for one market symbol, or null while no real series is
 * available (the caller must then draw no chart).
 *
 * Kept separate from LiveQuotesProvider because daily bars only move with the
 * current session's bar: polling them once a minute is enough, whereas the
 * quote widgets refresh every few seconds. The page stays static — the server
 * markup never contains bars and this hook fills them in after mount.
 */

const POLL_INTERVAL_MS = 60_000;
/**
 * Below this, the series is too short to read as a candlestick chart. It also
 * filters out the gateway's tick-derived fallback, which answers with only the
 * last day or two while its official chart feed warms up.
 */
const MIN_BARS = 5;

export default function useDailyBars(symbol: string): MarketBar[] | null {
  const [bars, setBars] = useState<MarketBar[] | null>(null);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function poll() {
      // Skip work while the tab is hidden; refreshed on visibilitychange.
      if (!document.hidden) {
        try {
          const response = await fetch(
            `/api/market/bars?symbol=${encodeURIComponent(symbol)}`,
            {cache: 'no-store'}
          );
          const body = (await response.json()) as
            | {ok: true; bars: MarketBar[]}
            | {ok: false};

          if (active) {
            setBars(
              body.ok && body.bars.length >= MIN_BARS ? body.bars : null
            );
          }
        } catch {
          // Network hiccup: keep the previous series and retry on the next tick.
        }
      }

      if (active) timer = setTimeout(poll, POLL_INTERVAL_MS);
    }

    function onVisibilityChange() {
      if (!document.hidden && active) {
        clearTimeout(timer);
        void poll();
      }
    }

    void poll();
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      active = false;
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [symbol]);

  return bars;
}
