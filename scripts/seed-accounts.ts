/**
 * Seed the `/accounts` CMS collections (account-tiers / account-benefits /
 * account-spreads / account-platforms) and the account FAQs (faqs collection,
 * `accounts` category) from the i18n SAMPLE copy, so they exist in `/admin` and
 * are owner-editable. Content is read straight from `src/messages/*` so it stays
 * in sync with the front-end fallback.
 *
 * ⚠️ Governance: tier / spread numbers are illustrative SAMPLE rows (the
 * front-end keeps the「示意數據」label), NOT approved facts. Approved figures stay
 * in tradingConditions.ts.
 *
 * Idempotent: seeds a collection only when it is empty (checks total docs), so
 * re-running never duplicates.
 *
 * Run: npm run payload -- run scripts/seed-accounts.ts
 */
import {getPayload} from 'payload';
import config from '@payload-config';

import zhHant from '../src/messages/zh-Hant.json';
import zhHans from '../src/messages/zh-Hans.json';
import en from '../src/messages/en.json';

type Loc = 'zh-Hant' | 'zh-Hans' | 'en';
const LOCALES: Loc[] = ['zh-Hant', 'zh-Hans', 'en'];

const MESSAGES = {'zh-Hant': zhHant, 'zh-Hans': zhHans, en} as Record<
  Loc,
  Record<string, unknown>
>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const acc = (loc: Loc): any => (MESSAGES[loc] as any).accounts ?? {};

const BENEFIT_ICONS = ['percent', 'zap', 'creditCard', 'monitor'];
const PANEL_LABELS = ['MT4', 'MT5', 'TradingView'];

const payload = await getPayload({config});

// Dynamic-slug Local API calls (create/update/count/find) don't narrow well with
// a string collection name; route them through a loosely-typed handle. The DB
// shape is still validated at runtime by Payload against the collection config.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const p = payload as any;

/**
 * Seed a collection when empty. `base` builds the create payload (zh-Hant),
 * `localized` returns only the localized fields for a given locale.
 */
async function seedCollection<T>(
  collection: string,
  rows: {'zh-Hant': T; 'zh-Hans': T; en: T}[],
  base: (row: T, index: number) => Record<string, unknown>,
  localized: (row: T) => Record<string, unknown>
): Promise<void> {
  const existing = await p.count({collection});
  if (existing.totalDocs > 0) {
    payload.logger.info(`Skip ${collection} (${existing.totalDocs} docs exist)`);
    return;
  }

  for (let i = 0; i < rows.length; i++) {
    const created = await p.create({
      collection,
      locale: 'zh-Hant',
      data: {...base(rows[i]['zh-Hant'], i), ...localized(rows[i]['zh-Hant'])}
    });

    for (const loc of ['zh-Hans', 'en'] as const) {
      await p.update({
        collection,
        id: created.id,
        locale: loc,
        data: localized(rows[i][loc])
      });
    }
  }
  payload.logger.info(`Seeded ${collection} (${rows.length} rows)`);
}

/** Zip the same array index across the three locales into one row object. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function zip<T>(pick: (a: any) => T[]): {
  'zh-Hant': T;
  'zh-Hans': T;
  en: T;
}[] {
  const hant = pick(acc('zh-Hant'));
  const hans = pick(acc('zh-Hans'));
  const eng = pick(acc('en'));
  return hant.map((_, i) => ({
    'zh-Hant': hant[i],
    'zh-Hans': hans[i],
    en: eng[i]
  }));
}

// account-tiers
type Tier = {
  code: string;
  badge: string;
  popular: boolean;
  name: string;
  desc: string;
  minDeposit: string;
  spread: string;
  commission: string;
  leverage: string;
  execution: string;
  platform: string;
};
await seedCollection<Tier>(
  'account-tiers',
  zip<Tier>((a) => (a.tiersSample as Tier[]) ?? []),
  (row, i) => ({code: row.code, popular: Boolean(row.popular), order: i, enabled: true}),
  (row) => ({
    name: row.name,
    badge: row.badge,
    desc: row.desc,
    minDeposit: row.minDeposit,
    spread: row.spread,
    commission: row.commission,
    leverage: row.leverage,
    execution: row.execution,
    platform: row.platform
  })
);

// account-benefits
type Benefit = {title: string; desc: string};
await seedCollection<Benefit>(
  'account-benefits',
  zip<Benefit>((a) => (a.benefits?.items as Benefit[]) ?? []),
  (_row, i) => ({icon: BENEFIT_ICONS[i] ?? 'percent', order: i, enabled: true}),
  (row) => ({title: row.title, desc: row.desc})
);

// account-spreads
type Spread = {pair: string; bid: string; ask: string; spread: string};
await seedCollection<Spread>(
  'account-spreads',
  zip<Spread>((a) => (a.spreadsSample as Spread[]) ?? []),
  (row, i) => ({bid: row.bid, ask: row.ask, order: i, enabled: true}),
  (row) => ({pair: row.pair, spread: row.spread})
);

// account-platforms
type Platform = {name: string; desc: string};
await seedCollection<Platform>(
  'account-platforms',
  zip<Platform>((a) => (a.platforms?.items as Platform[]) ?? []),
  (_row, i) => ({panelLabel: PANEL_LABELS[i] ?? '', order: i, enabled: true}),
  (row) => ({name: row.name, desc: row.desc})
);

// faqs (accounts category) — only seed when no accounts FAQ exists yet.
type Qa = {q: string; a: string};
const existingAccountFaqs = await payload.find({
  collection: 'faqs',
  where: {category: {equals: 'accounts'}},
  limit: 1,
  depth: 0
});
if (existingAccountFaqs.docs.length > 0) {
  payload.logger.info('Skip faqs/accounts (already exist)');
} else {
  const rows = zip<Qa>((a) => (a.faq?.items as Qa[]) ?? []);
  for (let i = 0; i < rows.length; i++) {
    const created = await payload.create({
      collection: 'faqs',
      locale: 'zh-Hant',
      data: {
        category: 'accounts',
        order: i,
        enabled: true,
        question: rows[i]['zh-Hant'].q,
        answer: rows[i]['zh-Hant'].a
      }
    });
    for (const loc of ['zh-Hans', 'en'] as const) {
      await payload.update({
        collection: 'faqs',
        id: created.id,
        locale: loc,
        data: {question: rows[i][loc].q, answer: rows[i][loc].a}
      });
    }
  }
  payload.logger.info(`Seeded faqs/accounts (${rows.length} rows)`);
}

payload.logger.info('Accounts seeding done.');
process.exit(0);
