import 'server-only';

import {
  clearReport,
  errorMessage,
  gatewayConfig,
  gatewayFetch,
  gatewayForRead,
  hasQuoteGateway,
  report,
  resolveGuestContext,
  toNumber,
  type GatewayConfig,
  type GuestContext
} from './marketGateway';
import {
  MARKET_SYMBOLS,
  type LiveQuote,
  type MarketBar
} from './marketQuoteTypes';

/**
 * HTTP quote reader for the MT5 quote gateway (mt5-tcp-quote-gateway-node).
 *
 * This module owns the request/response side of the feed: a snapshot of the
 * current quotes (symbol detail + day statistics) and the daily bars behind the
 * homepage chart. The low-latency tick stream lives in `marketQuoteHub.ts`,
 * which layers WebSocket ticks on top of the snapshots produced here — the
 * ticks carry no day statistics, so previous close / high / low still come from
 * this path.
 *
 * Why this runs server-side only: see `marketGateway.ts`.
 *
 * Quotes are REAL market data, not approved company facts: they are not
 * trading conditions and must never be written into docs/HATC_FACTS.md. When
 * the gateway is unreachable or the guest context has no symbols whitelisted,
 * every reader returns null and the UI falls back to its clearly-labelled
 * sample data.
 */

export {MARKET_SYMBOLS, hasQuoteGateway};
export type {LiveQuote, MarketBar};

const QUOTE_CACHE_TTL_MS = 2_000;
const BAR_CACHE_TTL_MS = 60_000;

/** Daily bars kept for the homepage chart. */
const BAR_COUNT = 30;
/**
 * The gateway's `limit` bounds the requested time *window*, not the bar count,
 * so ask for enough calendar days to cover BAR_COUNT trading sessions.
 */
const BAR_WINDOW_LIMIT = 60;

type SymbolDetail = {
  latestTick?: Record<string, unknown> | null;
  tickStat?: Record<string, unknown> | null;
};

/**
 * A quote plus the day statistics the tick stream cannot supply. The gateway's
 * WebSocket ticks carry bid/ask only, so the hub recomputes change against the
 * `previousClose` captured here.
 */
export type QuoteSnapshot = {
  quote: LiveQuote;
  /** Previous session close, or null when the gateway did not report one. */
  previousClose: number | null;
};

function toSnapshot(
  entry: {symbol: string; display: string},
  detail: SymbolDetail
): QuoteSnapshot | null {
  const tick = detail.latestTick;
  const bid = toNumber(tick?.bid);
  if (bid === null || bid <= 0) return null;

  const stat = detail.tickStat ?? {};
  const reportedClose = toNumber(stat.PriceClose);
  const previousClose =
    reportedClose !== null && reportedClose > 0 ? reportedClose : null;
  const change = previousClose !== null ? bid - previousClose : null;

  return {
    previousClose,
    quote: {
      symbol: entry.symbol,
      display: entry.display,
      bid,
      ask: toNumber(tick?.ask) ?? bid,
      digits: toNumber(tick?.digits) ?? 2,
      change,
      changePercent:
        change !== null && previousClose ? (change / previousClose) * 100 : null,
      high: toNumber(stat.BidHigh),
      low: toNumber(stat.BidLow),
      ts: toNumber(tick?.datetimeMsc) ?? Date.now()
    }
  };
}

/** Fetches one symbol's detail and maps it onto a quote snapshot. */
async function fetchSnapshot(
  config: GatewayConfig,
  context: GuestContext,
  entry: {symbol: string; display: string}
): Promise<QuoteSnapshot | null> {
  const body = await gatewayFetch(
    config,
    `/v1/market/symbol-detail?symbol=${encodeURIComponent(entry.symbol)}` +
      `&contextToken=${encodeURIComponent(context.token)}`
  );
  return toSnapshot(entry, body as SymbolDetail);
}

let quoteCache: {ts: number; snapshots: QuoteSnapshot[]} | null = null;
let quoteInflight: Promise<QuoteSnapshot[]> | null = null;

async function loadSnapshots(config: GatewayConfig): Promise<QuoteSnapshot[]> {
  const context = await resolveGuestContext(config);
  const allowed = context.allowedSymbols;
  const wanted = MARKET_SYMBOLS.filter((entry) => allowed.includes(entry.symbol));

  if (wanted.length < MARKET_SYMBOLS.length) {
    const missing = MARKET_SYMBOLS.filter((entry) => !allowed.includes(entry.symbol))
      .map((entry) => entry.symbol)
      .join(', ');
    report(
      'whitelist',
      `${config.host} does not whitelist ${missing} for guests ` +
        `(${allowed.length} symbol(s) allowed)` +
        (wanted.length === 0
          ? " — that gateway's guest trade group has no HATC products " +
            'configured, so no live quote is possible. Serving sample data.'
          : '.')
    );
  } else {
    clearReport('whitelist');
  }

  // The guest trade group has no products configured for these symbols — the
  // gateway would answer 403 for every request, so don't ask.
  if (wanted.length === 0) return [];

  const settled = await Promise.allSettled(
    wanted.map((entry) => fetchSnapshot(config, context, entry))
  );

  const snapshots: QuoteSnapshot[] = [];
  for (const result of settled) {
    if (result.status === 'fulfilled' && result.value) snapshots.push(result.value);
  }
  return snapshots;
}

