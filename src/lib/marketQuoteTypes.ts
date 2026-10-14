/**
 * Shapes shared by the server-side quote reader (`lib/marketQuotes.ts`, which
 * is server-only) and the client market widgets. Kept in its own module so the
 * browser bundle never pulls in the gateway credentials/crypto code.
 */

/** Symbols shown on the homepage: gold, silver and the RMB kilobar line. */
export const MARKET_SYMBOLS = [
  {symbol: 'XAUUSD', display: 'XAU/USD'},
  {symbol: 'XAGUSD', display: 'XAG/USD'},
  {symbol: 'RKGCNH', display: 'RKG/CNH'}
] as const;

export type MarketSymbol = (typeof MARKET_SYMBOLS)[number]['symbol'];

export type LiveQuote = {
  symbol: string;
  display: string;
  bid: number;
  ask: number;
  digits: number;
  /** Absolute change against the previous close; null when unavailable. */
  change: number | null;
  changePercent: number | null;
  high: number | null;
  low: number | null;
  /** Gateway tick timestamp (ms). */
  ts: number;
};

/**
 * One OHLC bar from the gateway's chart feed. Daily buckets start at Hong Kong
 * midnight, so bar dates must be formatted in `Asia/Hong_Kong`.
 */
export type MarketBar = {
  /** Bucket start, epoch ms. */
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

/** Daily buckets are 24h wide (the gateway aligns them to Hong Kong midnight). */
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Re-prices the current day's candle from the live tick, so the chart moves
 * with the market instead of with the one-minute bar poll.
 *
 * Everything written here is real feed data: the close is the live bid (the
 * bar feed is requested with `priceType=bid`), and the extremes are widened
 * with the session high/low the gateway reports alongside the tick. Only the
 * bucket the tick actually belongs to may move — after the daily roll the
 * gateway has not published the new bucket yet, and stretching yesterday's
 * candle with today's price would invent a candle that never traded.
 */
export function withLiveCandle(
  bars: MarketBar[],
  quote: LiveQuote | null
): MarketBar[] {
  if (!quote || bars.length === 0) return bars;

  const last = bars[bars.length - 1];
  if (quote.ts < last.time || quote.ts >= last.time + DAY_MS) return bars;

  const high = Math.max(last.high, quote.high ?? quote.bid, quote.bid);
  const low = Math.min(last.low, quote.low ?? quote.bid, quote.bid);
  if (quote.bid === last.close && high === last.high && low === last.low) {
    return bars;
  }

  return [...bars.slice(0, -1), {...last, close: quote.bid, high, low}];
}

/** Fixed-decimal price string; en-US grouping keeps the ticker font aligned. */
export function formatPrice(value: number, digits: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
}

/** "+18.60 +0.80%" / "-0.32 -0.11%" — matches the Figma ticker format. */
export function formatChange(quote: LiveQuote): string | null {
  if (quote.change === null || quote.changePercent === null) return null;
  const sign = quote.change >= 0 ? '+' : '-';
  const absolute = Math.abs(quote.change).toFixed(quote.digits);
  const percent = Math.abs(quote.changePercent).toFixed(2);
  return `${sign}${absolute} ${sign}${percent}%`;
}

/** "+0.80%" for the compact badges on the hero/service price cards. */
export function formatChangePercent(quote: LiveQuote): string | null {
  if (quote.changePercent === null) return null;
  const sign = quote.changePercent >= 0 ? '+' : '-';
  return `${sign}${Math.abs(quote.changePercent).toFixed(2)}%`;
}
