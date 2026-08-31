/**
 * SAMPLE data for the /trading ("概覽") page — NOT approved facts.
 *
 * ⚠️ CMS Phase 4: this file is the **i18n-style seed fallback** for the Payload
 *    global `sample-trading-conditions` (`getSampleTradingTables`). When the DB is unset or arrays are empty, the
 *    front end uses these constants. Do NOT delete this file.
 *
 * ⚠️ Every number here is illustrative "示意數據" (labelled in the UI) and MUST
 *    NOT be written into docs/HATC_FACTS.md or presented as a real quote/condition.
 *
 * - PRICING_ROWS powers the "即時點差" live-quote table (Figma 44:206) — bid/ask/
 *   spread/change are design placeholders. The approved average spreads
 *   (gold 27 / silver 30) live on /products (`tradingConditions.ts`), linked from
 *   this section's CTA — CMS sample tables must NEVER overwrite those facts.
 * - ACCOUNT_ROWS powers the "交易帳戶比較" table (Figma 44:86). The two-tier
 *   Standard/Professional structure is an illustrative FORMAT (owner-approved as
 *   sample, 2026-08-10); most values render "待確認" until the owner supplies
 *   real account tiers. Instruments/platform reuse approved product names.
 *
 * Values are locale-neutral; labels/units come from i18n (trading.*).
 */

export type PricingRow = {
  symbol: string;
  /** key under trading.pricing.names.* */
  nameKey: 'londonGold' | 'kilobarHkd';
  bid: string;
  ask: string;
  spread: string;
  change: string;
};

export const PRICING_ROWS: ReadonlyArray<PricingRow> = [
  {
    symbol: 'XAU / USD',
    nameKey: 'londonGold',
    bid: '2,342.80',
    ask: '2,342.30',
    spread: '0.50',
    change: '+0.12%'
  },
  {
    symbol: 'XAU / HKD',
    nameKey: 'kilobarHkd',
    bid: '18,312.50',
    ask: '18,310.20',
    spread: '2.30',
    change: '+0.08%'
  }
];

/** A cell value: a pending placeholder, an i18n text key, a check, a priority
 *  check, or a dash. */
export type AccountCell =
  | {type: 'pending'}
  | {type: 'text'; key: string}
  | {type: 'check'}
  | {type: 'priority'}
  | {type: 'dash'};

export type AccountRow = {
  /** key under trading.accounts.rows.* */
  key: string;
  standard: AccountCell;
  professional: AccountCell;
};

export const ACCOUNT_ROWS: ReadonlyArray<AccountRow> = [
  {key: 'minDeposit', standard: {type: 'pending'}, professional: {type: 'pending'}},
  {
    key: 'instruments',
    standard: {type: 'text', key: 'instrumentsStandard'},
    professional: {type: 'text', key: 'instrumentsPro'}
  },
  {key: 'spread', standard: {type: 'pending'}, professional: {type: 'pending'}},
  {key: 'leverage', standard: {type: 'pending'}, professional: {type: 'pending'}},
  {
    key: 'platform',
    standard: {type: 'text', key: 'platformValue'},
    professional: {type: 'text', key: 'platformValue'}
  },
  {key: 'support', standard: {type: 'check'}, professional: {type: 'priority'}},
  {key: 'education', standard: {type: 'check'}, professional: {type: 'check'}},
  {key: 'manager', standard: {type: 'dash'}, professional: {type: 'check'}}
];
