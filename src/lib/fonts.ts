import {Sora, Inter, Instrument_Serif, Geist} from 'next/font/google';

/**
 * Figma-led homepage typography (owner 2026-08-10): Sora for headings + body,
 * Inter for the market-ticker numbers. Exposed as CSS variables so tokens.css
 * can bridge them (`--font-app` = Sora, `--font-ticker` = Inter). Latin subset
 * only — CJK falls back to the system stack declared in tokens.css.
 */
export const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-sora',
  display: 'swap'
});

export const inter = Inter({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-inter',
  display: 'swap'
});

/**
 * Light /trading ("概覽") page typography (owner 2026-08-10, Figma frame 44:4):
 * Instrument Serif for the display headings + Geist for body/labels. Scoped to
 * the trading surface via `--font-serif-display` / `--font-geist` (referenced by
 * explicit classes there); the dark homepage/About/products keep Sora/Inter.
 */
export const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-instrument-serif',
  display: 'swap'
});

export const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap'
});
