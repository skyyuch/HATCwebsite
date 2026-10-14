import 'server-only';

import {createDecipheriv, createHash} from 'node:crypto';

/**
 * Shared plumbing for talking to the MT5 quote gateway
 * (mt5-tcp-quote-gateway-node): configuration, the AES-256-GCM response
 * envelope, the guest context handshake and the state-change logger.
 *
 * Two readers sit on top of this module and must stay in sync:
 * `marketQuotes.ts` (HTTP polls for symbol detail and daily bars) and
 * `marketQuoteHub.ts` (the long-lived WebSocket tick feed). Both are
 * server-only — the browser must never reach the gateway, because its CORS
 * allow-list excludes this site and the response-crypt secret would otherwise
 * ship in the client bundle.
 */

/** How long before expiry a cached guest context is renewed. */
const CONTEXT_RENEW_MARGIN_MS = 60_000;
const REQUEST_TIMEOUT_MS = 8_000;

export type GatewayConfig = {baseUrl: string; host: string; secret: string};

/** Host part of the gateway URL. Public — it ships in `config/env/*.env`. */
function gatewayHost(baseUrl: string): string {
  try {
    return new URL(baseUrl).host;
  } catch {
    return baseUrl;
  }
}

export function gatewayConfig(): GatewayConfig | null {
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

export function report(key: string, message: string, ok = false): void {
  if (reportedState.get(key) === message) return;
  reportedState.set(key, message);
  (ok ? console.info : console.warn)(`[marketQuotes] ${message}`);
}

/** Forget a key's last state so the next failure is logged again. */
export function clearReport(key: string): void {
  reportedState.delete(key);
}

/**
 * Gateway config for a live read, reporting its absence once. Diagnostics use
 * `gatewayConfig()` directly — a manual probe should not rewrite the log state.
 */
export function gatewayForRead(): GatewayConfig | null {
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

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function toNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
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

export async function gatewayFetch(
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

export type GuestContext = {
  token: string;
  allowedSymbols: string[];
  expiresAt: number;
};

let contextCache: GuestContext | null = null;
let contextInflight: Promise<GuestContext> | null = null;

/**
 * Resolves (and caches) a guest quote context. The gateway derives the guest
 * trade group from the business backend, so the returned whitelist is whatever
 * that group has configured — possibly empty.
 */
export async function resolveGuestContext(
  config: GatewayConfig
): Promise<GuestContext> {
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

/**
 * Drops the cached guest context so the next read performs a fresh handshake.
 * Used when the gateway rejects a token it previously issued (for example
 * after the gateway restarts and loses its context store).
 */
export function forgetGuestContext(): void {
  contextCache = null;
}
