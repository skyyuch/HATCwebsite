import 'server-only';

import {
  clearReport,
  errorMessage,
  forgetGuestContext,
  gatewayForRead,
  report,
  resolveGuestContext,
  toNumber,
  type GatewayConfig
} from './marketGateway';
import {getQuoteSnapshots} from './marketQuotes';
import {MARKET_SYMBOLS, type LiveQuote} from './marketQuoteTypes';

/**
 * Low-latency tick hub: one WebSocket from this server to the MT5 quote
 * gateway, fanned out to every visitor over SSE (`/api/market/stream`).
 *
 * Why not let the browser poll faster: the gateway pushes a tick only when a
 * price actually moves (roughly 1–2 per second per product in production), so
 * polling can only ever trade wasted requests for latency. One socket per
 * server process delivers every move within a few hundred milliseconds and
 * leaves the gateway's load independent of how many people are on the site.
 *
 * Why not let the browser hold the socket: the gateway's WS handshake needs
 * the guest `contextToken`, which can only be obtained with the server-only
 * response-crypt secret, and its CORS allow-list excludes this site.
 *
 * The ticks carry bid/ask only. Previous close, session high and session low
 * come from the HTTP snapshot in `marketQuotes.ts`, refreshed periodically and
 * merged underneath the ticks.
 */

/** Gateway ticks only move bid/ask; day statistics are refreshed on this beat. */
const STAT_REFRESH_MS = 60_000;
/** Snapshot polling used while the socket is down (its own cache is 2s). */
const POLL_FALLBACK_MS = 2_000;
/** Application-level ping, so a silent market is not mistaken for a dead socket. */
const PING_INTERVAL_MS = 30_000;
/** No frame at all for this long (ticks, pongs) means the socket is gone. */
const SILENCE_TIMEOUT_MS = 75_000;
const RECONNECT_BASE_MS = 1_000;
const RECONNECT_MAX_MS = 30_000;
/** Grace period before the socket is dropped after the last viewer leaves. */
const IDLE_SHUTDOWN_MS = 30_000;

type Listener = (quotes: LiveQuote[] | null) => void;

type HubState = {
  /** Latest merged quote per gateway symbol. */
  quotes: Map<string, LiveQuote>;
  /** Previous session close per symbol, for recomputing change from a tick. */
  previousClose: Map<string, number | null>;
};

const state: HubState = {quotes: new Map(), previousClose: new Map()};
const listeners = new Set<Listener>();

let started = false;
let socket: WebSocket | null = null;
let connecting = false;
let reconnectAttempts = 0;
let lastFrameAt = 0;
let lastTickAt = 0;

let statTimer: ReturnType<typeof setInterval> | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let pingTimer: ReturnType<typeof setInterval> | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let idleTimer: ReturnType<typeof setTimeout> | null = null;

function clearTimer(timer: ReturnType<typeof setTimeout> | null): null {
  if (timer) clearTimeout(timer);
  return null;
}

/** Quotes in gateway order, or null when nothing real is available. */
function currentQuotes(): LiveQuote[] | null {
  const quotes = MARKET_SYMBOLS.map((entry) => state.quotes.get(entry.symbol)).filter(
    (quote): quote is LiveQuote => quote !== undefined
  );
  return quotes.length > 0 ? quotes : null;
}

/**
 * Identity of the current state, so repeated reads that found nothing new
 * (the 2s fallback poll, a quiet market) do not wake every open stream.
 */
function fingerprint(quotes: LiveQuote[] | null): string {
  if (!quotes) return 'none';
  return quotes
    .map((quote) => `${quote.symbol}:${quote.bid}:${quote.ts}:${quote.high}:${quote.low}`)
    .join('|');
}

let lastEmitted = '';

function emit(): void {
  const quotes = currentQuotes();
  const next = fingerprint(quotes);
  if (next === lastEmitted) return;
  lastEmitted = next;

  for (const listener of listeners) {
    try {
      listener(quotes);
    } catch (error) {
      console.warn(`[marketQuotes] stream listener failed: ${errorMessage(error)}`);
    }
  }
}

/** Recomputes change/percent against the stored previous close. */
function withChange(quote: LiveQuote, previousClose: number | null): LiveQuote {
  if (previousClose === null || previousClose <= 0) {
    return {...quote, change: null, changePercent: null};
  }
  const change = quote.bid - previousClose;
  return {
    ...quote,
    change,
    changePercent: (change / previousClose) * 100
  };
}

/**
 * Folds an HTTP snapshot in without losing a fresher tick: the snapshot owns
 * the day statistics, the tick owns the price.
 */
