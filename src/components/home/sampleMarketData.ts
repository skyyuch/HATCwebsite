import type {MarketSymbol} from '@/lib/marketQuoteTypes';

/**
 * SAMPLE / illustrative market data for the Figma-led homepage.
 *
 * ⚠️ These are NOT real quotes and NOT approved company facts. They must never
 * be written into docs/HATC_FACTS.md. Every place they render carries a
 * "示意數據 / Sample data" label (owner-approved development placeholders,
 * 2026-08-07). The owner replaces them with real data before launch.
 *
 * Numbers are locale-neutral and kept here as a single, easy-to-edit source.
 */

export const SAMPLE_HERO_PRICE = {
  value: '$2,342.80',
  change: '+1.42%',
  high: '$2,351.10',
  low: '$2,320.50'
} as const;

export type TickerDir = 'up' | 'down';

/**
 * Ticker fallback. The rows mirror MARKET_SYMBOLS (gold, silver, RMB kilobar)
 * so the degraded state never lists anything HATC does not trade.
 *
 * ⚠️ The earlier Figma rows XAU/HKD, USD/CNH, HKD/USD and XAU/EUR are retired
 * (2026-10-11): XAU/HKD is on the retired-values list, and FX pairs must never
 * appear as HATC products — not even as labelled sample data.
 */
export const SAMPLE_TICKER: ReadonlyArray<{
  symbol: string;
  value: string;
  change: string;
  dir: TickerDir;
}> = [
  {symbol: 'XAU/USD', value: '2,342.80', change: '+18.60 +0.80%', dir: 'up'},
  {symbol: 'XAG/USD', value: '28.45', change: '+0.32 +1.14%', dir: 'up'},
  {symbol: 'RKG/CNH', value: '546.10', change: '+4.30 +0.79%', dir: 'up'}
];

/**
 * Price-card fallback, keyed by gateway symbol so the cards always cover
 * exactly MARKET_SYMBOLS — the same three products as the ticker.
 */
export const SAMPLE_PRICE_CARDS: Record<
  MarketSymbol,
  {value: string; change: string}
> = {
  XAUUSD: {value: '2,342.80', change: '+1.42%'},
  XAGUSD: {value: '28.45', change: '+0.85%'},
  RKGCNH: {value: '546.10', change: '+0.79%'}
};

/**
 * Illustrative candlestick series for the gold-services chart mockup.
 * y/height are in the 160px-tall chart-canvas coordinate space (top-down);
 * `up` colours the body green, otherwise red.
 */
export const SAMPLE_CANDLES: ReadonlyArray<{
  x: number;
  bodyY: number;
  bodyH: number;
  wickTop: number;
  wickBottom: number;
  up: boolean;
}> = [
  {x: 30, bodyY: 70, bodyH: 34, wickTop: 58, wickBottom: 116, up: true},
  {x: 70, bodyY: 54, bodyH: 26, wickTop: 44, wickBottom: 92, up: true},
  {x: 110, bodyY: 62, bodyH: 30, wickTop: 50, wickBottom: 104, up: false},
  {x: 150, bodyY: 40, bodyH: 32, wickTop: 30, wickBottom: 84, up: true},
  {x: 190, bodyY: 52, bodyH: 24, wickTop: 40, wickBottom: 88, up: false},
  {x: 230, bodyY: 34, bodyH: 30, wickTop: 24, wickBottom: 76, up: true},
  {x: 270, bodyY: 46, bodyH: 28, wickTop: 36, wickBottom: 82, up: true}
];

/** Illustrative hero sparkline points (SVG path, 0–100 viewBox space). */
export const SAMPLE_SPARKLINE =
  'M0,28 L15,22 L30,26 L45,14 L60,18 L75,9 L90,13 L105,5';
