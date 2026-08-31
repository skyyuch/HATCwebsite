import {revalidatePath, revalidateTag} from 'next/cache';

import {routing} from '@/i18n/routing';
import {CACHE_TAGS} from '@/lib/cacheTags';

/**
 * Revalidation is only valid inside a Next request/static-generation context.
 * When these helpers run from a Payload CLI script, `onInit`, or any other
 * non-request context, Next throws an "invariant: static generation store
 * missing" error — which would otherwise abort the collection write. Guarding
 * the calls keeps CMS writes (seeding, migrations) resilient while still
 * revalidating normally during admin edits inside a request.
 */
function safeRevalidateTag(tag: string): void {
  try {
    revalidateTag(tag, 'max');
  } catch {
    // Outside a request context — nothing to revalidate.
  }
}

function safeRevalidatePath(path: string, type?: 'layout' | 'page'): void {
  try {
    revalidatePath(path, type);
  } catch {
    // Outside a request context — nothing to revalidate.
  }
}

export function revalidateSiteSettings(): void {
  safeRevalidateTag(CACHE_TAGS.siteSettings);
}

export function revalidateHomeActivities(): void {
  safeRevalidateTag(CACHE_TAGS.homeActivities);
  for (const locale of routing.locales) {
    safeRevalidatePath(`/${locale}`);
    safeRevalidatePath(`/${locale}/news`);
  }
}

export function revalidateFaqs(): void {
  safeRevalidateTag(CACHE_TAGS.faqs);
  for (const locale of routing.locales) {
    safeRevalidatePath(`/${locale}/trading`);
    safeRevalidatePath(`/${locale}/accounts`);
    safeRevalidatePath(`/${locale}/platforms`);
  }
}

export function revalidateAcademyArticles(): void {
  safeRevalidateTag(CACHE_TAGS.academyArticles);
  for (const locale of routing.locales) {
    safeRevalidatePath(`/${locale}`);
    // layout = list + /academy/[slug] detail pages
    safeRevalidatePath(`/${locale}/academy`, 'layout');
  }
}

export function revalidateInstruments(): void {
  safeRevalidateTag(CACHE_TAGS.instruments);
  for (const locale of routing.locales) {
    safeRevalidatePath(`/${locale}/products/all`);
  }
}

export function revalidateAccountTiers(): void {
  safeRevalidateTag(CACHE_TAGS.accountTiers);
  for (const locale of routing.locales) {
    safeRevalidatePath(`/${locale}/accounts`);
  }
}

export function revalidateAccountBenefits(): void {
  safeRevalidateTag(CACHE_TAGS.accountBenefits);
  for (const locale of routing.locales) {
    safeRevalidatePath(`/${locale}/accounts`);
  }
}

export function revalidateAccountSpreads(): void {
  safeRevalidateTag(CACHE_TAGS.accountSpreads);
  for (const locale of routing.locales) {
    safeRevalidatePath(`/${locale}/accounts`);
  }
}

export function revalidateAccountPlatforms(): void {
  safeRevalidateTag(CACHE_TAGS.accountPlatforms);
  for (const locale of routing.locales) {
    safeRevalidatePath(`/${locale}/accounts`);
  }
}

export function revalidateTradingPlatforms(): void {
  safeRevalidateTag(CACHE_TAGS.tradingPlatforms);
  for (const locale of routing.locales) {
    safeRevalidatePath(`/${locale}/platforms`);
  }
}

export function revalidateFundingMethods(): void {
  safeRevalidateTag(CACHE_TAGS.fundingMethods);
  for (const locale of routing.locales) {
    safeRevalidatePath(`/${locale}/funding`);
  }
}

export function revalidateTestimonials(): void {
  safeRevalidateTag(CACHE_TAGS.testimonials);
  for (const locale of routing.locales) {
    safeRevalidatePath(`/${locale}/funding`);
  }
}

export function revalidateFundingMarketing(): void {
  safeRevalidateTag(CACHE_TAGS.fundingMarketing);
  for (const locale of routing.locales) {
    safeRevalidatePath(`/${locale}/funding`);
  }
}

export function revalidatePlatformsMarketing(): void {
  safeRevalidateTag(CACHE_TAGS.platformsMarketing);
  for (const locale of routing.locales) {
    safeRevalidatePath(`/${locale}/platforms`);
  }
}

export function revalidateHomeMarketing(): void {
  safeRevalidateTag(CACHE_TAGS.homeMarketing);
  for (const locale of routing.locales) {
    safeRevalidatePath(`/${locale}`);
  }
}

export function revalidateTradingMarketing(): void {
  safeRevalidateTag(CACHE_TAGS.tradingMarketing);
  for (const locale of routing.locales) {
    safeRevalidatePath(`/${locale}/trading`);
  }
}

export function revalidateAboutMarketing(): void {
  safeRevalidateTag(CACHE_TAGS.aboutMarketing);
  for (const locale of routing.locales) {
    safeRevalidatePath(`/${locale}/about`);
  }
}

export function revalidateProductsMarketing(): void {
  safeRevalidateTag(CACHE_TAGS.productsMarketing);
  for (const locale of routing.locales) {
    safeRevalidatePath(`/${locale}/products`);
  }
}

export function revalidateSampleTradingConditions(): void {
  safeRevalidateTag(CACHE_TAGS.sampleTradingConditions);
  for (const locale of routing.locales) {
    safeRevalidatePath(`/${locale}/trading`);
  }
}
