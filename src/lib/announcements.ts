import 'server-only';

import {unstable_cache} from 'next/cache';

import type {Locale} from '@/i18n/routing';
import {routing} from '@/i18n/routing';
import {CACHE_TAGS} from '@/lib/cacheTags';
import {getPayloadClient, hasDb} from '@/lib/payload';
import type {
  Announcement as PayloadAnnouncement,
  AnnouncementCategory as PayloadAnnouncementCategory
} from '@/payload-types';

/**
 * Official announcements + their owner-managed categories. Source of truth =
 * Payload (`announcements` / `announcement-categories`).
 *
 * DB→fallback pattern, **empty variant**: no database, an empty collection or a
 * read error all return `[]`, and the front-end renders neutral empty copy from
 * i18n chrome. There are deliberately NO i18n seed announcements — inventing
 * notices would be inventing company statements (same governance as
 * news/activities and testimonials; contrast `academy.*`, which has approved
 * seeds).
 */
export type AnnouncementCategoryRef = {
  id: string;
  slug: string;
  name: string;
};

export type AnnouncementSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  category?: AnnouncementCategoryRef;
  publishedAt?: string;
  pinned: boolean;
};

export type AnnouncementBody = NonNullable<PayloadAnnouncement['body']>;

export type AnnouncementDetail = AnnouncementSummary & {
  /** Lexical JSON when present; null = show the "no body yet" fallback copy. */
  body: AnnouncementBody | null;
};

function mapCategory(
  category: PayloadAnnouncement['category']
): AnnouncementCategoryRef | undefined {
  // depth:1 resolves the relationship to a document; a bare id (unresolved or
  // deleted category) carries no label, so it degrades to "uncategorised".
  if (!category || typeof category !== 'object') return undefined;
  const doc = category as PayloadAnnouncementCategory;
  if (!doc.name || !doc.slug) return undefined;
  return {id: String(doc.id), slug: doc.slug, name: doc.name};
}

function mapSummary(doc: PayloadAnnouncement): AnnouncementSummary | null {
  const title = doc.title || '';
  const slug = doc.slug || '';
  if (!title || !slug) return null;
  return {
    id: String(doc.id),
    slug,
    title,
    excerpt: doc.excerpt || undefined,
    category: mapCategory(doc.category),
    publishedAt: doc.publishedAt || undefined,
    pinned: Boolean(doc.pinned)
  };
}

/**
 * Pinned first, then newest published date. Undated notices sort last so a
 * half-finished entry never jumps to the top of the page.
 */
function byPinnedThenDate(
  a: AnnouncementSummary,
  b: AnnouncementSummary
): number {
  if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
  const da = a.publishedAt ? Date.parse(a.publishedAt) : NaN;
  const db = b.publishedAt ? Date.parse(b.publishedAt) : NaN;
  if (!Number.isNaN(da) && !Number.isNaN(db)) return db - da;
  if (!Number.isNaN(da)) return -1;
  if (!Number.isNaN(db)) return 1;
  return 0;
}

async function fetchAnnouncementsFromDb(
  locale: Locale
): Promise<AnnouncementSummary[]> {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: 'announcements',
      locale,
      where: {enabled: {equals: true}},
      sort: '-publishedAt',
      depth: 1,
      limit: 200
    });

    return res.docs
      .map(mapSummary)
      .filter((item): item is AnnouncementSummary => item !== null)
      .sort(byPinnedThenDate);
  } catch {
    return [];
  }
}

async function fetchAnnouncementBySlugFromDb(
  locale: Locale,
  slug: string
): Promise<AnnouncementDetail | null> {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: 'announcements',
      locale,
      where: {and: [{enabled: {equals: true}}, {slug: {equals: slug}}]},
      depth: 1,
      limit: 1
    });

    const doc = res.docs[0];
    if (!doc) return null;

    const summary = mapSummary(doc);
    if (!summary) return null;

    const rawBody = doc.body ?? null;
    const body: AnnouncementBody | null =
      rawBody && typeof rawBody === 'object' && 'root' in rawBody && rawBody.root
        ? (rawBody as AnnouncementBody)
        : null;

    return {...summary, body};
  } catch {
    return null;
  }
}

async function fetchAnnouncementCategoriesFromDb(
  locale: Locale
): Promise<AnnouncementCategoryRef[]> {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: 'announcement-categories',
      locale,
      where: {enabled: {equals: true}},
      sort: 'order',
      depth: 0,
      limit: 100
    });

    return res.docs
      .map((doc) =>
        doc.name && doc.slug
          ? {id: String(doc.id), slug: doc.slug, name: doc.name}
          : null
      )
      .filter((category): category is AnnouncementCategoryRef => category !== null);
  } catch {
    return [];
  }
}

const getAnnouncementsCached = unstable_cache(
  async (locale: Locale) => fetchAnnouncementsFromDb(locale),
  ['announcements'],
  {tags: [CACHE_TAGS.announcements, CACHE_TAGS.announcementCategories]}
);

const getAnnouncementBySlugCached = unstable_cache(
  async (locale: Locale, slug: string) =>
    fetchAnnouncementBySlugFromDb(locale, slug),
  ['announcement-by-slug'],
  {tags: [CACHE_TAGS.announcements, CACHE_TAGS.announcementCategories]}
);

const getAnnouncementCategoriesCached = unstable_cache(
  async (locale: Locale) => fetchAnnouncementCategoriesFromDb(locale),
  ['announcement-categories'],
  {tags: [CACHE_TAGS.announcementCategories]}
);

/** All published announcements for `/announcements`; empty when there is none. */
export async function getAnnouncements(
  locale: Locale
): Promise<AnnouncementSummary[]> {
  if (!hasDb()) return [];

  return getAnnouncementsCached(locale);
}

/** Single notice for `/announcements/[slug]`; unknown slug → null (404). */
export async function getAnnouncementBySlug(
  locale: Locale,
  slug: string
): Promise<AnnouncementDetail | null> {
  if (!slug || !hasDb()) return null;

  return getAnnouncementBySlugCached(locale, slug);
}

/** Filter options for the list page (owner-managed taxonomy). */
export async function getAnnouncementCategories(
  locale: Locale
): Promise<AnnouncementCategoryRef[]> {
  if (!hasDb()) return [];

  return getAnnouncementCategoriesCached(locale);
}

/**
 * Slugs each locale can actually render, for `sitemap.ts`.
 *
 * 🚩 The slug itself is not localized, but a notice with no title in the
 * requested locale is dropped by `mapSummary` — so its detail page 404s in that
 * locale. This used to be a single `getAnnouncements(defaultLocale)` call, which
 * made the sitemap depend entirely on the 繁體中文 title: the seven notices a
 * colleague had typed in Simplified Chinese only were absent from the sitemap in
 * **every** locale, including the Simplified site where they were perfectly
 * visible (第七十一輪). Listing per locale also keeps `hreflang` honest — a
 * notice is only advertised in the locales that can serve it.
 */
export async function getAnnouncementSlugsByLocale(): Promise<Record<Locale, string[]>> {
  const lists = await Promise.all(
    routing.locales.map(async (locale) => [
      locale,
      (await getAnnouncements(locale)).map((item) => item.slug).filter(Boolean)
    ] as const)
  );

  return Object.fromEntries(lists) as Record<Locale, string[]>;
}

/** Union of all locales' slugs, for `generateStaticParams`. */
export async function getAnnouncementSlugs(): Promise<string[]> {
  const byLocale = await getAnnouncementSlugsByLocale();
  return [...new Set(Object.values(byLocale).flat())];
}
