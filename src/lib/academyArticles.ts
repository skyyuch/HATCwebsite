import 'server-only';

import {unstable_cache} from 'next/cache';

import type {Locale} from '@/i18n/routing';
import {routing} from '@/i18n/routing';
import {CACHE_TAGS} from '@/lib/cacheTags';
import {getPayloadClient, hasDb} from '@/lib/payload';
import type {AcademyArticle as PayloadAcademyArticle} from '@/payload-types';

/**
 * Gold Academy articles. Source of truth = Payload `academy-articles` when DB
 * is configured; otherwise i18n seed fallback (`home.goldAcademy.articles`
 * a1–a3). Messages seeds must NOT be deleted (CMS-first governance).
 *
 * Empty CMS list also falls back to i18n seeds (unlike news/activities, which
 * intentionally have no fabricated seeds).
 */
export type AcademyArticleBody = NonNullable<PayloadAcademyArticle['body']>;

export type AcademyArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  category?: string;
  coverUrl?: string;
  coverAlt?: string;
  publishedAt?: string;
  order: number;
  /** Estimated reading time in minutes, derived from body/excerpt length (0 = unknown). */
  readMinutes: number;
};

export type AcademyArticleDetail = AcademyArticle & {
  /** Lexical JSON when present; null = show excerpt-only fallback UI. */
  body: AcademyArticleBody | null;
};

const FALLBACK_KEYS = ['a1', 'a2', 'a3'] as const;

/** Figma placeholder thumbs used only for i18n seed cards (not CMS covers). */
const FALLBACK_COVERS: Record<(typeof FALLBACK_KEYS)[number], string> = {
  a1: '/figma/raw/raw_16.png',
  a2: '/figma/raw/raw_13.png',
  a3: '/figma/raw/raw_12.png'
};

/** Minimal Lexical doc from plain text (seed / excerpt-only fallback — not invented copy). */
function lexicalFromPlainText(text: string): AcademyArticleBody {
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

/** Walk a Lexical richtext tree and concatenate all text-node strings. */
function lexicalToPlainText(body: unknown): string {
  const out: string[] = [];
  const visit = (node: unknown): void => {
    if (!node || typeof node !== 'object') return;
    const n = node as Record<string, unknown>;
    if (typeof n.text === 'string') out.push(n.text);
    const children = n.children;
    if (Array.isArray(children)) children.forEach(visit);
    const root = n.root;
    if (root) visit(root);
  };
  visit(body);
  return out.join(' ');
}

/**
 * Reading-time estimate from content length. ~350 chars/min works reasonably for
 * mixed CJK/Latin. This is a derived UI estimate (not a fabricated fact).
 */
function estimateReadMinutes(text: string): number {
  const len = text.trim().length;
  if (!len) return 0;
  return Math.max(1, Math.round(len / 350));
}

function mapCover(cover: PayloadAcademyArticle['cover']): {
  coverUrl?: string;
  coverAlt?: string;
} {
  if (cover && typeof cover === 'object' && 'url' in cover) {
    const coverUrl = (cover.url as string) || undefined;
    const coverAlt =
      'alt' in cover && typeof cover.alt === 'string' && cover.alt
        ? cover.alt
        : undefined;
    return {coverUrl, coverAlt};
  }
  return {};
}

function mapListItem(
  doc: PayloadAcademyArticle,
  orderFallback: number
): AcademyArticle | null {
  const title = (doc.title as string) || '';
  const slug = (doc.slug as string) || '';
  if (!title || !slug) return null;
  const {coverUrl, coverAlt} = mapCover(doc.cover);
  const excerpt = (doc.excerpt as string) || undefined;
  const bodyText = lexicalToPlainText(doc.body);
  const readMinutes = estimateReadMinutes(bodyText || excerpt || '');
  return {
    id: String(doc.id),
    slug,
    title,
    excerpt,
    category: (doc.category as string) || undefined,
    coverUrl,
    coverAlt,
    publishedAt: (doc.publishedAt as string) || undefined,
    order: (doc.order as number) ?? orderFallback,
    readMinutes
  };
}

async function getAcademyArticlesFallback(
  locale: Locale
): Promise<AcademyArticle[]> {
  const messages = (await import(`../messages/${locale}.json`)).default as {
    home?: {
      goldAcademy?: {
        articles?: Record<
          (typeof FALLBACK_KEYS)[number],
          {tag: string; title: string; excerpt: string; imageAlt: string}
        >;
      };
    };
  };

  const articles = messages.home?.goldAcademy?.articles;
  if (!articles) return [];

  return FALLBACK_KEYS.map((key, index) => {
    const item = articles[key];
    return {
      id: key,
      slug: key,
      title: item?.title ?? '',
      excerpt: item?.excerpt || undefined,
      category: item?.tag || undefined,
      coverUrl: FALLBACK_COVERS[key],
      coverAlt: item?.imageAlt || undefined,
      order: index,
      readMinutes: estimateReadMinutes(item?.excerpt || '')
    };
  }).filter((item) => item.title);
}

async function getAcademyArticleFallbackBySlug(
  locale: Locale,
  slug: string
): Promise<AcademyArticleDetail | null> {
  const list = await getAcademyArticlesFallback(locale);
  const item = list.find((a) => a.slug === slug);
  if (!item) return null;
  return {
    ...item,
    // Seed cards have no full Lexical body — reuse excerpt only (no invented article).
    body: item.excerpt ? lexicalFromPlainText(item.excerpt) : null
  };
}

async function fetchAcademyArticlesFromDb(
  locale: Locale
): Promise<AcademyArticle[]> {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: 'academy-articles',
      locale,
      where: {enabled: {equals: true}},
      sort: 'order',
      depth: 1,
      limit: 50
    });

    if (res.docs.length === 0) {
      return getAcademyArticlesFallback(locale);
    }

    return res.docs
      .map((doc, index) => mapListItem(doc, index))
      .filter((item): item is AcademyArticle => item !== null);
  } catch {
    return getAcademyArticlesFallback(locale);
  }
}

