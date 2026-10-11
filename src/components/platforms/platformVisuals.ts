/**
 * Single source of truth for "what picture do we show for this platform?".
 *
 * Every surface that pictures a trading platform (`/platforms` hero and tabs,
 * `/accounts` cards) resolves through `resolvePlatformVisual` so the honesty
 * rules below can never drift between pages.
 *
 * ── Terminal captures ───────────────────────────────────────────────────────
 * Real screenshots of HATC's own terminal, captured 2026-10-11 from the
 * uni-app x H5 build (the same codebase that powers the mobile app).
 *
 * ⚠️ Governance rules that produced these files — keep them if you recapture:
 * 1. The sell/buy action bar is cropped out. The terminal's guest spread does
 *    not match the approved per-tier spreads in HATC_FACTS.md, so it must never
 *    be legible on the site.
 * 2. No browser chrome, so the capture environment's host name never appears.
 * 3. Only screens whose figures are internally consistent were used — some
 *    terminal screens showed an open/high/low that contradicted the last price.
 * 4. The guest "trade" tab was rejected outright: it advertises a sign-up bonus,
 *    a 30-minute funding time and a "zero risk" claim, none of which are
 *    approved facts and all of which the site is forbidden from repeating.
 * 5. Quotes inside an image are a point in time, hence the caption on the panel
 *    (platforms.types.screenshotNote) — these are NOT live prices.
 *
 * The terminal ships in Simplified Chinese only (the uni-app project has no
 * i18n layer at all), so "wait for a localised build" would mean never showing
 * a real screen on the zh-Hant/en sites. The owner decided 2026-10-11 to show
 * the captures in every locale: it is HATC's actual product, and the caption
 * already tells the reader what they are looking at.
 *
 * ── Brand marks ─────────────────────────────────────────────────────────────
 * MetaTrader 5 is a third-party platform and we have no capture of HATC's own
 * MT5 server, so that card shows the official MetaTrader 5 wordmark instead of
 * a screen. MetaQuotes' own screenshots are deliberately NOT used: every one of
 * them shows a forex Market Watch, and the site must not depict currency pairs
 * as HATC products.
 */

/** Keyed by the non-localized `panelLabel` of the `trading-platforms` entry. */
const TERMINAL_SCREENSHOTS: Readonly<Record<string, ImageAsset>> = {
  'HATC App': {src: '/platforms/terminal-gold-chart.png', width: 860, height: 1430},
  'Web Trading': {src: '/platforms/terminal-silver-chart.png', width: 860, height: 1430}
};

/**
 * Official MetaTrader 5 wordmark, white variant, from the MetaQuotes Media
 * Gallery (https://www.metaquotes.com/en/media-gallery), which licenses these
 * files for use on broker websites. Their usage terms ask that the logo is not
 * recoloured, restyled, stretched or combined with extra elements — hence the
 * untouched white original on a plain panel.
 */
const BRAND_MARKS: Readonly<Record<string, ImageAsset>> = {
  MT5: {src: '/platforms/metatrader5-logo-white.png', width: 1024, height: 176}
};

export const TERMINAL_HERO: ImageAsset = {
  src: '/platforms/terminal-home.png',
  width: 860,
  height: 830
};

export type ImageAsset = {src: string; width: number; height: number};

export type PlatformVisual =
  /** Owner-uploaded via the CMS; aspect ratio unknown, so it is never framed. */
  | {kind: 'upload'; src: string}
  /** A real capture of HATC's own terminal — framed as a device, captioned. */
  | {kind: 'screenshot'; asset: ImageAsset}
  /** An official third-party logo — shown as a mark, never as a screen. */
  | {kind: 'brand'; asset: ImageAsset};

/**
 * Image precedence: owner upload (CMS) → real terminal capture → official
 * brand mark → `null`.
 *
 * `null` means "no honest image available" and callers fall back to a branded
 * panel showing the platform's `panelLabel`. Never substitute a stock device
 * render or a competitor's screen for a platform we cannot picture.
 */
export function resolvePlatformVisual(platform: {
  visual?: string;
  panelLabel: string;
}): PlatformVisual | null {
  if (platform.visual) return {kind: 'upload', src: platform.visual};

  const screenshot = TERMINAL_SCREENSHOTS[platform.panelLabel];
  if (screenshot) return {kind: 'screenshot', asset: screenshot};

  const brand = BRAND_MARKS[platform.panelLabel];
  if (brand) return {kind: 'brand', asset: brand};

  return null;
}
