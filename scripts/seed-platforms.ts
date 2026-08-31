/**
 * Seed the `/platforms` CMS content (trading-platforms collection + the platform
 * FAQs in the `faqs` collection, `platforms` category) from the i18n copy, so
 * they exist in `/admin` and are owner-editable. Content is read straight from
 * `src/messages/*` so it stays in sync with the front-end fallback.
 *
 * ⚠️ Governance: platform names/copy are placeholder-ish (owner will supply real
 * device names/screenshots later); no fabricated stats. Product/feature claims
 * are already converged to gold/silver in the messages.
 *
 * Idempotent: seeds a collection only when it is empty, so re-running never
 * duplicates.
 *
 * Run: npm run payload -- run scripts/seed-platforms.ts
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
const plat = (loc: Loc): any => (MESSAGES[loc] as any).platforms ?? {};

const payload = await getPayload({config});

// Dynamic-slug Local API calls don't narrow with a string collection name;
// route them through a loosely-typed handle. Payload still validates at runtime.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const p = payload as any;

/** Zip the same array index across the three locales into one row object. */
function zip<T>(pick: (a: Record<string, unknown>) => T[]): {
  'zh-Hant': T;
  'zh-Hans': T;
  en: T;
}[] {
  const hant = pick(plat('zh-Hant'));
  const hans = pick(plat('zh-Hans'));
  const eng = pick(plat('en'));
  return hant.map((_, i) => ({
    'zh-Hant': hant[i],
    'zh-Hans': hans[i],
    en: eng[i]
  }));
}

// trading-platforms
type Platform = {
  name: string;
  panelLabel: string;
  tagline: string;
  desc: string;
};
const existingPlatforms = await p.count({collection: 'trading-platforms'});
if (existingPlatforms.totalDocs > 0) {
  payload.logger.info(
    `Skip trading-platforms (${existingPlatforms.totalDocs} docs exist)`
  );
} else {
  const rows = zip<Platform>(
    (a) => ((a.types as {items?: Platform[]})?.items as Platform[]) ?? []
  );
  for (let i = 0; i < rows.length; i++) {
    const created = await p.create({
      collection: 'trading-platforms',
      locale: 'zh-Hant',
      data: {
        panelLabel: rows[i]['zh-Hant'].panelLabel,
        order: i,
        enabled: true,
        name: rows[i]['zh-Hant'].name,
        tagline: rows[i]['zh-Hant'].tagline,
        desc: rows[i]['zh-Hant'].desc
      }
    });
    for (const loc of ['zh-Hans', 'en'] as const) {
      await p.update({
        collection: 'trading-platforms',
        id: created.id,
        locale: loc,
        data: {
          name: rows[i][loc].name,
          tagline: rows[i][loc].tagline,
          desc: rows[i][loc].desc
        }
      });
    }
  }
  payload.logger.info(`Seeded trading-platforms (${rows.length} rows)`);
}

// faqs (platforms category)
type Qa = {q: string; a: string};
const existingPlatformFaqs = await payload.find({
  collection: 'faqs',
  where: {category: {equals: 'platforms'}},
  limit: 1,
  depth: 0
});
if (existingPlatformFaqs.docs.length > 0) {
  payload.logger.info('Skip faqs/platforms (already exist)');
} else {
  const rows = zip<Qa>(
    (a) => ((a.faq as {items?: Qa[]})?.items as Qa[]) ?? []
  );
  for (let i = 0; i < rows.length; i++) {
    const created = await payload.create({
      collection: 'faqs',
      locale: 'zh-Hant',
      data: {
        category: 'platforms',
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
  payload.logger.info(`Seeded faqs/platforms (${rows.length} rows)`);
}

payload.logger.info('Platforms seeding done.');
process.exit(0);
