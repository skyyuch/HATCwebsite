/**
 * Canonical, locale-independent slugs for the Gold Academy categories.
 *
 * The order MUST match the `academy.categories` array in `src/messages/*.json`:
 * the localized label at index N is addressed by the slug at index N. Slugs are
 * what appear in URLs (`/academy?category=technical-analysis`) and in the footer
 * link map, so a category can be reworded in any locale without breaking links.
 *
 * `npm run i18n:check` keeps the three locales' arrays aligned with each other;
 * it cannot see this file, so **add / remove / reorder categories here in the
 * same change**. Labels with no slug simply aren't deep-linkable (the on-page
 * filter still works), and unknown slugs in a URL are ignored.
 *
 * Shared by a server component (Footer) and a client component
 * (AcademyExplorer) — keep this module free of `server-only`.
 */
export const ACADEMY_CATEGORY_SLUGS = [
  'gold-basics', // 黃金基礎
  'trading-strategy', // 交易策略
  'technical-analysis', // 技術分析
  'market-moves', // 市場動態
  'risk-management', // 風險管理
  'portfolio' // 投資組合
] as const;

export type AcademyCategorySlug = (typeof ACADEMY_CATEGORY_SLUGS)[number];

/** Query-string key used by `/academy` for the category filter. */
export const ACADEMY_CATEGORY_PARAM = 'category';

/** `/academy?category=<slug>` — pass to next-intl `Link`, which adds the locale. */
export function academyCategoryHref(slug: AcademyCategorySlug): string {
  return `/academy?${ACADEMY_CATEGORY_PARAM}=${slug}`;
}

/**
 * Read slugs out of a raw query value. Accepts both repeated params
 * (`?category=a&category=b`) and a comma-separated list (`?category=a,b`);
 * unknown slugs are dropped so a stale link degrades to "no filter".
 */
export function parseCategorySlugs(values: string[]): AcademyCategorySlug[] {
  const seen = new Set<AcademyCategorySlug>();
  for (const value of values) {
    for (const part of value.split(',')) {
      const slug = part.trim() as AcademyCategorySlug;
      if (ACADEMY_CATEGORY_SLUGS.includes(slug)) seen.add(slug);
    }
  }
  return [...seen];
}

/** Slugs → the localized labels used by the article `category` field. */
export function labelsFromSlugs(
  slugs: readonly AcademyCategorySlug[],
  labels: readonly string[]
): string[] {
  return slugs
    .map((slug) => ACADEMY_CATEGORY_SLUGS.indexOf(slug))
    .filter((index) => index >= 0 && index < labels.length)
    .map((index) => labels[index]);
}

/** Localized labels → slugs (inverse of `labelsFromSlugs`). */
export function slugsFromLabels(
  selected: readonly string[],
  labels: readonly string[]
): AcademyCategorySlug[] {
  return selected
    .map((label) => labels.indexOf(label))
    .filter((index) => index >= 0 && index < ACADEMY_CATEGORY_SLUGS.length)
    .map((index) => ACADEMY_CATEGORY_SLUGS[index]);
}
