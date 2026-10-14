/**
 * Link the built-in placeholder background images into the `funding-page` global so
 * they are visible and replaceable in `/admin`. It deliberately does NOT pre-fill
 * that global's TEXT fields — see the governance note below.
 *
 * ⚠️ Governance:
 * - **`funding-methods` is no longer seeded (第六十九輪).** The owner supplied the
 *   real channels and the front-end dropped the「示意數據」label, so the old seed —
 *   Figma-template providers HATC does not offer (Neteller, Skrill, JCB, wire…) —
 *   would now publish fabricated channels as fact. The i18n sample arrays are
 *   deleted too; an empty collection simply hides the table section.
 * - The `testimonials` collection is deliberately NOT seeded — testimonials are
 *   real company facts and must be entered by the owner (no fabricated seeds).
 * - **Never seed the `funding-page` global's text fields.** `pickText(cms, fallback)`
 *   prefers any non-empty CMS value, so a stored copy of the i18n default silently
 *   swallows every later i18n correction to that string. This script used to seed
 *   all 22 fields × 3 locales and that is exactly how it ate a red-line copy fix
 *   (第五十七輪). Empty is the correct state; the owner fills a field only when
 *   genuinely overriding it.
 *
 * Idempotent: seeds the global only when it has not been overridden yet, so
 * re-running never clobbers owner edits.
 *
 * Run: npm run payload -- run scripts/seed-funding.ts
 */
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';

import {getPayload} from 'payload';
import config from '@payload-config';

type Loc = 'zh-Hant' | 'zh-Hans' | 'en';

const payload = await getPayload({config});

// Dynamic-slug Local API calls don't narrow well with a string collection name;
// route them through a loosely-typed handle. Payload still validates at runtime.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const p = payload as any;

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
