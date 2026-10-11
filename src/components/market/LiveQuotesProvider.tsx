'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import type {LiveQuote} from '@/lib/marketQuoteTypes';

/**
 * Shared live-quote stream for the market widgets (homepage hero/ticker/service
 * cards, /trading conditions table).
 *
 * The page stays statically rendered: the server markup always ships the
 * labelled sample data, and this provider swaps in real quotes only after it
 * has actually fetched them. Until then (and whenever the feed is unavailable)
 * consumers keep rendering their sample fallback, so there is no hydration
 * mismatch and no empty state.
 *
 * Polling rather than a WebSocket: the gateway's WS handshake needs the
 * server-only context token, and a long-lived socket per visitor would not
 * survive serverless hosting. One cached upstream read serves all pollers.
 */

const POLL_INTERVAL_MS = 5_000;
/** Points kept per symbol for the hero sparkline. */
const HISTORY_LIMIT = 48;

type LiveQuotesState = {
  /** Real quotes keyed by gateway symbol, or null while unavailable. */
  bySymbol: Record<string, LiveQuote> | null;
  /** Observed price points per symbol, oldest first. */
  history: Record<string, number[]>;
};

const LiveQuotesContext = createContext<LiveQuotesState>({
  bySymbol: null,
  history: {}
});

/**
 * Live quotes for one symbol. Returns null when the feed is unavailable, which
 * is the caller's signal to render its labelled sample data instead.
 */
export function useLiveQuote(symbol: string): LiveQuote | null {
  return useContext(LiveQuotesContext).bySymbol?.[symbol] ?? null;
}

/** All live quotes in gateway order, or null when the feed is unavailable. */
export function useLiveQuotes(): LiveQuote[] | null {
  const {bySymbol} = useContext(LiveQuotesContext);
  return useMemo(() => {
    if (!bySymbol) return null;
    const quotes = Object.values(bySymbol);
    return quotes.length > 0 ? quotes : null;
  }, [bySymbol]);
}

/** Observed price points for one symbol (empty until enough ticks arrive). */
export function useQuoteHistory(symbol: string): number[] {
  const {history} = useContext(LiveQuotesContext);
  return history[symbol] ?? [];
}

export default function LiveQuotesProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<LiveQuotesState>({
    bySymbol: null,
    history: {}
  });
  const historyRef = useRef<Record<string, number[]>>({});

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function poll() {
      // Skip work while the tab is hidden; refreshed on visibilitychange.
      if (!document.hidden) {
        try {
          const response = await fetch('/api/market/quotes', {
            cache: 'no-store'
          });
          const body = (await response.json()) as
            | {ok: true; quotes: LiveQuote[]}
            | {ok: false};

          if (active && body.ok) {
            const bySymbol: Record<string, LiveQuote> = {};
            const history = {...historyRef.current};
            for (const quote of body.quotes) {
              bySymbol[quote.symbol] = quote;
              const points = [...(history[quote.symbol] ?? []), quote.bid];
              history[quote.symbol] = points.slice(-HISTORY_LIMIT);
            }
            historyRef.current = history;
            setState({bySymbol, history});
          } else if (active && !body.ok) {
            // Feed went away — fall back to sample data rather than freezing
            // the last known prices, which would silently go stale.
            historyRef.current = {};
            setState({bySymbol: null, history: {}});
          }
        } catch {
          // Network hiccup: keep the previous state and retry on the next tick.
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
  }, []);

  return (
    <LiveQuotesContext.Provider value={state}>
      {children}
    </LiveQuotesContext.Provider>
  );
}
