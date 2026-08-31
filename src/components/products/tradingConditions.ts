/**
 * APPROVED trading conditions — from docs/HATC_FACTS.md → "CFD business"
 * (owner-confirmed 2026-08-10).
 *
 * ✅ Unlike src/components/home/sampleMarketData.ts, these are REAL, approved
 *    company facts (not sample data), so the products page presents them plainly
 *    (no "示意數據" label):
 *      - average spread: gold 27 points, silver 30 points (reference averages)
 *      - max leverage: 1:100 (gold and silver)
 * ✅ Only gold and silver are offered. Platinum is NOT offered (owner 2026-08-10)
 *    — do not add it here or list it as tradeable.
 * ⚠️ Remaining conditions (minimum lot size, fees, execution mode) are still
 *    owner-supplied only and MUST NOT be fabricated. The UI renders them as
 *    "將另行公佈 / To be announced" (products.conditions.pending).
 *
 * The trading platform is MetaTrader 5, consistent with the rest of the site
 * (homepage MT5Showcase, About company profile). Labels/units come from i18n
 * (products.conditions.*); the numeric values below are locale-neutral.
 */
export type CfdProduct = {
  /** message key under products.items.* and products.conditions loco reuse */
  key: 'gold' | 'silver';
  /** instrument symbol (locale-neutral) */
  symbol: string;
  /** average spread in points (reference average) */
  spread: number;
  /** maximum leverage (locale-neutral ratio) */
  leverage: string;
};

export const CFD_PRODUCTS: ReadonlyArray<CfdProduct> = [
  {key: 'gold', symbol: 'XAU/USD', spread: 27, leverage: '1:100'},
  {key: 'silver', symbol: 'XAG/USD', spread: 30, leverage: '1:100'}
];
