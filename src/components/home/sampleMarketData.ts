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

export const SAMPLE_TICKER: ReadonlyArray<{
  symbol: string;
  value: string;
  change: string;
  dir: TickerDir;
}> = [
  {symbol: 'XAU/USD', value: '2,342.80', change: '+18.60 +0.80%', dir: 'up'},
  {symbol: 'XAG/USD', value: '28.45', change: '+0.32 +1.14%', dir: 'up'},
  {symbol: 'XAU/HKD', value: '18,312.50', change: '-42.30 -0.23%', dir: 'down'},
  {symbol: 'USD/CNH', value: '7.2480', change: '+0.0085 +0.12%', dir: 'up'},
  {symbol: 'HKD/USD', value: '0.1281', change: '-0.0001 -0.01%', dir: 'down'},
  {symbol: 'XAU/EUR', value: '2,156.20', change: '+12.40 +0.58%', dir: 'up'}
];

export const SAMPLE_PRICE_CARDS: ReadonlyArray<{
  symbol: string;
  /** message key under home.goldServices.loco */
  nameKey: 'gold' | 'silver';
  value: string;
  change: string;
}> = [
  {symbol: 'XAU/USD', nameKey: 'gold', value: '2,342.80', change: '+1.42%'},
  {symbol: 'XAG/USD', nameKey: 'silver', value: '28.45', change: '+0.85%'}
];

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
