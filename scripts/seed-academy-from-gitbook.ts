/**
 * Import the owner's GitBook knowledge base into the Gold Academy
 * (`academy-articles`). This is the OWNER'S OWN content (no competitor
 * copyright), imported faithfully — but the standard governance red lines
 * still hold (see below).
 *
 * Source: GitBook Content API (owner-supplied token + space). One GitBook page
 * = one academy article (owner decision, round 42). The root index page (a pure
 * table-of-contents) is skipped. Each page's Markdown is converted to Lexical
 * using Payload's own `convertMarkdownToLexical` (so nodes match the editor
 * exactly), then upserted by slug (keeping any existing cover).
 *
 * Governance applied here (owner decisions, round 42):
 *  - Contact info in bodies (phone / email / hatchk.com) is kept VERBATIM
 *    (owner choice; the anti-fraud pages need the real details to be verifiable,
 *    and the space is already public).
 *  - New company facts in the bodies are ALSO registered in HATC_FACTS.md
 *    separately (owner choice) — this script does not write FACTS.md.
 *  - The 16 gold-market / MT5 how-to pages are neutral education using clearly
 *    hypothetical example numbers; no fabricated HATC trading conditions.
 *  - Internal GitBook cross-links are flattened to plain text (the site uses
 *    `localePrefix: 'always'`, so a single hard-coded `/academy/x` URL cannot be
 *    locale-correct across zh-Hant/zh-Hans/en). External http/mailto/tel links
 *    are kept. Follow-up: locale-aware cross-links via a custom RichText
 *    converter.
 *  - Markdown tables → bullet lists (the academy body richText editor has no
 *    table feature; the detail view styles only h2/h3/p/ul/ol/li/a/blockquote).
 *
 * Titles/excerpts are zh-Hant (source); other locales are filled later by the
 * existing MT pipeline (`scripts/translate-content.ts --only academy-articles`)
 * and proofread in /admin. Category is set in all three locales immediately so
 * the /academy filter works right away.
 *
 * Requires: GITBOOK_API_TOKEN + GITBOOK_SPACE_ID + DATABASE_URI (.env).
 *
 * Run:      npm run payload -- run scripts/seed-academy-from-gitbook.ts
 * Dry run:  npm run payload -- run scripts/seed-academy-from-gitbook.ts -- --dry
 */
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';

import {getPayload} from 'payload';
import config from '@payload-config';
import {convertMarkdownToLexical, editorConfigFactory} from '@payloadcms/richtext-lexical';

import zhHant from '../src/messages/zh-Hant.json';
import zhHans from '../src/messages/zh-Hans.json';
import en from '../src/messages/en.json';

const DRY = process.argv.slice(2).includes('--dry');

const TOKEN = process.env.GITBOOK_API_TOKEN;
const SPACE = process.env.GITBOOK_SPACE_ID;

// ---- Fixed academy categories (must match src/messages academy.categories) ----
type Loc = 'zh-Hant' | 'zh-Hans' | 'en';
type MsgShape = {academy: {categories: string[]}};
const CATS: Record<Loc, string[]> = {
  'zh-Hant': (zhHant as unknown as MsgShape).academy.categories,
  'zh-Hans': (zhHans as unknown as MsgShape).academy.categories,
  en: (en as unknown as MsgShape).academy.categories
};
// canonical index: 0 黃金基礎 / 1 交易策略 / 2 技術分析 / 3 市場動態 / 4 風險管理 / 5 投資組合

/**
 * Per-page mapping keyed by GitBook slug (last path segment).
 * catIndex = fixed-category index (see above); cover = placeholder chosen by
 * topic (owner replaces later — pages have no inline images). These are the
 * only editorial decisions this script makes; the owner can re-tag in /admin.
 */