function mergeSnapshot(quote: LiveQuote, previousClose: number | null): void {
  const existing = state.quotes.get(quote.symbol);
  state.previousClose.set(quote.symbol, previousClose);

  if (!existing || existing.ts <= quote.ts) {
    state.quotes.set(quote.symbol, withChange(quote, previousClose));
    return;
  }

  // The socket already delivered a newer price — keep it, take the statistics.
  state.quotes.set(
    quote.symbol,
    withChange({...existing, high: quote.high, low: quote.low}, previousClose)
  );
}

async function refreshStatistics(): Promise<void> {
  const snapshots = await getQuoteSnapshots();

  if (!snapshots) {
    // No real data at all. While the socket is up this is a transient HTTP
    // failure and the ticks remain authoritative; otherwise drop to sample.
    if (!isSocketOpen() && state.quotes.size > 0) {
      state.quotes.clear();
      state.previousClose.clear();
      emit();
    } else if (!isSocketOpen()) {
      emit();
    }
    return;
  }

  for (const snapshot of snapshots) {
    mergeSnapshot(snapshot.quote, snapshot.previousClose);
  }
  emit();
}

function isSocketOpen(): boolean {
  return socket !== null && socket.readyState === 1;
}

/** Polls the HTTP snapshot while the socket is unavailable. */
function startFallbackPolling(): void {
  if (pollTimer) return;
  pollTimer = setInterval(() => {
    void refreshStatistics();
  }, POLL_FALLBACK_MS);
}

function stopFallbackPolling(): void {
  if (!pollTimer) return;
  clearInterval(pollTimer);
  pollTimer = null;
}

function applyTicks(ticks: unknown): void {
  if (!Array.isArray(ticks)) return;
  let changed = false;

  for (const raw of ticks) {
    if (typeof raw !== 'object' || raw === null) continue;
    const row = raw as Record<string, unknown>;
    const symbol = String(row.symbol ?? '');
    const entry = MARKET_SYMBOLS.find((item) => item.symbol === symbol);
    if (!entry) continue;

    const bid = toNumber(row.bid);
    if (bid === null || bid <= 0) continue;

    const existing = state.quotes.get(symbol);
    const digits = toNumber(row.digits) ?? existing?.digits ?? 2;
    const ts = toNumber(row.datetimeMsc) ?? Date.now();

    const next: LiveQuote = {
      symbol,
      display: entry.display,
      bid,
      ask: toNumber(row.ask) ?? bid,
      digits,
      change: null,
      changePercent: null,
      // Extend the session range with prices actually observed; the periodic
      // snapshot keeps it aligned with the gateway's own statistics.
      high: existing?.high != null ? Math.max(existing.high, bid) : null,
      low: existing?.low != null ? Math.min(existing.low, bid) : null,
      ts
    };

    state.quotes.set(symbol, withChange(next, state.previousClose.get(symbol) ?? null));
    changed = true;
  }

  if (changed) {
    lastTickAt = Date.now();
    emit();
  }
}

function closeSocket(): void {
  const current = socket;
  socket = null;
  if (!current) return;
  // Detach first: our own close triggers onclose, which would reconnect.
  current.onopen = null;
  current.onmessage = null;
  current.onerror = null;
  current.onclose = null;
  try {
    current.close();
  } catch {
    // Already closing; nothing to do.
  }
}

function scheduleReconnect(): void {
  if (!started || reconnectTimer) return;
  const delay = Math.min(
    RECONNECT_MAX_MS,
    RECONNECT_BASE_MS * 2 ** Math.min(reconnectAttempts, 5)
  );
  reconnectAttempts += 1;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    void connect();
  }, delay);
}

function handleFrame(payload: unknown): void {
  lastFrameAt = Date.now();
  if (typeof payload !== 'object' || payload === null) return;
  const message = payload as Record<string, unknown>;

  switch (message.type) {
    case 'session_init': {
      const allowed = Array.isArray(message.allowedSymbols)
        ? message.allowedSymbols.map((item) => String(item))
        : [];
      const wanted = MARKET_SYMBOLS.map((entry) => entry.symbol).filter((symbol) =>
        allowed.includes(symbol)
      );
      // Only ever subscribe to HATC products: the guest whitelist also carries
      // FX and index symbols, which must never surface on this site.
      socket?.send(
        JSON.stringify({op: 'sub', channel: 'tick', symbols: wanted})
      );
      break;
    }
    case 'sub_ok': {
      reconnectAttempts = 0;
      stopFallbackPolling();
      const accepted = Array.isArray(message.symbols) ? message.symbols.length : 0;
      report('stream', `tick stream open (${accepted} product(s) subscribed)`, true);
      break;
    }
    case 'tick':
      applyTicks(message.data);
      break;
    case 'error': {
      const code = String(message.code ?? '');
      if (code === 'INVALID_CONTEXT') {
        // The gateway lost or expired our token; re-handshake on reconnect.
        forgetGuestContext();
      }
      report('stream', `tick stream rejected: ${code || 'unknown error'}`);
      break;
    }
    default:
      break;
  }
}

