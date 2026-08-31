import 'server-only';

import {unstable_cache} from 'next/cache';

import type {Locale} from '@/i18n/routing';
import {CACHE_TAGS} from '@/lib/cacheTags';
import {getPayloadClient, hasDb} from '@/lib/payload';

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