const PAGE_MAP: Record<string, {catIndex: number; cover: number}> = {
  // MT5 操作中心
  'how-to-read-mt5-gold-contract-specifications': {catIndex: 0, cover: 3},
  'how-to-place-and-close-gold-orders': {catIndex: 1, cover: 10},
  'how-to-set-stop-loss-and-take-profit-for-gold': {catIndex: 4, cover: 11},
  'how-to-check-gold-trading-history-and-account-report-on-mt5': {catIndex: 0, cover: 4},
  'how-to-set-up-gold-charts-and-timeframes-on-mt5': {catIndex: 2, cover: 8},
  'how-to-add-and-set-technical-indicators-for-gold-on-mt5': {catIndex: 2, cover: 13},
  'mt5-gold-margin-level': {catIndex: 4, cover: 16},
  'mt5-gold-modify-cancel-order': {catIndex: 1, cover: 3},
  'mt5-gold-common-errors': {catIndex: 0, cover: 4},
  'mt5-demo-vs-live-account': {catIndex: 0, cover: 10},
  // 認識黃金市場
  'how-hong-kong-gold-market-works': {catIndex: 0, cover: 1},
  'gold-products-comparison': {catIndex: 5, cover: 2},
  'what-drives-gold-prices': {catIndex: 3, cover: 6},
  'gold-units-and-price-conversion': {catIndex: 0, cover: 5},
  'how-to-calculate-gold-trading-profit-and-loss': {catIndex: 0, cover: 9},
  'how-to-calculate-gold-trading-margin-and-margin-level': {catIndex: 4, cover: 16},
  // 關於 HATC
  'what-is-hatc': {catIndex: 0, cover: 7},
  'company-name-history': {catIndex: 0, cover: 15},
  'member-008-history': {catIndex: 0, cover: 14},
  'services-and-trading-platform': {catIndex: 0, cover: 10},
  'trading-fees-and-process': {catIndex: 0, cover: 9},
  'frequently-asked-questions': {catIndex: 0, cover: 12}
};

const RAW = (n: number) => `public/figma/raw/raw_${n}.png`;
const PUBLISHED_AT = '2026-09-01';
const ORDER_START = 27; // existing academy articles occupy 0–26

// ---------------------------------------------------------------------------
// GitBook API
// ---------------------------------------------------------------------------
type GbPage = {
  id: string;
  kind?: string;
  type?: string;
  title?: string;
  slug?: string;
  path?: string;
  description?: string;
  pages?: GbPage[];
};

async function gb<T>(path: string): Promise<T> {
  const res = await fetch(`https://api.gitbook.com/v1${path}`, {
    headers: {Authorization: `Bearer ${TOKEN}`}
  });
  if (!res.ok) {
    throw new Error(`GitBook API ${res.status} ${res.statusText} for ${path}`);
  }
  return (await res.json()) as T;
}

type FlatPage = {id: string; slug: string; title: string; description: string; group?: string};

function flatten(pages: GbPage[], group: string | undefined, out: FlatPage[]): void {
  for (const p of pages) {
    if (p.kind === 'group') {
      flatten(p.pages ?? [], p.title, out);
      continue;
    }
    // Only real document pages that live inside a group (path has a "/").
    // This skips the root landing/index page (a pure table of contents).
    if (p.type === 'document' && p.path && p.path.includes('/')) {
      out.push({
        id: p.id,
        slug: p.slug ?? p.path.split('/').pop() ?? p.id,
        title: p.title ?? '',
        description: p.description ?? '',
        group
      });
    }
    if (p.pages?.length) flatten(p.pages, group, out);
  }
}

// ---------------------------------------------------------------------------
// Markdown preprocessing (before Payload's convertMarkdownToLexical)
// ---------------------------------------------------------------------------
function stripFrontmatter(md: string): string {
  if (!md.startsWith('---')) return md;
  const end = md.indexOf('\n---', 3);
  if (end === -1) return md;
  const after = md.indexOf('\n', end + 1);
  return after === -1 ? '' : md.slice(after + 1);
}