async function fetchAcademyArticleBySlugFromDb(
  locale: Locale,
  slug: string
): Promise<AcademyArticleDetail | null> {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: 'academy-articles',
      locale,
      where: {
        and: [{enabled: {equals: true}}, {slug: {equals: slug}}]
      },
      depth: 1,
      limit: 1
    });

    const doc = res.docs[0];
    if (!doc) {
      // Mirror list reader: empty CMS → i18n seeds; otherwise unknown slug → 404.
      const any = await payload.find({
        collection: 'academy-articles',
        where: {enabled: {equals: true}},
        limit: 1,
        depth: 0
      });
      if (any.docs.length === 0) {
        return getAcademyArticleFallbackBySlug(locale, slug);
      }
      return null;
    }

    const listItem = mapListItem(doc, 0);
    if (!listItem) return null;

    const rawBody = doc.body ?? null;
    const body: AcademyArticleBody | null =
      rawBody &&
      typeof rawBody === 'object' &&
      'root' in rawBody &&
      rawBody.root
        ? (rawBody as AcademyArticleBody)
        : listItem.excerpt
          ? lexicalFromPlainText(listItem.excerpt)
          : null;

    return {...listItem, body};
  } catch {
    return getAcademyArticleFallbackBySlug(locale, slug);
  }
}

const getAcademyArticlesCached = unstable_cache(
  async (locale: Locale) => fetchAcademyArticlesFromDb(locale),
  ['academy-articles'],
  {tags: [CACHE_TAGS.academyArticles]}
);

const getAcademyArticleBySlugCached = unstable_cache(
  async (locale: Locale, slug: string) =>
    fetchAcademyArticleBySlugFromDb(locale, slug),
  ['academy-article-by-slug'],
  {tags: [CACHE_TAGS.academyArticles]}
);

/**
 * Academy articles for homepage / `/academy`. DB when configured; otherwise
 * i18n seed fallback. Empty CMS list also falls back to i18n.
 */
export async function getAcademyArticles(
  locale: Locale
): Promise<AcademyArticle[]> {
  if (!hasDb()) {
    return getAcademyArticlesFallback(locale);
  }

  return getAcademyArticlesCached(locale);
}

/**
 * Single article for `/academy/[slug]`. DB→fallback; unknown slug → null.
 */
export async function getAcademyArticleBySlug(
  locale: Locale,
  slug: string
): Promise<AcademyArticleDetail | null> {
  if (!slug) return null;

  if (!hasDb()) {
    return getAcademyArticleFallbackBySlug(locale, slug);
  }

  return getAcademyArticleBySlugCached(locale, slug);
}

/**
 * Unique slugs for SSG / sitemap. Slug is not localized — use default locale list.
 */
export async function getAcademyArticleSlugs(): Promise<string[]> {
  const articles = await getAcademyArticles(routing.defaultLocale);
  return articles.map((a) => a.slug).filter(Boolean);
}
