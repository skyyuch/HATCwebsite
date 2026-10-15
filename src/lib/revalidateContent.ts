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

/**
 * 🚩 `{expire: 0}`, NOT `'max'` (owner report 第六十一輪: "改了內容後不會馬上生效").
 *
 * `revalidateTag(tag, 'max')` is Next's *stale-while-revalidate* profile: the
 * tagged entry is only marked stale, so the first visit after a save still
 * serves the old value and refreshes in the background — every CMS edit needed
 * **two** reloads to show up. An editor checking his own change reads that as a
 * broken site, so this is read-your-own-writes territory and the entry has to
 * expire immediately.
 *
 * `updateTag()` is Next's dedicated read-your-own-writes API but it **only**
 * works inside a Server Action; Payload runs these hooks inside its REST route
 * handler, where the documented equivalent is `revalidateTag(tag, {expire: 0})`
 * (see node_modules/next/dist/docs → revalidateTag "Good to know", updateTag
 * "Differences from revalidateTag").
 *
 * Cost: the first request after an edit is a blocking cache miss instead of an
 * instant stale response. That is the right trade for a CMS — readers only pay
 * it on the one request that follows a save.
 */
function safeRevalidateTag(tag: string): void {
  try {
    revalidateTag(tag, {expire: 0});
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

/**
 * `src/app/sitemap.ts` enumerates every announcement and academy-article slug,
 * so publishing or unpublishing one of those changes the sitemap. It is a
 * prerendered route with no cache tag of its own, so only the path invalidates
 * it — without this, a new notice never reaches `/sitemap.xml` until the next
 * full build (production was found serving a 3-entry sitemap for 6 notices).
 */
function revalidateSitemap(): void {
  safeRevalidatePath('/sitemap.xml');
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

/**
 * `/announcements` list + every `/announcements/[slug]` detail page, **and the
 * `/embed/announcements` webview twins** — the embed pages live under their own
 * root layout (`src/app/(embed)`), so the public path does not reach them and a
 * published notice would stay missing from the app until the next deploy.
 */
function revalidateAnnouncementPages(): void {
  for (const locale of routing.locales) {
    safeRevalidatePath(`/${locale}/announcements`, 'layout');
    safeRevalidatePath(`/${locale}/embed/announcements`, 'layout');
  }
}

export function revalidateAnnouncements(): void {
  safeRevalidateTag(CACHE_TAGS.announcements);
  revalidateAnnouncementPages();
  revalidateSitemap();
}

/** A category rename changes the badges/filters rendered on both surfaces. */
export function revalidateAnnouncementCategories(): void {
  safeRevalidateTag(CACHE_TAGS.announcementCategories);
  safeRevalidateTag(CACHE_TAGS.announcements);
  revalidateAnnouncementPages();
}

/**
 * Four surfaces read `faqs`: the inline sections on `/trading`, `/accounts` and
 * `/platforms`, and the consolidated `/faq` page — **plus its `/embed/faq`
 * webview twin**, which lives under its own root layout, so the public path
 * does not reach it (第七十輪 lesson: an edited FAQ would stay stale in the app
 * until the next deploy).
 */
export function revalidateFaqs(): void {
  safeRevalidateTag(CACHE_TAGS.faqs);
  for (const locale of routing.locales) {
    safeRevalidatePath(`/${locale}/trading`);
    safeRevalidatePath(`/${locale}/accounts`);
    safeRevalidatePath(`/${locale}/platforms`);
    safeRevalidatePath(`/${locale}/faq`);
    safeRevalidatePath(`/${locale}/embed/faq`);
  }
}

export function revalidateAcademyArticles(): void {
  safeRevalidateTag(CACHE_TAGS.academyArticles);
  for (const locale of routing.locales) {
    safeRevalidatePath(`/${locale}`);
    // layout = list + /academy/[slug] detail pages
    safeRevalidatePath(`/${locale}/academy`, 'layout');
  }
  revalidateSitemap();
}

export function revalidateInstruments(): void {
  safeRevalidateTag(CACHE_TAGS.instruments);
  for (const locale of routing.locales) {
    safeRevalidatePath(`/${locale}/products/all`);
  }
}

export function revalidateAccountBenefits(): void {
  safeRevalidateTag(CACHE_TAGS.accountBenefits);
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