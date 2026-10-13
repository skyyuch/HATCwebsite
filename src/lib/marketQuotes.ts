import 'server-only';

import {createDecipheriv, createHash} from 'node:crypto';
import {
  MARKET_SYMBOLS,
  type LiveQuote,
  type MarketBar
} from './marketQuoteTypes';

/**
 * Live quote reader for the MT5 quote gateway (mt5-tcp-quote-gateway-node).
 *
 * Why this runs server-side only:
 * 1. The gateway's CORS allow-list only contains the h5/admin hosts, so a
 *    browser on the HATC site cannot call it directly.
 * 2. Gateway HTTP responses are wrapped in an AES-256-GCM envelope whose key is
 *    a static shared secret. That secret must stay out of the client bundle.
 *
 * Quotes are REAL market data, not approved company facts: they are not
 * trading conditions and must never be written into docs/HATC_FACTS.md. When
 * the gateway is unreachable or the guest context has no symbols whitelisted,
 * every reader returns null and the UI falls back to its clearly-labelled
 * sample data.
 */

export {MARKET_SYMBOLS};
export type {LiveQuote, MarketBar};

const CONTEXT_RENEW_MARGIN_MS = 60_000;
const QUOTE_CACHE_TTL_MS = 2_000;
const BAR_CACHE_TTL_MS = 60_000;
const REQUEST_TIMEOUT_MS = 8_000;

/** Daily bars kept for the homepage chart. */
const BAR_COUNT = 30;
/**
 * The gateway's `limit` bounds the requested time *window*, not the bar count,
 * so ask for enough calendar days to cover BAR_COUNT trading sessions.
 */
const BAR_WINDOW_LIMIT = 60;

type GatewayConfig = {baseUrl: string; host: string; secret: string};

/** Host part of the gateway URL. Public — it ships in `config/env/*.env`. */
function gatewayHost(baseUrl: string): string {
  try {
    return new URL(baseUrl).host;
  } catch {
    return baseUrl;
  }
}

function gatewayConfig(): GatewayConfig | null {
  const baseUrl = process.env.QUOTE_GATEWAY_URL?.trim().replace(/\/+$/, '');
  if (!baseUrl) return null;
  return {
    baseUrl,
    host: gatewayHost(baseUrl),
    secret: process.env.QUOTE_HTTP_CRYPT_SECRET?.trim() ?? ''
  };
}

/** True when a quote gateway is configured for this environment. */
export function hasQuoteGateway(): boolean {
  return gatewayConfig() !== null;
}

/**
 * Diagnostic logging for the ways live quotes can go missing.
 *
 * Two of them used to be entirely silent — an unset `QUOTE_GATEWAY_URL` and a
 * guest whitelist without our products — which left a deployed site with no
 * signal beyond `{ok:false}`, and `{ok:false}` is also the normal answer when
 * everything is merely degraded (第六十四輪). A message is printed when the
 * reported state for a key *changes*, so a lasting outage logs once while a
 * recovery, and any later relapse, both stay visible.
 *
 * 🚩 Never log the response-crypt secret, or any part of it.
 */
const reportedState = new Map<string, string>();

function report(key: string, message: string, ok = false): void {
  if (reportedState.get(key) === message) return;
  reportedState.set(key, message);
  (ok ? console.info : console.warn)(`[marketQuotes] ${message}`);
}

/** Forget a key's last state so the next failure is logged again. */
function clearReport(key: string): void {
  reportedState.delete(key);
}

/**
 * Gateway config for a live read, reporting its absence once. Diagnostics use
 * `gatewayConfig()` directly — a manual probe should not rewrite the log state.
 */
function gatewayForRead(): GatewayConfig | null {
  const config = gatewayConfig();
  if (!config) {
    report(
      'gateway',
      'QUOTE_GATEWAY_URL is not set — serving sample data. It ships in ' +
        'config/env/<env>.env, so the server has to be started with the ' +
        'matching script (npm run start:uat / start:prd), not a bare npm start.'
    );
    return null;
  }
  clearReport('gateway');
  return config;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

type CryptEnvelope = {codec: string; iv: string; tag: string; data: string};

function isCryptEnvelope(body: unknown): body is CryptEnvelope {
  if (typeof body !== 'object' || body === null) return false;
  const candidate = body as Record<string, unknown>;
  return (
    candidate.codec === 'aes-256-gcm' &&
    typeof candidate.iv === 'string' &&
    typeof candidate.tag === 'string' &&
    typeof candidate.data === 'string'
  );
}

/**
 * Unwraps the gateway's optional AES-256-GCM envelope. Plain responses (crypt
 * disabled on the gateway) pass through untouched.
 */
function decodeBody(body: unknown, secret: string): unknown {
  if (!isCryptEnvelope(body)) return body;
  if (!secret) {
    throw new Error('QUOTE_HTTP_CRYPT_SECRET is required for this gateway');
  }

  const key = createHash('sha256').update(secret, 'utf8').digest();
  const decipher = createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(body.iv, 'base64')
  );
  decipher.setAuthTag(Buffer.from(body.tag, 'base64'));
  const plain = Buffer.concat([
    decipher.update(Buffer.from(body.data, 'base64')),
    decipher.final()
  ]).toString('utf8');

  return JSON.parse(plain);
}

