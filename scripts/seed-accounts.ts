/**
 * Seed the owner-editable `/accounts` CMS content from the i18n copy:
 * `account-benefits` cards and the account FAQs (`faqs` collection, `accounts`
 * category). Content is read straight from `src/messages/*` so it stays in sync
 * with the front-end fallback.
 *
 * ⚠️ REPLACE, not seed-once (changed 2026-10-11): the previous rows described
 * retired sample conditions (zero commission / RAW ECN / 1:500 / MetaTrader 4),
 * which must not survive in the database. Each run deletes the rows it owns and
 * re-creates them, so re-running is safe and always lands the current copy.
 * Owner edits made in /admin to these two sets are overwritten — run it only
 * when the i18n copy is the newer source.
 *
 * Account types and spreads are NOT seeded any more: they are approved facts
 * living in src/components/products/tradingConditions.ts and are deliberately
 * not CMS-editable. Platform cards come from the shared `trading-platforms`
 * collection (see scripts/seed-platforms.ts).
 *
 * Run: npm run payload -- run scripts/seed-accounts.ts
 */
import {getPayload} from 'payload';
import config from '@payload-config';

import zhHant from '../src/messages/zh-Hant.json';
import zhHans from '../src/messages/zh-Hans.json';
import en from '../src/messages/en.json';

type Loc = 'zh-Hant' | 'zh-Hans' | 'en';

const MESSAGES = {'zh-Hant': zhHant, 'zh-Hans': zhHans, en} as Record<
  Loc,
  Record<string, unknown>
>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const acc = (loc: Loc): any => (MESSAGES[loc] as any).accounts ?? {};

const BENEFIT_ICONS = ['percent', 'zap', 'creditCard', 'monitor'];

const payload = await getPayload({config});

// Dynamic-slug Local API calls don't narrow well with a string collection name;
// route them through a loosely-typed handle. Payload still validates at runtime.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const p = payload as any;

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

/** Create one doc per row, writing zh-Hant first then the other locales. */
async function createLocalized<T>(
  collection: string,
  rows: {'zh-Hant': T; 'zh-Hans': T; en: T}[],
  base: (row: T, index: number) => Record<string, unknown>,
  localized: (row: T) => Record<string, unknown>
): Promise<void> {
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
}

// account-benefits — replace all rows
type Benefit = {title: string; desc: string};
const benefitRows = zip<Benefit>((a) => (a.benefits?.items as Benefit[]) ?? []);
const existingBenefits = await p.find({
  collection: 'account-benefits',
  limit: 200,
  depth: 0
});
for (const doc of existingBenefits.docs) {
  await p.delete({collection: 'account-benefits', id: doc.id});
}
await createLocalized<Benefit>(
  'account-benefits',
  benefitRows,
  (_row, i) => ({icon: BENEFIT_ICONS[i] ?? 'percent', order: i, enabled: true}),
  (row) => ({title: row.title, desc: row.desc})
);
payload.logger.info(
  `account-benefits: replaced ${existingBenefits.docs.length} row(s) with ${benefitRows.length}`
);

// faqs (accounts category) — replace all rows
type Qa = {q: string; a: string};
const faqRows = zip<Qa>((a) => (a.faq?.items as Qa[]) ?? []);
const existingFaqs = await payload.find({
  collection: 'faqs',
  where: {category: {equals: 'accounts'}},
  limit: 200,
  depth: 0
});
for (const doc of existingFaqs.docs) {
  await payload.delete({collection: 'faqs', id: doc.id});
}
await createLocalized<Qa>(
  'faqs',
  faqRows,
  (_row, i) => ({category: 'accounts', order: i, enabled: true}),
  (row) => ({question: row.q, answer: row.a})
);
payload.logger.info(
  `faqs/accounts: replaced ${existingFaqs.docs.length} row(s) with ${faqRows.length}`
);

payload.logger.info('Accounts seeding done.');
process.exit(0);
