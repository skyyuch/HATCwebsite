import type {Locale} from '@/i18n/routing';

/**
 * Real screenshots of HATC's own trading terminal, captured 2026-10-11 from the
 * uni-app x H5 build (the same codebase that powers the mobile app), replacing
 * the Figma template's generic device mockups.
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
 * The terminal ships in Simplified Chinese only, so the owner decided
 * (2026-10-11) to show the screenshots on the zh-Hans site only. The other
 * locales keep the generic mockup and its「示意」label until the terminal is
 * localised.
 */

/** Keyed by the non-localized `panelLabel` of the `trading-platforms` entry. */
export const TERMINAL_SCREENSHOTS: Readonly<Record<string, string>> = {
  'HATC App': '/platforms/terminal-gold-chart.png',
  'Web Trading': '/platforms/terminal-silver-chart.png'
};

export const TERMINAL_HERO = '/platforms/terminal-home.png';

/** True for locales whose language matches the terminal's UI language. */
export function hasTerminalScreenshots(locale: Locale): boolean {
  return locale === 'zh-Hans';
}

export type TerminalVisual = {
  src: string;
  kind: 'upload' | 'screenshot';
};

/**
 * Shared image precedence for anything that pictures a platform: owner upload
 * (CMS) → real terminal capture → `null`.
 *
 * `null` means "no honest image available", and each surface supplies its own
 * placeholder: `/platforms` falls back to the Figma device mockup (labelled
 * 「示意」), `/accounts` to a branded gradient panel. Never substitute an image
 * of something that is not HATC's terminal without that label.
 */
export function resolveTerminalVisual(
  platform: {visual?: string; panelLabel: string},
  locale: Locale
): TerminalVisual | null {
  if (platform.visual) return {src: platform.visual, kind: 'upload'};

  const screenshot = hasTerminalScreenshots(locale)
    ? TERMINAL_SCREENSHOTS[platform.panelLabel]
    : undefined;
  return screenshot ? {src: screenshot, kind: 'screenshot'} : null;
}
