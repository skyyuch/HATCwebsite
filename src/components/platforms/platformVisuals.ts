/**
 * Single source of truth for "what picture do we show for this platform?".
 *
 * Every surface that pictures a trading platform (`/platforms` hero and tabs,
 * `/accounts` cards) resolves through `resolvePlatformVisual` so the honesty
 * rules below can never drift between pages, and renders the result with
 * `PlatformVisualPanel` so each kind always gets the same frame and caption.
 *
 * ── Terminal captures ───────────────────────────────────────────────────────
 * Real screens of HATC's own terminal (the uni-app x H5 build, the same
 * codebase that powers the mobile app), recaptured 2026-10-11 by
 * `scripts/capture-terminal.mjs`. Two viewports, because the app and the web
 * terminal must be told apart in a picture (owner 2026-10-11):
 *
 * - phone (430×932 CSS @2x) → shown in a phone frame;
 * - desktop (1000×820 CSS @2x) → shown in a browser frame. The H5 build is
 *   capped at 500px, so the capture is the app column centred on the page.
 *   That is genuinely what the web terminal looks like on a laptop; there is no
 *   wide desktop layout to photograph, and inventing one is not an option.
 *
 * ⚠️ Governance rules that produced these files — keep them if you recapture:
 * 1. The sell/buy action bar is cropped out (the script clips above it). The
 *    terminal's guest spread does not match the approved per-tier spreads in
 *    HATC_FACTS.md, so it must never be legible on the site. The same rule
 *    rules out the 自选/行情 watchlist screen, which prints that spread in a
 *    column, and the 合约属性 tab, whose lot sizes and session times are not
 *    the approved facts either.
 * 2. No browser chrome, so the capture environment's host name never appears.
 *    The browser frame on the site is our own markup; the host it prints is
 *    HATC's production web-terminal host from HATC_FACTS.md, not the host that
 *    was captured.
 * 3. Only screens whose figures are internally consistent were used: the daily
 *    (日K) view is captured because the default 分时 view reports an open/high/low
 *    that contradicts the last price, and it often has no chart data at all.
 * 4. The guest "trade" tab was rejected outright: it advertises a sign-up bonus,
 *    a 30-minute funding time and a "zero risk" claim, none of which are
 *    approved facts and all of which the site is forbidden from repeating. The
 *    guest home screen is not used either — the lower half is a third-party
 *    news feed (A-share filings, world news) that has nothing to do with HATC.
 * 5. Only the three approved CFD products (gold / silver / RMB kilobar) are
 *    captured. The gateway's guest whitelist also carries forex and index
 *    symbols, and those must never be depicted as HATC products.
 * 6. Quotes inside an image are a point in time, hence the caption on the panel
 *    (platforms.types.screenshotNote) — these are NOT live prices.
 *
 * The terminal ships in Simplified Chinese only (the uni-app project has no
 * i18n layer at all), so "wait for a localised build" would mean never showing
 * a real screen on the zh-Hant/en sites. The owner decided 2026-10-11 to show
 * the captures in every locale: it is HATC's actual product, and the caption
 * already tells the reader what they are looking at.
 *
 * ── Vendor screen (MetaTrader 5) ────────────────────────────────────────────
 * MetaTrader 5 is a third party and we have no capture of HATC's own MT5
 * server, so that card shows MetaQuotes' own platform screenshot
 * (metatrader5.com), supplied by the owner 2026-10-11.
 *
 * ⚠️ The owner explicitly accepted that this screen's Market Watch and chart
 * windows contain the vendor's demo symbols — forex pairs and US equities — and
 * relaxed the "never depict forex/equities" rule FOR THIS VENDOR SCREEN ONLY.
 * It does not extend anywhere else: HATC's product lines stay gold, silver and
 * the RMB kilobar everywhere on the site, and no product list, table, ticker or
 * copy may gain a non-approved instrument. To keep the picture from reading as
 * HATC's offering, every surface that shows it must print
 * `platforms.types.vendorNote`, which says what the screen is and names the
 * three products HATC actually offers. The demo account's gold level also
 * differs from today's market, which is the other reason for that caption.
 */

const PHONE_SCREEN = {width: 860, height: 1744} as const;
const DESKTOP_SCREEN = {width: 2000, height: 1520} as const;

/**
 * HATC's production web-terminal host (HATC_FACTS.md → "Official contact &
 * website"). Printed in the browser frame's address pill so the picture says
 * where the web terminal lives — never the host that was captured.
 */
export const WEB_TERMINAL_HOST = 'h5.hatcmarket.com';

export type ImageAsset = {src: string; width: number; height: number};

/** Keyed by the non-localized `panelLabel` of the `trading-platforms` entry. */
const PLATFORM_SCREENS: Readonly<
  Record<string, {phone?: ImageAsset; desktop?: ImageAsset}>
> = {
  'HATC App': {
    phone: {src: '/platforms/terminal-gold-chart.png', ...PHONE_SCREEN}
  },
  'Web Trading': {
    desktop: {src: '/platforms/terminal-web-silver.png', ...DESKTOP_SCREEN}
  }
};

/** MetaQuotes' own MetaTrader 5 screenshot — read the file header first. */
const VENDOR_SCREENS: Readonly<Record<string, ImageAsset>> = {
  MT5: {src: '/platforms/mt5-desktop.png', width: 2360, height: 1536}
};

/**
 * Hero picture for `/platforms`: the web terminal and the app side by side, so
 * the page opens on the two things HATC actually ships. Different products in
 * the two frames (gold on the web, the RMB kilobar on the phone) keeps the hero
 * from repeating the tab panels below it.
 */
export const TERMINAL_HERO = {
  desktop: {src: '/platforms/terminal-web-gold.png', ...DESKTOP_SCREEN},
  phone: {src: '/platforms/terminal-kilobar-chart.png', ...PHONE_SCREEN}
} as const;

export type PlatformVisual =
  /** Owner-uploaded via the CMS; aspect ratio unknown, so it is never framed. */
  | {kind: 'upload'; src: string}
  /** HATC's terminal on a phone — phone frame, point-in-time caption. */
  | {kind: 'phone'; asset: ImageAsset}
  /** HATC's web terminal in a browser — browser frame, same caption. */
  | {kind: 'browser'; asset: ImageAsset}
  /** Both of the above, for the hero. */
  | {kind: 'combo'; desktop: ImageAsset; phone: ImageAsset}
  /** A platform vendor's own screen — monitor frame, vendor caption. */
  | {kind: 'vendor'; asset: ImageAsset};

/** Which caption a surface must print under the picture, if any. */
export type VisualNote = 'screenshotNote' | 'vendorNote' | null;

export function visualNote(visual: PlatformVisual | null): VisualNote {
  if (!visual) return null;
  if (visual.kind === 'vendor') return 'vendorNote';
  if (visual.kind === 'upload') return null;
  return 'screenshotNote';
}

/**
 * Image precedence: owner upload (CMS) → real capture of HATC's terminal →
 * the platform vendor's own screen → `null`.
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

  const screens = PLATFORM_SCREENS[platform.panelLabel];
  if (screens?.phone) return {kind: 'phone', asset: screens.phone};
  if (screens?.desktop) return {kind: 'browser', asset: screens.desktop};

  const vendor = VENDOR_SCREENS[platform.panelLabel];
  if (vendor) return {kind: 'vendor', asset: vendor};

  return null;
}