async function gatewayFetch(
  config: GatewayConfig,
  path: string,
  init?: RequestInit
): Promise<unknown> {
  const response = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    cache: 'no-store',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  });

  const body = decodeBody(await response.json(), config.secret);
  if (!response.ok) {
    const code =
      typeof body === 'object' && body !== null
        ? String((body as Record<string, unknown>).code ?? response.status)
        : String(response.status);
    throw new Error(`gateway ${path} failed: ${code}`);
  }

  return body;
}

type GuestContext = {token: string; allowedSymbols: string[]; expiresAt: number};

let contextCache: GuestContext | null = null;
let contextInflight: Promise<GuestContext> | null = null;

/**
 * Resolves (and caches) a guest quote context. The gateway derives the guest
 * trade group from the business backend, so the returned whitelist is whatever
 * that group has configured — possibly empty.
 */
async function resolveGuestContext(config: GatewayConfig): Promise<GuestContext> {
  const cached = contextCache;
  if (cached && cached.expiresAt - CONTEXT_RENEW_MARGIN_MS > Date.now()) {
    return cached;
  }
  if (contextInflight) return contextInflight;

  contextInflight = (async () => {
    const body = await gatewayFetch(config, '/v1/context/resolve', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({scene: 'guest'})
    });

    const result = (body as {result?: Record<string, unknown>}).result ?? {};
    const token = String(result.contextToken ?? '');
    if (!token) throw new Error('gateway returned no contextToken');

    const context: GuestContext = {
      token,
      allowedSymbols: Array.isArray(result.allowedSymbols)
        ? result.allowedSymbols.map((item) => String(item))
        : [],
      expiresAt: Number(result.expiresAt ?? 0) || Date.now() + 5 * 60_000
    };
    contextCache = context;
    return context;
  })();

  try {
    return await contextInflight;
  } catch (error) {
    contextCache = null;
    throw error;
  } finally {
    contextInflight = null;
  }
}

function toNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

type SymbolDetail = {
  latestTick?: Record<string, unknown> | null;
  tickStat?: Record<string, unknown> | null;
};

function toQuote(
  entry: {symbol: string; display: string},
  detail: SymbolDetail
): LiveQuote | null {
  const tick = detail.latestTick;
  const bid = toNumber(tick?.bid);
  if (bid === null || bid <= 0) return null;

  const stat = detail.tickStat ?? {};
  const previousClose = toNumber(stat.PriceClose);
  const change =
    previousClose !== null && previousClose > 0 ? bid - previousClose : null;

  return {
    symbol: entry.symbol,
    display: entry.display,
    bid,
    ask: toNumber(tick?.ask) ?? bid,
    digits: toNumber(tick?.digits) ?? 2,
    change,
    changePercent:
      change !== null && previousClose
        ? (change / previousClose) * 100
        : null,
    high: toNumber(stat.BidHigh),
    low: toNumber(stat.BidLow),
    ts: toNumber(tick?.datetimeMsc) ?? Date.now()
  };
}

let quoteCache: {ts: number; quotes: LiveQuote[]} | null = null;
let quoteInflight: Promise<LiveQuote[]> | null = null;

async function loadQuotes(config: GatewayConfig): Promise<LiveQuote[]> {
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
    wanted.map(async (entry) => {
      const body = await gatewayFetch(
        config,
        `/v1/market/symbol-detail?symbol=${encodeURIComponent(entry.symbol)}` +
          `&contextToken=${encodeURIComponent(context.token)}`
      );
      return toQuote(entry, body as SymbolDetail);
    })
  );

  const quotes: LiveQuote[] = [];
  for (const result of settled) {
    if (result.status === 'fulfilled' && result.value) quotes.push(result.value);
  }
  return quotes;
}

/**
 * Current live quotes, or null when no live data is available (gateway not
 * configured, unreachable, or guest whitelist empty). Callers fall back to
 * labelled sample data.
 */
export async function getLiveQuotes(): Promise<LiveQuote[] | null> {
  const config = gatewayForRead();
  if (!config) return null;

  const cached = quoteCache;
  if (cached && Date.now() - cached.ts < QUOTE_CACHE_TTL_MS) {
    return cached.quotes.length > 0 ? cached.quotes : null;
  }
  if (quoteInflight) {
    const quotes = await quoteInflight;
    return quotes.length > 0 ? quotes : null;
  }

  quoteInflight = loadQuotes(config);
  try {
    const quotes = await quoteInflight;
    quoteCache = {ts: Date.now(), quotes};
    if (quotes.length > 0) {
      report(
        'quotes',
        `live quotes active from ${config.host}: ${quotes
          .map((quote) => quote.symbol)
          .join(', ')}`,
        true
      );
    }
    return quotes.length > 0 ? quotes : null;
  } catch (error) {
    // A quote outage must never break the page; log once and fall back.
    report('quotes', `live quotes unavailable from ${config.host}: ${errorMessage(error)}`);
    quoteCache = {ts: Date.now(), quotes: []};
    return null;
  } finally {
    quoteInflight = null;
  }
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
        const body = await gatewayFetch(
          config,
          `/v1/market/symbol-detail?symbol=${encodeURIComponent(entry.symbol)}` +
            `&contextToken=${encodeURIComponent(context.token)}`
        );
        const quote = toQuote(entry, body as SymbolDetail);
        return {
          ...base,
          whitelisted: true,
          status: quote ? 'ok' : 'no-tick',
          bid: quote?.bid ?? null,
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
