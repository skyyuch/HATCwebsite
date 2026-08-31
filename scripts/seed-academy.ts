/**
 * Migrate the three i18n Gold-Academy seed cards (`home.goldAcademy.articles`
 * a1–a3) into the `academy-articles` CMS collection so they become real,
 * owner-editable / deletable DB rows in `/admin` (instead of being invisible
 * i18n fallback that can never be removed).
 *
 * Slugs (a1/a2/a3), covers (the existing Figma placeholder thumbs) and category
 * tags (already aligned to the canonical taxonomy) match what the front-end
 * currently renders, so nothing changes visually — the cards just become
 * editable.
 *
 * ⚠️ Governance:
 * - These are neutral educational placeholders, not facts. Body is a minimal
 *   Lexical paragraph built from the excerpt (no invented full article).
 * - No competitor content is copied. No fabricated stats / testimonials / awards.
 *
 * Idempotent: seeds only when the collection is empty; re-running never dupes or
 * clobbers owner edits.
 *
 * Run: npm run payload -- run scripts/seed-academy.ts
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

type SeedItem = {tag: string; title: string; excerpt: string; imageAlt: string};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function articles(loc: Loc): Record<string, SeedItem> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((MESSAGES[loc] as any).home?.goldAcademy?.articles ?? {}) as Record<
    string,
    SeedItem
  >;
}

const KEYS = ['a1', 'a2', 'a3'] as const;

const COVERS: Record<(typeof KEYS)[number], string> = {
  a1: 'public/figma/raw/raw_16.png',
  a2: 'public/figma/raw/raw_13.png',
  a3: 'public/figma/raw/raw_12.png'
};

/** Minimal Lexical doc from plain text (mirrors the reader's fallback shape). */
function lexicalFromPlainText(text: string) {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: [
        {
          type: 'paragraph',
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr',
          children: [
            {
              type: 'text',
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text,
              version: 1
            }
          ]
        }
      ]
    }
  };
}

const payload = await getPayload({config});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const p = payload as any;

async function seedAcademy(): Promise<void> {
  const existing = await p.count({collection: 'academy-articles'});
  if (existing.totalDocs > 0) {
    payload.logger.info(
      `Skip academy-articles (${existing.totalDocs} docs already exist)`
    );
    return;
  }

  for (let i = 0; i < KEYS.length; i++) {
    const key = KEYS[i];
    const hant = articles('zh-Hant')[key];
    if (!hant?.title) continue;

    // Import the placeholder cover into the Media library (idempotent by run).
    let coverId: number | string | undefined;
    const coverPath = resolve(process.cwd(), COVERS[key]);
    if (existsSync(coverPath)) {
      const media = await p.create({
        collection: 'media',
        locale: 'zh-Hant',
        filePath: coverPath,
        data: {alt: hant.imageAlt || hant.title}
      });
      for (const loc of ['zh-Hans', 'en'] as const) {
        const item = articles(loc)[key];
        await p.update({
          collection: 'media',
          id: media.id,
          locale: loc,
          data: {alt: item?.imageAlt || item?.title || ''}
        });
      }
      coverId = media.id;
    } else {
      payload.logger.warn(`Cover not found for ${key}: ${COVERS[key]}`);
    }

    const created = await p.create({
      collection: 'academy-articles',
      locale: 'zh-Hant',
      data: {
        slug: key,
        order: i,
        enabled: true,
        title: hant.title,
        excerpt: hant.excerpt,
        category: hant.tag,
        body: lexicalFromPlainText(hant.excerpt),
        ...(coverId ? {cover: coverId} : {})
      }
    });

    for (const loc of ['zh-Hans', 'en'] as const) {
      const item = articles(loc)[key];
      if (!item) continue;
      await p.update({
        collection: 'academy-articles',
        id: created.id,
        locale: loc,
        data: {
          title: item.title,
          excerpt: item.excerpt,
          category: item.tag,
          body: lexicalFromPlainText(item.excerpt)
        }
      });
    }

    payload.logger.info(`Seeded academy-article "${key}" (${hant.title})`);
  }
}

await seedAcademy();

payload.logger.info('Academy seeding done.');
process.exit(0);
