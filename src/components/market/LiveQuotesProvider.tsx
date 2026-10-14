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
 * has actually received them. Until then (and whenever the feed is
 * unavailable) consumers keep rendering their sample fallback, so there is no
 * hydration mismatch and no empty state.
 *
 * Transport: server-sent events from `/api/market/stream`, which relays the
 * gateway's tick feed so a price move reaches the screen in a few hundred
 * milliseconds. The browser cannot hold the gateway socket itself — the
 * handshake needs a server-only context token. If the stream cannot be
 * established (no EventSource, or a proxy that will not keep it open) the
 * provider falls back to polling `/api/market/quotes`, which carries the same
 * payload.
 */

/** Fallback only: how often to poll when the stream is unavailable. */
const POLL_INTERVAL_MS = 5_000;
/** Consecutive stream failures before giving up and polling instead. */
const STREAM_FAILURE_LIMIT = 3;
/** Points kept per symbol for the hero sparkline. */
const HISTORY_LIMIT = 90;
/**
 * Ticks arrive faster than a sparkline needs. Sampling keeps the line's time
 * window (~3 minutes) wide enough to read as a trend rather than as noise.
 */
const HISTORY_SAMPLE_MS = 2_000;

type QuotesPayload = {ok: true; quotes: LiveQuote[]} | {ok: false};

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
  const sampledAtRef = useRef<Record<string, number>>({});

  useEffect(() => {
    let active = true;
    let source: EventSource | null = null;
    let pollTimer: ReturnType<typeof setTimeout> | undefined;
    let polling = false;
    let streamFailures = 0;

    function apply(payload: QuotesPayload) {
      if (!active) return;

      if (!payload.ok) {
        // Feed went away — fall back to sample data rather than freezing the
        // last known prices, which would silently go stale.
        historyRef.current = {};
        sampledAtRef.current = {};
        setState({bySymbol: null, history: {}});
        return;
      }

      const now = Date.now();
      const bySymbol: Record<string, LiveQuote> = {};
      let history = historyRef.current;

      for (const quote of payload.quotes) {
        bySymbol[quote.symbol] = quote;

        const sampledAt = sampledAtRef.current[quote.symbol] ?? 0;
        if (now - sampledAt >= HISTORY_SAMPLE_MS) {
          sampledAtRef.current[quote.symbol] = now;
          history = {
            ...history,
            [quote.symbol]: [...(history[quote.symbol] ?? []), quote.bid].slice(
              -HISTORY_LIMIT
            )
          };
        }
      }

      historyRef.current = history;
      setState({bySymbol, history});
    }

    async function poll() {
      if (!document.hidden) {
        try {
          const response = await fetch('/api/market/quotes', {cache: 'no-store'});
          apply((await response.json()) as QuotesPayload);
        } catch {
          // Network hiccup: keep the previous state and retry on the next tick.
        }
      }
      if (active && polling) pollTimer = setTimeout(poll, POLL_INTERVAL_MS);
    }

    function startPolling() {
      if (!active || polling) return;
      polling = true;
      void poll();
    }

    function stopStream() {
      source?.close();
      source = null;
    }

    function startStream() {
      if (!active || polling || source) return;

      source = new EventSource('/api/market/stream');

      source.onmessage = (event) => {
        streamFailures = 0;
        try {
          apply(JSON.parse(event.data) as QuotesPayload);
        } catch {
          // Malformed frame; wait for the next one.
        }
      };

      source.onerror = () => {
        streamFailures += 1;
        // EventSource reconnects on its own; only step aside once it is clear
        // that this client (or something between it and us) cannot hold a
        // stream open at all.
        if (streamFailures >= STREAM_FAILURE_LIMIT) {
          stopStream();
          startPolling();
        }
      };
    }

    function onVisibilityChange() {
      if (!active) return;

      if (document.hidden) {
        // Nobody is looking: drop the stream so the server can release its
        // upstream socket. Polling pauses inside poll() instead, keeping its
        // retry timer alive.
        if (!polling) stopStream();
        return;
      }

      if (polling) {
        clearTimeout(pollTimer);
        void poll();
      } else {
        startStream();
      }
    }

    if (typeof EventSource === 'undefined') {
      startPolling();
    } else {
      startStream();
    }
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      active = false;
      polling = false;
      clearTimeout(pollTimer);
      stopStream();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return (
    <LiveQuotesContext.Provider value={state}>
      {children}
    </LiveQuotesContext.Provider>
  );
}
