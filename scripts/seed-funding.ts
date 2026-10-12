/**
 * Seed the `/funding` CMS content from the i18n SAMPLE copy so it exists in
 * `/admin` and is owner-editable. Seeds the `funding-methods` collection for both
 * directions — deposit rows (`type: deposit`) from `funding.deposit.methodsSample`
 * and withdrawal rows (`type: withdrawal`) from `funding.withdraw.methodsSample` —
 * read straight from `src/messages/*` so it stays in sync with the front-end fallback.
 *
 * It also links the built-in placeholder background images into the `funding-page`
 * global so they are visible and replaceable in `/admin`. It deliberately does NOT
 * pre-fill that global's TEXT fields — see the governance note below.
 *
 * ⚠️ Governance:
 * - funding-methods rows are illustrative SAMPLE data (the front-end keeps the
 *   「示意數據」label), NOT approved facts or delivery guarantees.
 * - The `testimonials` collection is deliberately NOT seeded — testimonials are
 *   real company facts and must be entered by the owner (no fabricated seeds).
 * - **Never seed the `funding-page` global's text fields.** `pickText(cms, fallback)`
 *   prefers any non-empty CMS value, so a stored copy of the i18n default silently
 *   swallows every later i18n correction to that string. This script used to seed
 *   all 22 fields × 3 locales and that is exactly how it ate a red-line copy fix
 *   (第五十七輪). Empty is the correct state; the owner fills a field only when
 *   genuinely overriding it.
 *
 * Idempotent: seeds a collection only when it is empty, and the global only when it
 * has not been overridden yet. Re-running never dupes or clobbers owner edits.
 *
 * Run: npm run payload -- run scripts/seed-funding.ts
 */
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';

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

// funding-page background images: import the built-in Figma placeholder PNGs into
// the Media library and link them so the CMS upload fields show a preview matching
// what the front-end currently renders. Owner replaces them with real assets later.
// Idempotent: skips entirely once the global already has a hero image linked.
const IMAGE_MAP: {field: string; file: string; alt: Record<Loc, string>}[] = [
  {
    field: 'heroImage',
    file: 'public/figma/funding/hero.png',
    alt: {
      'zh-Hant': '入金與出金 Hero 背景圖（示意）',
      'zh-Hans': '入金与出金 Hero 背景图（示意）',
      en: 'Funding hero background (placeholder)'
    }
  },
  {
    field: 'depositImage',
    file: 'public/figma/funding/deposit.png',
    alt: {
      'zh-Hant': '入金說明配圖（示意）',
      'zh-Hans': '入金说明配图（示意）',
      en: 'Deposit section visual (placeholder)'
    }
  },
  {
    field: 'withdrawImage',
    file: 'public/figma/funding/withdraw.png',
    alt: {
      'zh-Hant': '出金說明配圖（示意）',
      'zh-Hans': '出金说明配图（示意）',
      en: 'Withdrawal section visual (placeholder)'
    }
  },
  {
    field: 'ctaImage',
    file: 'public/figma/funding/cta.png',
    alt: {
      'zh-Hant': 'CTA 背景圖（示意）',
      'zh-Hans': 'CTA 背景图（示意）',
      en: 'CTA background (placeholder)'
    }
  }
];

async function seedFundingImages(): Promise<void> {
  const current = await p.findGlobal({
    slug: 'funding-page',
    locale: 'zh-Hant',
    fallbackLocale: false,
    depth: 0
  });
  if (current?.heroImage) {
    payload.logger.info('Skip funding-page images (already linked)');
    return;
  }

  const linked: Record<string, number | string> = {};
  for (const {field, file, alt} of IMAGE_MAP) {
    const filePath = resolve(process.cwd(), file);
    if (!existsSync(filePath)) {
      payload.logger.warn(`Skip ${field}: file not found (${file})`);
      continue;
    }
    const media = await p.create({
      collection: 'media',
      locale: 'zh-Hant',
      filePath,
      data: {alt: alt['zh-Hant']}
    });
    for (const loc of ['zh-Hans', 'en'] as const) {
      await p.update({
        collection: 'media',
        id: media.id,
        locale: loc,
        data: {alt: alt[loc]}
      });
    }
    linked[field] = media.id;
  }

  if (Object.keys(linked).length > 0) {
    await p.updateGlobal({slug: 'funding-page', locale: 'zh-Hant', data: linked});
    payload.logger.info(
      `Linked funding-page images (${Object.keys(linked).length} media)`
    );
  }
}

await seedFundingImages();

payload.logger.info('Funding seeding done.');
process.exit(0);
