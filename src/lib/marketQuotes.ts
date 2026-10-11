import 'server-only';

import {createDecipheriv, createHash} from 'node:crypto';
import {MARKET_SYMBOLS, type LiveQuote} from './marketQuoteTypes';

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
export type {LiveQuote};

const CONTEXT_RENEW_MARGIN_MS = 60_000;
const QUOTE_CACHE_TTL_MS = 2_000;
const REQUEST_TIMEOUT_MS = 8_000;

type GatewayConfig = {baseUrl: string; secret: string};

function gatewayConfig(): GatewayConfig | null {
  const baseUrl = process.env.QUOTE_GATEWAY_URL?.trim().replace(/\/+$/, '');
  if (!baseUrl) return null;
  return {baseUrl, secret: process.env.QUOTE_HTTP_CRYPT_SECRET?.trim() ?? ''};
}

/** True when a quote gateway is configured for this environment. */
export function hasQuoteGateway(): boolean {
  return gatewayConfig() !== null;
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
  const wanted = MARKET_SYMBOLS.filter((entry) =>
    context.allowedSymbols.includes(entry.symbol)
  );

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
  const config = gatewayConfig();
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
    return quotes.length > 0 ? quotes : null;
  } catch (error) {
    // A quote outage must never break the page; log once and fall back.
    console.warn(
      '[marketQuotes] live quotes unavailable:',
      error instanceof Error ? error.message : String(error)
    );
    quoteCache = {ts: Date.now(), quotes: []};
    return null;
  } finally {
    quoteInflight = null;
  }
}