function stripFirstH1(md: string): string {
  const lines = md.split('\n');
  const i = lines.findIndex((l) => /^#\s+\S/.test(l));
  if (i !== -1) lines.splice(i, 1);
  return lines.join('\n');
}

function splitCells(line: string): string[] {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) s = s.slice(0, -1);
  return s.split('|').map((c) => c.trim());
}
function isSeparatorRow(cells: string[]): boolean {
  return cells.length > 0 && cells.every((c) => /^:?-{2,}:?$/.test(c.replace(/\s/g, '')));
}

/**
 * Convert GitHub-flavoured Markdown tables into bullet lists. Two-column
 * key/value tables → "**key**：value"; wider comparison tables → "**row**｜
 * header＝cell；…". No information is lost; the academy editor/renderer has no
 * table feature.
 */
function tablesToLists(md: string): string {
  const lines = md.split('\n');
  const out: string[] = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const isRow = /^\s*\|.*\|\s*$/.test(line);
    const next = lines[i + 1];
    const looksLikeTable =
      isRow && next != null && /^\s*\|.*\|\s*$/.test(next) && isSeparatorRow(splitCells(next));
    if (!looksLikeTable) {
      out.push(line);
      continue;
    }
    const headers = splitCells(line);
    i += 1; // consume separator
    const items: string[] = [];
    while (i + 1 < lines.length && /^\s*\|.*\|\s*$/.test(lines[i + 1])) {
      i += 1;
      const cells = splitCells(lines[i]);
      if (headers.length <= 2) {
        const k = cells[0] ?? '';
        const v = cells[1] ?? '';
        items.push(k ? `* **${k}**：${v}` : `* ${v}`);
      } else {
        const label = cells[0] ?? '';
        const parts: string[] = [];
        for (let c = 1; c < headers.length; c += 1) {
          const h = headers[c] ?? '';
          const val = cells[c] ?? '';
          parts.push(h ? `${h}＝${val}` : val);
        }
        items.push(`* **${label}**｜${parts.join('；')}`);
      }
    }
    if (out.length && out[out.length - 1].trim() !== '') out.push('');
    out.push(...items, '');
  }
  return out.join('\n');
}

/**
 * Flatten internal GitBook relative links to plain text. Keep external links
 * (http/https), mailto: and tel:. Also keep in-page anchors (#...). Everything
 * else (relative page references like `(what-is-hatc)` or `(../mt5/x)`) becomes
 * its link text.
 */