async function connect(): Promise<void> {
  if (!started || connecting || isSocketOpen()) return;

  const config = gatewayForRead();
  if (!config) {
    startFallbackPolling();
    return;
  }

  if (typeof WebSocket === 'undefined') {
    report(
      'stream',
      'this runtime has no WebSocket client — falling back to polled quotes'
    );
    startFallbackPolling();
    return;
  }

  connecting = true;
  try {
    const context = await resolveGuestContext(config);
    const wanted = MARKET_SYMBOLS.filter((entry) =>
      context.allowedSymbols.includes(entry.symbol)
    );
    if (wanted.length === 0) {
      // `getQuoteSnapshots` already reported the empty whitelist; a socket
      // would be accepted but silent, so keep polling instead.
      startFallbackPolling();
      return;
    }

    openSocket(config, context.token);
  } catch (error) {
    report(
      'stream',
      `cannot open the tick stream to ${config.host}: ${errorMessage(error)}`
    );
    startFallbackPolling();
    scheduleReconnect();
  } finally {
    connecting = false;
  }
}

function openSocket(config: GatewayConfig, contextToken: string): void {
  const url =
    `${config.baseUrl.replace(/^http/, 'ws')}/ws` +
    `?contextToken=${encodeURIComponent(contextToken)}`;

  const next = new WebSocket(url);
  socket = next;
  lastFrameAt = Date.now();

  next.onopen = () => {
    lastFrameAt = Date.now();
  };

  next.onmessage = (event: MessageEvent) => {
    try {
      handleFrame(JSON.parse(String(event.data)));
    } catch {
      // Ignore frames we cannot parse; the feed stays on the last good state.
    }
  };

  next.onerror = () => {
    // `onclose` always follows; reconnect is handled there.
  };

  next.onclose = () => {
    if (socket !== next) return;
    socket = null;
    report('stream', `tick stream closed by ${config.host} — reconnecting`);
    startFallbackPolling();
    scheduleReconnect();
  };
}

function startWatchdog(): void {
  if (pingTimer) return;
  pingTimer = setInterval(() => {
    if (!isSocketOpen()) return;

    if (Date.now() - lastFrameAt > SILENCE_TIMEOUT_MS) {
      report('stream', 'tick stream went silent — reconnecting');
      closeSocket();
      startFallbackPolling();
      scheduleReconnect();
      return;
    }

    try {
      socket?.send(JSON.stringify({op: 'ping'}));
    } catch {
      // The next watchdog pass (or onclose) will reconnect.
    }
  }, PING_INTERVAL_MS);
}

function start(): void {
  if (started) return;
  started = true;
  reconnectAttempts = 0;
  clearReport('stream');

  // Seed from the HTTP snapshot so the first SSE frame is immediate, then let
  // the socket take over the price and this timer keep the statistics fresh.
  startFallbackPolling();
  void refreshStatistics();
  void connect();

  statTimer = setInterval(() => {
    void refreshStatistics();
  }, STAT_REFRESH_MS);
  startWatchdog();
}

function stop(): void {
  if (!started) return;
  started = false;

  closeSocket();
  stopFallbackPolling();
  if (statTimer) clearInterval(statTimer);
  statTimer = null;
  if (pingTimer) clearInterval(pingTimer);
  pingTimer = null;
  reconnectTimer = clearTimer(reconnectTimer);

  // Drop the snapshot: a visitor arriving later must not be handed prices
  // captured before an unknown gap.
  state.quotes.clear();
  state.previousClose.clear();
  lastEmitted = '';
  clearReport('stream');
}

/**
 * Subscribes to live quote updates. The listener fires immediately with the
 * current state (possibly null) and then on every change.
 *
 * The upstream socket is opened on the first subscriber and dropped shortly
 * after the last one leaves, so an idle site holds nothing open.
 */
export function subscribeToQuotes(listener: Listener): () => void {
  listeners.add(listener);
  idleTimer = clearTimer(idleTimer);
  start();
  listener(currentQuotes());

  return () => {
    listeners.delete(listener);
    if (listeners.size > 0) return;
    idleTimer = clearTimer(idleTimer);
    idleTimer = setTimeout(stop, IDLE_SHUTDOWN_MS);
  };
}

/** Tick-stream state for the admin-only diagnostics route. */
export function getStreamDiagnostics(): {
  running: boolean;
  socketOpen: boolean;
  subscribers: number;
  /** 'push' once ticks flow; 'polled' while the socket is unavailable. */
  mode: 'push' | 'polled' | 'idle';
  lastTickAgoMs: number | null;
} {
  return {
    running: started,
    socketOpen: isSocketOpen(),
    subscribers: listeners.size,
    mode: !started ? 'idle' : isSocketOpen() ? 'push' : 'polled',
    lastTickAgoMs: lastTickAt > 0 ? Date.now() - lastTickAt : null
  };
}
