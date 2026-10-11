/**
 * APPROVED trading conditions — the single source of truth in code for
 * docs/HATC_FACTS.md → "CFD business" → "Account types & trading conditions"
 * (owner-supplied MT5 trade-group configuration, 2026-10-11).
 *
 * ✅ These are REAL, approved company facts, so the UI presents them plainly —
 *    NO「示意數據」label (unlike src/components/home/sampleMarketData.ts).
 * ✅ Governance: facts stay in code and are NOT owner-editable in the CMS. The
 *    owner edits surrounding marketing copy (i18n / CMS globals), never these
 *    numbers.
 * ⚠️ RETIRED 2026-10-11 and must never reappear anywhere on the site: the old
 *    average spreads (gold 27 / silver 30), leverage 1:500 and 1:1000, and all
 *    per-lot commission figures.
 * ⚠️ Still owner-pending — never fabricate: minimum lot size, fees and
 *    execution mode. The UI renders those as "將另行公佈 / To be announced"
 *    (products.conditions.pending).
 *
 * Platform is MetaTrader 5. MT4 is NOT offered (owner 2026-10-11).
 * Labels/units come from i18n; every value below is locale-neutral.
 */

/** The three tradeable CFD products (owner 2026-10-11). Platinum is NOT offered. */
export type ProductKey = 'gold' | 'silver' | 'kilobar';

/** Leverage is the same for every tier and every product. */
export const MAX_LEVERAGE = '1:100';

/** Contract-size unit — picks the products.conditions.contractSize* message. */
export type ContractUnit = 'oz' | 'gram';

/**
 * Trading hours, identical for all three products (owner 2026-10-11).
 * Times are Hong Kong time (GMT+8); "summer"/"winter" follow the market's
 * daylight-saving schedule — the owner has not supplied switch dates, so the
 * UI must not state them. Each trading day pauses for the daily break.
 */
export const TRADING_HOURS = {
  summer: {open: '06:00', close: '04:45', breakFrom: '05:00', breakTo: '06:00'},
  winter: {open: '07:00', close: '05:45', breakFrom: '06:00', breakTo: '07:00'}
} as const;

export type CfdProduct = {
  /** message key under products.items.* */
  key: ProductKey;
  /** symbol as displayed on the site */
  symbol: string;
  /** symbol used by the MT5 quote gateway (see lib/marketQuoteTypes.ts) */
  gatewaySymbol: string;
  /** price decimals — 1 point = 10^-digits (gold 0.01, silver 0.001) */
  digits: number;
  /**
   * Contract size per lot (owner 2026-10-11). Silver is 5,000 oz per the
   * owner, which deliberately overrides the 1,000 the quote gateway reports.
   */
  contractSize: number;
  contractUnit: ContractUnit;
  /**
   * Lowest spread across account tiers, in points (= the VIP tier). Pages that
   * cannot show the per-tier breakdown render this as "X 點起" and link to
   * /accounts (owner 2026-10-11).
   */
  spreadFrom: number;
  leverage: string;
};

export const CFD_PRODUCTS: ReadonlyArray<CfdProduct> = [
  {
    key: 'gold',
    symbol: 'XAU/USD',
    gatewaySymbol: 'XAUUSD',
    digits: 2,
    contractSize: 100,
    contractUnit: 'oz',
    spreadFrom: 20,
    leverage: MAX_LEVERAGE
  },
  {
    key: 'silver',
    symbol: 'XAG/USD',
    gatewaySymbol: 'XAGUSD',
    digits: 3,
    contractSize: 5000,
    contractUnit: 'oz',
    spreadFrom: 30,
    leverage: MAX_LEVERAGE
  },
  {
    key: 'kilobar',
    symbol: 'RKG/CNH',
    gatewaySymbol: 'RKGCNH',
    digits: 2,
    contractSize: 1000,
    contractUnit: 'gram',
    spreadFrom: 35,
    leverage: MAX_LEVERAGE
  }
];

export type AccountTierKey = 'mini' | 'standard' | 'pro' | 'vip';

/** Spread per product, in points. */
export type SpreadsByProduct = Readonly<Record<ProductKey, number>>;

export type AccountTier = {
  /** message key under accounts.tiers.items.* */
  key: AccountTierKey;
  /** tier code as configured in MT5 (locale-neutral) */
  code: string;
  /** minimum deposit in USD */
  minDepositUsd: number;
  leverage: string;
  spreads: SpreadsByProduct;
  /**
   * Fact-derived badge (i18n key under accounts.tiers.badges) — these state
   * which tier holds the lowest deposit / lowest spread in the table above.
   * Popularity-style badges ("最受歡迎") would be fabricated marketing and are
   * deliberately absent.
   */
  badge?: 'lowestDeposit' | 'lowestSpread';
};

export const ACCOUNT_TIERS: ReadonlyArray<AccountTier> = [
  {
    key: 'mini',
    code: 'Mini',
    minDepositUsd: 100,
    leverage: MAX_LEVERAGE,
    spreads: {gold: 33, silver: 44, kilobar: 42},
    badge: 'lowestDeposit'
  },
  {
    key: 'standard',
    code: 'Standard',
    minDepositUsd: 300,
    leverage: MAX_LEVERAGE,
    spreads: {gold: 30, silver: 40, kilobar: 40}
  },
  {
    key: 'pro',
    code: 'Pro',
    minDepositUsd: 1000,
    leverage: MAX_LEVERAGE,
    spreads: {gold: 28, silver: 38, kilobar: 40}
  },
  {
    key: 'vip',
    code: 'VIP',
    minDepositUsd: 5000,
    leverage: MAX_LEVERAGE,
    spreads: {gold: 20, silver: 30, kilobar: 35},
    badge: 'lowestSpread'
  }
];
