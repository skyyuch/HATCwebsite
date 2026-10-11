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
