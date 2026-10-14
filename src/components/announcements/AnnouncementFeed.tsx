'use client';

import {Suspense, useCallback, useEffect, useMemo, useState} from 'react';
import {ArrowRight, ChevronLeft, ChevronRight, Pin} from 'lucide-react';
import {useSearchParams} from 'next/navigation';
import {useLocale, useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import type {
  AnnouncementCategoryRef,
  AnnouncementSummary
} from '@/lib/announcements';
import {formatDateShort} from '@/lib/dates';
import {pageItems} from '@/lib/pagination';

const PAGE_SIZE = 10;

/** `/announcements?category=<slug>` — category slugs come from the CMS. */
const CATEGORY_PARAM = 'category';

/**
 * Applies `?category=` to the feed.
 *
 * Renders nothing and sits in its own `<Suspense>` boundary on purpose:
 * `useSearchParams` makes the client tree up to the nearest boundary
 * client-rendered, so isolating it keeps the notice list in the prerendered
 * HTML and `/announcements` stays SSG (same pattern as `/academy`, 第五十四輪).
 */
function CategoryQuerySync({
  known,
  onChange
}: {
  known: readonly string[];
  onChange: (slug: string | null) => void;
}) {
  const searchParams = useSearchParams();
  const raw = searchParams.get(CATEGORY_PARAM);

  useEffect(() => {
    // An unknown / deleted slug degrades to "no filter" rather than an empty page.
    onChange(raw && known.includes(raw) ? raw : null);
  }, [raw, known, onChange]);

  return null;
}

/**
 * `/announcements` notice list: category filter + pagination, applied on the
 * client over the full published set so the page stays SSG.
 *
 * Categories are owner-managed CMS documents (`announcement-categories`), so
 * the filter options can never drift from the notices the way a free-text tag
 * would. Empty CMS → neutral empty copy; no notice is ever invented in code.
 *
 * `embed` is the app-webview variant: notice links stay under `/embed` so a tap
 * cannot navigate the webview out to the full site, and this heading becomes
 * the page's h1 because the embedded list renders no hero.
 */
export default function AnnouncementFeed({
  items,
  categories,
  embed = false
}: {
  items: AnnouncementSummary[];
  categories: AnnouncementCategoryRef[];
  embed?: boolean;
}) {
  const t = useTranslations('announcements');
  // Generic list chrome ("全部", pagination labels) is identical to the Academy
  // list — reuse those keys instead of duplicating the same strings (i18n rule).
  const shared = useTranslations('academy');
  const locale = useLocale();

  const [active, setActive] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const knownSlugs = useMemo(() => categories.map((c) => c.slug), [categories]);

  const filtered = useMemo(
    () =>
      active ? items.filter((item) => item.category?.slug === active) : items,
    [items, active]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const applyFromQuery = useCallback((slug: string | null) => {
    setActive(slug);
    setPage(1);
  }, []);

  /**
   * Mirror the selection into the query string so a filtered view can be
   * shared. `replaceState` is enough (Next syncs it into `useSearchParams`
   * without navigating) and keeps filter tweaks out of the history stack.
   */
  const select = (slug: string | null) => {
    setActive(slug);
    setPage(1);
    const params = new URLSearchParams(window.location.search);
    if (slug) params.set(CATEGORY_PARAM, slug);
    else params.delete(CATEGORY_PARAM);
    const query = params.toString();
    window.history.replaceState(
      null,
      '',
      query ? `?${query}` : window.location.pathname
    );
  };

  const Heading = embed ? 'h1' : 'h2';
  const basePath = embed ? '/embed' : '';

  const chipClass = (selected: boolean) =>
    [
      'rounded-full px-4 py-2 text-[13px] font-semibold transition-colors',
      selected
        ? 'bg-[#1a3366] text-white'
        : 'border border-[var(--fig-border-light)] bg-white text-[#344054] hover:border-[#1a3366] hover:text-[#1a3366]'
    ].join(' ');

  return (
    <section className="bg-[var(--fig-light)]">
      <Suspense fallback={null}>
        <CategoryQuerySync known={knownSlugs} onChange={applyFromQuery} />
      </Suspense>

      <div className="mx-auto max-w-[1440px] px-6 py-14 sm:px-10 lg:px-[120px] lg:py-16">
        {/* Reading column, left-aligned with the hero copy above it. */}
        <div className="flex max-w-[920px] flex-col gap-8">
          <div className="flex items-center gap-3">
            <Heading className="font-sans text-[22px] font-black text-[#0c111d]">
              {t('results.title')}
            </Heading>
            <span className="rounded-full bg-[rgba(212,175,55,0.12)] px-2.5 py-1 text-[13px] font-bold text-[#9a7b1a]">
              {t('results.count', {count: filtered.length})}
            </span>
          </div>

          {items.length > 0 && categories.length > 0 ? (
            <div
              role="group"
              aria-label={shared('filter.title')}
              className="flex flex-wrap gap-2"
            >
              <button
                type="button"
                aria-pressed={active === null}
                onClick={() => select(null)}
                className={chipClass(active === null)}
              >
                {shared('filter.all')}
              </button>
              {categories.map((category) => (
                <button
                  key={category.slug}
                  type="button"
                  aria-pressed={active === category.slug}
                  onClick={() => select(category.slug)}
                  className={chipClass(active === category.slug)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          ) : null}

          {paged.length === 0 ? (
            <p className="py-10 text-sm leading-[1.65] text-[var(--fig-text-muted)]">
              {t('empty')}
            </p>
          ) : (
            <ul className="flex list-none flex-col gap-4 pl-0">
              {paged.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`${basePath}/announcements/${item.slug}`}
                    className="group flex flex-col gap-4 rounded-xl border border-[var(--fig-border-light)] bg-white p-6 shadow-[0px_4px_6px_rgba(0,0,0,0.02)] transition-colors hover:border-[rgba(212,175,55,0.45)] sm:flex-row sm:items-start sm:gap-6"
                  >
                    <div className="flex shrink-0 flex-wrap items-center gap-2 sm:w-[112px] sm:flex-col sm:items-start">
                      {item.publishedAt ? (
                        <time
                          dateTime={item.publishedAt}
                          className="text-[13px] font-semibold text-[#667085]"
                        >
                          {formatDateShort(item.publishedAt, locale)}
                        </time>
                      ) : null}
                      {item.category ? (
                        <span className="rounded-[4px] bg-[rgba(212,175,55,0.12)] px-2 py-1 text-[11px] font-bold text-[#9a7b1a]">
                          {item.category.name}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {item.pinned ? (
                          <span className="inline-flex items-center gap-1 rounded-[4px] bg-[rgba(26,51,102,0.1)] px-2 py-1 text-[11px] font-bold text-[#1a3366]">
                            <Pin aria-hidden className="h-3 w-3" />
                            {t('pinned')}
                          </span>
                        ) : null}
                        <h3 className="font-sans text-base font-bold leading-[1.45] text-[#0c111d] transition-colors group-hover:text-[#1a3366]">
                          {item.title}
                        </h3>
                      </div>
                      {item.excerpt ? (
                        <p className="text-[13px] leading-[1.6] text-[var(--fig-text-muted)]">
                          {item.excerpt}
                        </p>
                      ) : null}
                      <span className="mt-1 inline-flex items-center gap-1 text-[12px] font-bold text-[#09395f] transition-colors group-hover:text-gold">
                        {t('readMore')}
                        <ArrowRight aria-hidden className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {totalPages > 1 ? (
            <nav
              aria-label={shared('pagination.aria')}
              className="flex items-center justify-center gap-2"
            >
              <button
                type="button"
                aria-label={shared('pagination.prev')}
                disabled={currentPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-[6px] border border-[var(--fig-border-light)] bg-white text-[#344054] transition-colors hover:border-[#1a3366] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft aria-hidden className="h-4 w-4" />
              </button>

              {pageItems(totalPages, currentPage).map((item, idx) =>
                item === 'ellipsis' ? (
                  <span
                    key={`e${idx}`}
                    className="flex h-10 w-10 items-center justify-center text-sm text-[#344054]"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    aria-current={item === currentPage ? 'page' : undefined}
                    onClick={() => setPage(item)}
                    className={[
                      'flex h-10 w-10 items-center justify-center rounded-[6px] text-sm transition-colors',
                      item === currentPage
                        ? 'bg-[#1a3366] font-bold text-white'
                        : 'border border-[var(--fig-border-light)] bg-white font-medium text-[#344054] hover:border-[#1a3366]'
                    ].join(' ')}
                  >
                    {item}
                  </button>
                )
              )}

              <button
                type="button"
                aria-label={shared('pagination.next')}
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="flex h-10 w-10 items-center justify-center rounded-[6px] border border-[var(--fig-border-light)] bg-white text-[#344054] transition-colors hover:border-[#1a3366] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight aria-hidden className="h-4 w-4" />
              </button>
            </nav>
          ) : null}
        </div>
      </div>
    </section>
  );
}