/**
 * Current quotes with their day statistics, or null when no live data is
 * available. Shared by the public endpoint and the tick hub, so one upstream
 * read serves both.
 */
export async function getQuoteSnapshots(): Promise<QuoteSnapshot[] | null> {
  const config = gatewayForRead();
  if (!config) return null;

  const cached = quoteCache;
  if (cached && Date.now() - cached.ts < QUOTE_CACHE_TTL_MS) {
    return cached.snapshots.length > 0 ? cached.snapshots : null;
  }
  if (quoteInflight) {
    const snapshots = await quoteInflight;
    return snapshots.length > 0 ? snapshots : null;
  }

  quoteInflight = loadSnapshots(config);
  try {
    const snapshots = await quoteInflight;
    quoteCache = {ts: Date.now(), snapshots};
    if (snapshots.length > 0) {
      report(
        'quotes',
        `live quotes active from ${config.host}: ${snapshots
          .map((snapshot) => snapshot.quote.symbol)
          .join(', ')}`,
        true
      );
    }
    return snapshots.length > 0 ? snapshots : null;
  } catch (error) {
    // A quote outage must never break the page; log once and fall back.
    report('quotes', `live quotes unavailable from ${config.host}: ${errorMessage(error)}`);
    quoteCache = {ts: Date.now(), snapshots: []};
    return null;
  } finally {
    quoteInflight = null;
  }
}

/**
 * Current live quotes, or null when no live data is available (gateway not
 * configured, unreachable, or guest whitelist empty). Callers fall back to
 * labelled sample data.
 */
export async function getLiveQuotes(): Promise<LiveQuote[] | null> {
  const snapshots = await getQuoteSnapshots();
  return snapshots ? snapshots.map((snapshot) => snapshot.quote) : null;
}

function toBar(entry: unknown): MarketBar | null {
  if (typeof entry !== 'object' || entry === null) return null;
  const row = entry as Record<string, unknown>;
  const time = toNumber(row.time);
  const open = toNumber(row.open);
  const high = toNumber(row.high);
  const low = toNumber(row.low);
  const close = toNumber(row.close);

  if (time === null || open === null || high === null) return null;
  if (low === null || close === null) return null;
  if (open <= 0 || high <= 0 || low <= 0 || close <= 0) return null;

  return {time, open, high, low, close};
}

const barCache = new Map<string, {ts: number; bars: MarketBar[]}>();
const barInflight = new Map<string, Promise<MarketBar[]>>();

async function loadBars(
  config: GatewayConfig,
  symbol: string
): Promise<MarketBar[]> {
  const context = await resolveGuestContext(config);
  if (!context.allowedSymbols.includes(symbol)) {
    report(
      `bars:${symbol}`,
      `${config.host} does not whitelist ${symbol} for guests — ` +
        'no chart can be drawn for it.'
    );
    return [];
  }

  const query = new URLSearchParams({
    symbol,
    resolution: '1D',
    priceType: 'bid',
    limit: String(BAR_WINDOW_LIMIT),
    contextToken: context.token
  });
  const body = await gatewayFetch(config, `/v1/market/bars?${query}`);
  const rows = (body as {bars?: unknown}).bars;
  if (!Array.isArray(rows)) return [];

  const bars: MarketBar[] = [];
  for (const row of rows) {
    const bar = toBar(row);
    if (bar) bars.push(bar);
  }
  return bars.slice(-BAR_COUNT);
}

/**
 * Recent daily OHLC bars for one homepage symbol, or null when no real series
 * is available. Callers must then draw nothing — a sample candlestick series
 * next to real prices would misrepresent the market.
 *
 * Only the homepage symbols are served: the guest whitelist also contains FX
 * and index symbols, which are not HATC products and must never surface here.
 */
export async function getDailyBars(
  symbol: string
): Promise<MarketBar[] | null> {
  const config = gatewayForRead();
  if (!config) return null;
  if (!MARKET_SYMBOLS.some((entry) => entry.symbol === symbol)) return null;

  const cached = barCache.get(symbol);
  if (cached && Date.now() - cached.ts < BAR_CACHE_TTL_MS) {
    return cached.bars.length > 0 ? cached.bars : null;
  }
  const inflight = barInflight.get(symbol);
  if (inflight) {
    const bars = await inflight;
    return bars.length > 0 ? bars : null;
  }

  const pending = loadBars(config, symbol);
  barInflight.set(symbol, pending);
  try {
    const bars = await pending;
    barCache.set(symbol, {ts: Date.now(), bars});
    if (bars.length > 0) clearReport(`bars:${symbol}`);
    return bars.length > 0 ? bars : null;
  } catch (error) {
    // A chart outage must never break the page; log once and draw nothing.
    report(
      `bars:${symbol}`,
      `daily bars unavailable for ${symbol} from ${config.host}: ${errorMessage(error)}`
    );
    barCache.set(symbol, {ts: Date.now(), bars: []});
    return null;
  } finally {
    barInflight.delete(symbol);
  }
}

