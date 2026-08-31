/**
 * Seed the `/funding` CMS content from the i18n SAMPLE copy so it exists in
 * `/admin` and is owner-editable. Seeds the `funding-methods` collection for both
 * directions — deposit rows (`type: deposit`) from `funding.deposit.methodsSample`
 * and withdrawal rows (`type: withdrawal`) from `funding.withdraw.methodsSample` —
 * read straight from `src/messages/*` so it stays in sync with the front-end fallback.
 *
 * ⚠️ Governance:
 * - funding-methods rows are illustrative SAMPLE data (the front-end keeps the
 *   「示意數據」label), NOT approved facts or delivery guarantees.
 * - The `testimonials` collection is deliberately NOT seeded — testimonials are
 *   real company facts and must be entered by the owner (no fabricated seeds).
 * - The `funding-page` global needs no seed (empty = i18n fallback copy).
 *
 * Idempotent: seeds a collection only when it is empty. Re-running never dupes.
 *
 * Run: npm run payload -- run scripts/seed-funding.ts
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
const fund = (loc: Loc): any => (MESSAGES[loc] as any).funding ?? {};

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
  const hant = pick(fund('zh-Hant'));
  const hans = pick(fund('zh-Hans'));
  const eng = pick(fund('en'));
  return hant.map((_, i) => ({
    'zh-Hant': hant[i],
    'zh-Hans': hans[i],
    en: eng[i]
  }));
}

// funding-methods (deposit + withdrawal share one collection, routed by `type`)
type Method = {
  method: string;
  time: string;
  fee: string;
  free: boolean;
  currencies: string;
};

/**
 * Seed one direction's channel rows. Idempotent per-type: seeds only when no row
 * of that `type` exists, so re-running (or an existing withdrawal set) never dupes
 * and still lets the other direction seed.
 */
async function seedFundingMethods(
  type: 'deposit' | 'withdrawal',
  sampleKey: 'deposit' | 'withdraw'
): Promise<void> {
  const existing = await p.count({
    collection: 'funding-methods',
    where: {type: {equals: type}}
  });
  if (existing.totalDocs > 0) {
    payload.logger.info(
      `Skip funding-methods/${type} (${existing.totalDocs} docs exist)`
    );
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = zip<Method>((a: any) => (a[sampleKey]?.methodsSample as Method[]) ?? []);

  for (let i = 0; i < rows.length; i++) {
    const hant = rows[i]['zh-Hant'];
    const created = await p.create({
      collection: 'funding-methods',
      locale: 'zh-Hant',
      data: {
        type,
        free: Boolean(hant.free),
        order: i,
        enabled: true,
        method: hant.method,
        time: hant.time,
        fee: hant.fee,
        currencies: hant.currencies
      }
    });

    for (const loc of ['zh-Hans', 'en'] as const) {
      const row = rows[i][loc];
      await p.update({
        collection: 'funding-methods',
        id: created.id,
        locale: loc,
        data: {
          method: row.method,
          time: row.time,
          fee: row.fee,
          currencies: row.currencies
        }
      });
    }
  }
  payload.logger.info(`Seeded funding-methods/${type} (${rows.length} rows)`);
}

await seedFundingMethods('deposit', 'deposit');
await seedFundingMethods('withdrawal', 'withdraw');

payload.logger.info('Funding seeding done.');
process.exit(0);
