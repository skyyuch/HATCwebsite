import 'server-only';

import {unstable_cache} from 'next/cache';

import type {Locale} from '@/i18n/routing';
import {CACHE_TAGS} from '@/lib/cacheTags';
import {getPayloadClient, hasDb} from '@/lib/payload';

/**
 * ⚠️ Three places describe this list and must change together: the `category`
 * select in `src/collections/Faqs.ts` (what the owner can pick), this array
 * (the order `/faq` renders groups in) and `faq.categories.*` in all three
 * `src/messages/*` files (the headings). A category missing from either of the
 * last two would make its questions invisible on `/faq`.
 */
export const FAQ_CATEGORIES = ['trading', 'products', 'accounts', 'platforms', 'general'] as const;
export type FaqCategory = (typeof FAQ_CATEGORIES)[number];

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  order: number;
};

const TRADING_FALLBACK_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'] as const;

type QaPair = {q?: string; a?: string};

async function getFaqsFallback(
  locale: Locale,
  category: FaqCategory
): Promise<FaqItem[]> {
  const messages = (await import(`../messages/${locale}.json`)).default as {
    trading?: {
      faq?: {
        items?: Record<
          (typeof TRADING_FALLBACK_KEYS)[number],
          {q: string; a: string}
        >;
      };
    };
    accounts?: {faq?: {items?: QaPair[]}};
    platforms?: {faq?: {items?: QaPair[]}};
  };

  if (category === 'trading') {
    const items = messages.trading?.faq?.items;
    if (!items) return [];

    return TRADING_FALLBACK_KEYS.map((key, index) => ({
      id: key,
      question: items[key]?.q ?? '',
      answer: items[key]?.a ?? '',
      order: index
    })).filter((item) => item.question && item.answer);
  }

  // `/accounts` and `/platforms` seeds ship as an array of {q, a} pairs.
  if (category === 'accounts' || category === 'platforms') {
    const items =
      (category === 'accounts'
        ? messages.accounts?.faq?.items
        : messages.platforms?.faq?.items) ?? [];
    return items
      .map((item, index) => ({
        id: `seed-${index}`,
        question: item.q ?? '',
        answer: item.a ?? '',
        order: index
      }))
      .filter((item) => item.question && item.answer);
  }

  return [];
}

async function fetchFaqsFromDb(
  locale: Locale,
  category: FaqCategory
): Promise<FaqItem[]> {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: 'faqs',
      locale,
      where: {
        and: [
          {enabled: {equals: true}},
          {category: {equals: category}}
        ]
      },
      sort: 'order',
      limit: 50
    });

    if (res.docs.length === 0) {
      return getFaqsFallback(locale, category);
    }

    return res.docs.map((doc) => ({
      id: String(doc.id),
      question: (doc.question as string) || '',
      answer: (doc.answer as string) || '',
      order: (doc.order as number) ?? 0
    }));
  } catch {
    return getFaqsFallback(locale, category);
  }
}

const getFaqsCached = unstable_cache(
  async (locale: Locale, category: FaqCategory) =>
    fetchFaqsFromDb(locale, category),
  ['faqs'],
  {tags: [CACHE_TAGS.faqs]}
);

/**
 * FAQs for a page category. DB when configured; otherwise i18n seed fallback.
 * Empty CMS list also falls back to i18n for `trading`.
 */
export async function getFaqs(
  locale: Locale,
  category: FaqCategory
): Promise<FaqItem[]> {
  if (!hasDb()) {
    return getFaqsFallback(locale, category);
  }

  return getFaqsCached(locale, category);
}

export type FaqGroup = {category: FaqCategory; items: FaqItem[]};

/**
 * Every category that currently has questions, in `FAQ_CATEGORIES` order — the
 * consolidated `/faq` page (第七十二輪).
 *
 * It walks the whole list rather than only the three categories that have an
 * inline section today (`/trading`, `/accounts`, `/platforms`): `products` and
 * `general` are selectable in the CMS but have no page of their own, so without
 * this a question filed under either would be invisible everywhere. Empty
 * groups are dropped, so adding content is the only thing that makes a heading
 * appear.
 */
export async function getAllFaqs(locale: Locale): Promise<FaqGroup[]> {
  const groups = await Promise.all(
    FAQ_CATEGORIES.map(async (category) => ({
      category,
      items: await getFaqs(locale, category)
    }))
  );

  return groups.filter((group) => group.items.length > 0);
}