function flattenInternalLinks(md: string): string {
  return md.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (whole, text: string, url: string) => {
    const u = url.trim();
    if (/^(https?:|mailto:|tel:|#)/i.test(u)) return whole;
    return text;
  });
}

function toLexicalMarkdown(rawMd: string): string {
  let md = stripFrontmatter(rawMd);
  md = stripFirstH1(md);
  md = tablesToLists(md);
  md = flattenInternalLinks(md);
  return md.trim();
}

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------
if (!TOKEN || !SPACE) {
  console.error(
    'GITBOOK_API_TOKEN and GITBOOK_SPACE_ID must be set in .env. Nothing changed.'
  );
  process.exit(1);
}

const payload = await getPayload({config});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const p = payload as any;
const editorConfig = await editorConfigFactory.default({config: payload.config});

async function importCover(coverNum: number, alt: string): Promise<number | string | undefined> {
  const filePath = resolve(process.cwd(), RAW(coverNum));
  if (!existsSync(filePath)) {
    payload.logger.warn(`Cover not found: ${RAW(coverNum)}`);
    return undefined;
  }
  const media = await p.create({
    collection: 'media',
    locale: 'zh-Hant',
    filePath,
    data: {alt}
  });
  for (const loc of ['zh-Hans', 'en'] as const) {
    await p.update({collection: 'media', id: media.id, locale: loc, data: {alt}});
  }
  return media.id;
}

async function seed(): Promise<void> {
  const tree = await gb<{pages: GbPage[]}>(`/spaces/${SPACE}/content`);
  const flat: FlatPage[] = [];
  flatten(tree.pages ?? [], undefined, flat);
  payload.logger.info(`GitBook: ${flat.length} content pages (root index skipped).`);

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let order = ORDER_START;

  for (const page of flat) {
    const map = PAGE_MAP[page.slug];
    if (!map) {
      payload.logger.warn(`No PAGE_MAP entry for "${page.slug}" — skipped.`);
      skipped += 1;
      continue;
    }
    const currentOrder = order++;

    const pageDoc = await gb<{markdown?: string}>(
      `/spaces/${SPACE}/content/page/${page.id}?format=markdown`
    );
    const md = toLexicalMarkdown(pageDoc.markdown ?? '');
    const body = convertMarkdownToLexical({editorConfig, markdown: md});

    if (DRY) {
      payload.logger.info(
        `[dry] ${page.slug} → cat=${CATS['zh-Hant'][map.catIndex]} cover=raw_${map.cover} ` +
          `order=${currentOrder} title="${page.title}" bodyNodes=${
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (body as any)?.root?.children?.length ?? 0
          }`
      );
      continue;
    }

    const found = await p.find({
      collection: 'academy-articles',
      locale: 'zh-Hant',
      where: {slug: {equals: page.slug}},
      limit: 1,
      depth: 0
    });
    const existing = found.docs[0];

    let docId: number | string;
    if (existing) {
      await p.update({
        collection: 'academy-articles',
        id: existing.id,
        locale: 'zh-Hant',
        data: {
          order: currentOrder,
          enabled: true,
          publishedAt: PUBLISHED_AT,
          title: page.title,
          excerpt: page.description,
          category: CATS['zh-Hant'][map.catIndex],
          body
        }
      });
      docId = existing.id;
      updated += 1;
      payload.logger.info(`Updated academy-article "${page.slug}"`);
    } else {
      const coverId = await importCover(map.cover, page.title);
      const doc = await p.create({
        collection: 'academy-articles',
        locale: 'zh-Hant',
        data: {
          slug: page.slug,
          order: currentOrder,
          enabled: true,
          publishedAt: PUBLISHED_AT,
          title: page.title,
          excerpt: page.description,
          category: CATS['zh-Hant'][map.catIndex],
          body,
          ...(coverId ? {cover: coverId} : {})
        }
      });
      docId = doc.id;
      created += 1;
      payload.logger.info(`Seeded academy-article "${page.slug}" (${page.title})`);
    }

    // Set the CANONICAL localized category so the /academy filter matches per
    // locale (fallback would give the zh-Hant string, which won't match the
    // Simplified/English filter chips). `category` is a locale write, which
    // Payload validates against the required `title` for that locale — so we can
    // only set it once a title exists there. On a fresh import zh-Hans/en are
    // empty; run `scripts/translate-content.ts --only academy-articles` to fill
    // titles, then RE-RUN this script to lock categories to the canonical value.
    for (const loc of ['zh-Hans', 'en'] as const) {
      const localized = await p.find({
        collection: 'academy-articles',
        locale: loc,
        fallbackLocale: false,
        where: {slug: {equals: page.slug}},
        limit: 1,
        depth: 0
      });
      if (!localized.docs[0]?.title) continue; // pre-MT: skip (set on re-run)
      await p.update({
        collection: 'academy-articles',
        id: docId,
        locale: loc,
        data: {category: CATS[loc][map.catIndex]}
      });
    }
  }

  payload.logger.info(
    `GitBook import done. Created ${created}, updated ${updated}, skipped ${skipped}, ` +
      `total mapped ${flat.length - skipped}.${DRY ? ' (dry run — no writes)' : ''}`
  );
}

await seed();
process.exit(0);
