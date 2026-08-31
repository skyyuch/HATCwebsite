import 'server-only';

import {unstable_cache} from 'next/cache';

import type {Locale} from '@/i18n/routing';
import {CACHE_TAGS} from '@/lib/cacheTags';
import {getPayloadClient, hasDb} from '@/lib/payload';

export type Testimonial = {
  id: string;
  quote: string;
  authorName: string;
  authorTitle: string;
  order: number;
};

/**
 * Client testimonials. Governance red line: testimonials are real company facts
 * and must NOT be fabricated, so there is deliberately **no i18n seed** — the
 * fallback is an empty list and the front-end hides the section until the owner
 * publishes genuine, review-approved entries in the CMS.
 */
async function fetchTestimonialsFromDb(locale: Locale): Promise<Testimonial[]> {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: 'testimonials',
      locale,
      where: {enabled: {equals: true}},
      sort: 'order',
      limit: 24
    });

    return res.docs.map((doc) => ({
      id: String(doc.id),
      quote: (doc.quote as string) || '',
      authorName: (doc.authorName as string) || '',
      authorTitle: (doc.authorTitle as string) || '',
      order: (doc.order as number) ?? 0
    }));
  } catch {
    return [];
  }
}

const getTestimonialsCached = unstable_cache(
  async (locale: Locale) => fetchTestimonialsFromDb(locale),
  ['testimonials'],
  {tags: [CACHE_TAGS.testimonials]}
);

/**
 * Testimonials for the front-end. Empty when no DB or no published entries — no
 * fabricated seed. Callers hide the section when this is empty.
 */
export async function getTestimonials(locale: Locale): Promise<Testimonial[]> {
  if (!hasDb()) {
    return [];
  }
  return getTestimonialsCached(locale);
}