export type GatewaySymbolCheck = {
  symbol: string;
  display: string;
  whitelisted: boolean;
  status: 'ok' | 'no-tick' | 'error' | 'not-whitelisted';
  bid: number | null;
  error: string | null;
};

export type GatewayDiagnostics = {
  checkedAt: string;
  /** One sentence naming the blocker, or confirming the feed is healthy. */
  verdict: string;
  gateway: {
    configured: boolean;
    /** Host only; the response-crypt secret is never reported, not even its length. */
    host: string | null;
    secretConfigured: boolean;
  };
  guestContext: {ok: boolean; allowedSymbolCount: number | null; error: string | null};
  symbols: GatewaySymbolCheck[];
};

/**
 * End-to-end self-test of the quote feed, for the admin-only diagnostics route.
 *
 * `{ok:false}` from the public endpoints is a contract ("no real data, keep
 * showing sample"), so it deliberately carries no reason. This is where the
 * reason lives — behind authentication, because the blockers it names (which
 * gateway this server talks to, whether a secret is set, what the guest trade
 * group allows) are operational details, not public information.
 *
 * 🚩 The report must never contain the secret itself. It bypasses the quote
 * cache so a 60-second-old failure can't be mistaken for the current state.
 */
export async function runGatewayDiagnostics(): Promise<GatewayDiagnostics> {
  const checkedAt = new Date().toISOString();
  const config = gatewayConfig();

  if (!config) {
    return {
      checkedAt,
      verdict:
        'QUOTE_GATEWAY_URL is not set on this server. It ships in ' +
        'config/env/<env>.env, so start the server with the matching script ' +
        '(npm run start:uat / start:prd) or set the variable on the host.',
      gateway: {configured: false, host: null, secretConfigured: false},
      guestContext: {ok: false, allowedSymbolCount: null, error: null},
      symbols: []
    };
  }

  const gateway = {
    configured: true,
    host: config.host,
    secretConfigured: config.secret.length > 0
  };

  let context: GuestContext;
  try {
    context = await resolveGuestContext(config);
  } catch (error) {
    const message = errorMessage(error);
    return {
      checkedAt,
      verdict: gateway.secretConfigured
        ? `Cannot resolve a guest context from ${config.host}: ${message}. ` +
          'Check that this host can reach the gateway and that ' +
          'QUOTE_HTTP_CRYPT_SECRET matches that gateway (UAT and production differ).'
        : `QUOTE_HTTP_CRYPT_SECRET is not set, so the response from ${config.host} ` +
          'cannot be decrypted. Put the value for this gateway in ' +
          'config/env/<env>.secrets.env or the host environment.',
      gateway,
      guestContext: {ok: false, allowedSymbolCount: null, error: message},
      symbols: []
    };
  }

  const symbols = await Promise.all(
    MARKET_SYMBOLS.map(async (entry): Promise<GatewaySymbolCheck> => {
      const base = {symbol: entry.symbol, display: entry.display};
      if (!context.allowedSymbols.includes(entry.symbol)) {
        return {...base, whitelisted: false, status: 'not-whitelisted', bid: null, error: null};
      }

      try {
        const snapshot = await fetchSnapshot(config, context, entry);
        return {
          ...base,
          whitelisted: true,
          status: snapshot ? 'ok' : 'no-tick',
          bid: snapshot?.quote.bid ?? null,
          error: null
        };
      } catch (error) {
        return {
          ...base,
          whitelisted: true,
          status: 'error',
          bid: null,
          error: errorMessage(error)
        };
      }
    })
  );

  const live = symbols.filter((entry) => entry.status === 'ok');
  const missing = symbols.filter((entry) => !entry.whitelisted).map((entry) => entry.symbol);

  let verdict: string;
  if (live.length === symbols.length) {
    verdict = `Live quotes are working: ${config.host} is serving all ${live.length} products.`;
  } else if (missing.length === symbols.length) {
    verdict =
      `${config.host} resolves a guest context with ${context.allowedSymbols.length} ` +
      'symbol(s) whitelisted, but none of them are HATC products. Configure the ' +
      'guest trade group on that gateway — or point this server at the gateway ' +
      'whose guest group already has them.';
  } else {
    const detail = symbols
      .filter((entry) => entry.status !== 'ok')
      .map((entry) => `${entry.symbol}: ${entry.error ?? entry.status}`)
      .join('; ');
    verdict = `${config.host} is reachable but ${symbols.length - live.length} of ${symbols.length} products have no quote — ${detail}`;
  }

  return {
    checkedAt,
    verdict,
    gateway,
    guestContext: {
      ok: true,
      allowedSymbolCount: context.allowedSymbols.length,
      error: null
    },
    symbols
  };
}
