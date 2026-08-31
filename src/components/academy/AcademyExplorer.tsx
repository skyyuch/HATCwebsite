'use client';

import {useMemo, useState} from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ListFilter
} from 'lucide-react';
import {useLocale, useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import type {AcademyArticle} from '@/lib/academyArticles';

const PAGE_SIZE = 9;

type SortKey = 'newest' | 'oldest';

function isExternalSrc(src: string): boolean {
  return /^https?:\/\//i.test(src);
}

function formatDate(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
      .format(new Date(iso))
      .replace(/\//g, '-');
  } catch {
    return iso;
  }
}

function byNewest(a: AcademyArticle, b: AcademyArticle): number {
  const da = a.publishedAt ? Date.parse(a.publishedAt) : NaN;
  const db = b.publishedAt ? Date.parse(b.publishedAt) : NaN;
  if (!Number.isNaN(da) && !Number.isNaN(db)) return db - da;
  if (!Number.isNaN(da)) return -1;
  if (!Number.isNaN(db)) return 1;
  return a.order - b.order;
}

/** Compact page list with an ellipsis, e.g. 1 2 3 4 5 … 8. */
function pageItems(total: number, current: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({length: total}, (_, i) => i + 1);
  const items: (number | 'ellipsis')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) items.push('ellipsis');
  for (let i = start; i <= end; i += 1) items.push(i);
  if (end < total - 1) items.push('ellipsis');
  items.push(total);
  return items;
}

function ArticleCover({
  article,
  fallbackAlt
}: {
  article: AcademyArticle;
  fallbackAlt: string;
}) {
  if (article.coverUrl) {
    return (
      <Image
        src={article.coverUrl}
        alt={article.coverAlt || fallbackAlt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 288px"
        className="object-cover"
        unoptimized={isExternalSrc(article.coverUrl)}
      />
    );
  }
  return (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        background:
          'linear-gradient(135deg, #0c1a2e 0%, #09395f 45%, #1a3366 70%, #d4af37 160%)'
      }}
    />
  );
}

/**
 * Interactive Gold Academy list (Figma 98:38) — HATC light system.
 * Client-side category filter (multi-select + apply/reset), sort and
 * pagination over the full article set, so the page stays SSG. Orange →
 * navy/gold; article placeholder titles/forex categories from the Vantage
 * template are NOT used (data comes from the CMS/i18n seeds).
 */
export default function AcademyExplorer({
  articles,
  categories
}: {
  articles: AcademyArticle[];
  categories: string[];
}) {
  const t = useTranslations('academy');
  const home = useTranslations('home.goldAcademy');
  const locale = useLocale();

  const [draft, setDraft] = useState<string[]>([]);
  const [applied, setApplied] = useState<string[]>([]);
  const [sort, setSort] = useState<SortKey>('newest');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const base =
      applied.length === 0
        ? articles
        : articles.filter((a) => a.category && applied.includes(a.category));
    const sorted = [...base].sort(byNewest);
    if (sort === 'oldest') sorted.reverse();
    return sorted;
  }, [articles, applied, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const toggleCategory = (cat: string) => {
    setDraft((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const applyFilters = () => {
    setApplied(draft);
    setPage(1);
  };

  const resetFilters = () => {
    setDraft([]);
    setApplied([]);
    setPage(1);
  };

  const allActive = draft.length === 0;

  return (
    <section className="bg-[var(--fig-light)]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-6 py-14 sm:px-10 lg:flex-row lg:gap-12 lg:px-[120px] lg:py-16">
        {/* Filter sidebar */}
        <aside className="lg:w-[240px] lg:shrink-0">
          <div className="flex flex-col gap-6 rounded-xl border border-[var(--fig-border-light)] bg-white p-6 shadow-[0px_4px_6px_rgba(0,0,0,0.02)] lg:sticky lg:top-24">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#0c111d]">
                {t('filter.title')}
              </h2>
              <ListFilter aria-hidden className="h-[18px] w-[18px] text-[#667085]" />
            </div>
            <div className="h-px w-full bg-[var(--fig-border-light)]" />

            <fieldset className="flex flex-col gap-4">
              <legend className="sr-only">{t('filter.title')}</legend>

              <label className="flex cursor-pointer items-center gap-3">
                <span
                  className={[
                    'flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border-[1.5px] transition-colors',
                    allActive
                      ? 'border-[#1a3366] bg-[#1a3366]'
                      : 'border-[var(--fig-border-light)] bg-white'
                  ].join(' ')}
                >
                  {allActive ? (
                    <Check aria-hidden className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                  ) : null}
                </span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={allActive}
                  onChange={() => setDraft([])}
                />
                <span
                  className={[
                    'text-sm',
                    allActive ? 'font-bold text-[#0c111d]' : 'font-medium text-[#344054]'
                  ].join(' ')}
                >
                  {t('filter.all')}
                </span>
              </label>

              {categories.map((cat) => {
                const checked = draft.includes(cat);
                return (
                  <label key={cat} className="flex cursor-pointer items-center gap-3">
                    <span
                      className={[
                        'flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border-[1.5px] transition-colors',
                        checked
                          ? 'border-[#1a3366] bg-[#1a3366]'
                          : 'border-[var(--fig-border-light)] bg-white'
                      ].join(' ')}
                    >
                      {checked ? (
                        <Check aria-hidden className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                      ) : null}
                    </span>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={() => toggleCategory(cat)}
                    />
                    <span
                      className={[
                        'text-sm',
                        checked ? 'font-bold text-[#0c111d]' : 'font-medium text-[#344054]'
                      ].join(' ')}
                    >
                      {cat}
                    </span>
                  </label>
                );
              })}
            </fieldset>

            <div className="h-px w-full bg-[var(--fig-border-light)]" />

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={applyFilters}
                className="flex h-11 w-full items-center justify-center rounded-[6px] bg-[#1a3366] px-6 text-sm font-bold text-white transition-colors hover:bg-[#12264d]"
              >
                {t('filter.apply')}
              </button>
              <button
                type="button"
                onClick={resetFilters}
                className="text-center text-sm font-medium text-[#667085] underline underline-offset-4 transition-colors hover:text-[#09395f]"
              >
                {t('filter.reset')}
              </button>
            </div>
          </div>
        </aside>

        {/* Main articles */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="font-sans text-[22px] font-black text-[#0c111d]">
                <span aria-hidden>📚 </span>
                {t('results.title')}
              </h2>
              <span className="rounded-full bg-[rgba(212,175,55,0.12)] px-2.5 py-1 text-[13px] font-bold text-[#9a7b1a]">
                {t('results.count', {count: filtered.length})}
              </span>
            </div>

            <label className="relative flex items-center gap-1 text-sm text-[#667085]">
              <span>{t('sort.label')}：</span>
              <span className="relative inline-flex items-center">
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value as SortKey);
                    setPage(1);
                  }}
                  className="cursor-pointer appearance-none bg-transparent pr-5 font-medium text-[#0c111d] focus:outline-none focus-visible:underline"
                >
                  <option value="newest">{t('sort.newest')}</option>
                  <option value="oldest">{t('sort.oldest')}</option>
                </select>
                <ChevronDown
                  aria-hidden
                  className="pointer-events-none absolute right-0 h-4 w-4 text-[#667085]"
                />
              </span>
            </label>
          </div>

          {paged.length === 0 ? (
            <p className="mt-16 text-center text-sm leading-[1.65] text-[var(--fig-text-muted)]">
              {t('empty')}
            </p>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paged.map((article) => (
                <Link
                  key={article.id}
                  href={`/academy/${article.slug}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-[var(--fig-border-light)] bg-white shadow-[0px_6px_16px_rgba(0,0,0,0.02)] transition-colors hover:border-[rgba(212,175,55,0.45)]"
                >
                  <div className="relative aspect-[16/10] w-full">
                    <ArticleCover article={article} fallbackAlt={t('imageAlt')} />
                  </div>
                  <div className="flex flex-1 flex-col gap-4 p-6">
                    <div className="flex items-center justify-between gap-2">
                      {article.category ? (
                        <span className="rounded-[4px] bg-[rgba(212,175,55,0.12)] px-2 py-1 text-[11px] font-bold text-[#9a7b1a]">
                          {article.category}
                        </span>
                      ) : (
                        <span />
                      )}
                      {article.readMinutes > 0 ? (
                        <span className="text-[12px] text-[#94a3b8]">
                          {t('readMinutes', {minutes: article.readMinutes})}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-2">
                      <h3 className="font-sans text-base font-bold leading-[1.4] text-[#0c111d] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
                        {article.title}
                      </h3>
                      {article.excerpt ? (
                        <p className="text-[13px] leading-[1.5] text-[var(--fig-text-muted)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
                          {article.excerpt}
                        </p>
                      ) : null}
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-[var(--fig-border-light)] pt-4">
                      <span className="text-[12px] text-[#94a3b8]">
                        {article.publishedAt
                          ? formatDate(article.publishedAt, locale)
                          : ''}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[12px] font-bold text-[#09395f] transition-colors group-hover:text-gold">
                        {home('readMore')}
                        <ArrowRight aria-hidden className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {totalPages > 1 ? (
            <nav
              aria-label={t('pagination.aria')}
              className="mt-10 flex items-center justify-center gap-2"
            >
              <button
                type="button"
                aria-label={t('pagination.prev')}
                disabled={currentPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-[6px] border border-[var(--fig-border-light)] text-[#344054] transition-colors hover:border-[#1a3366] disabled:cursor-not-allowed disabled:opacity-40"
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
                        : 'border border-[var(--fig-border-light)] font-medium text-[#344054] hover:border-[#1a3366]'
                    ].join(' ')}
                  >
                    {item}
                  </button>
                )
              )}

              <button
                type="button"
                aria-label={t('pagination.next')}
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="flex h-10 w-10 items-center justify-center rounded-[6px] border border-[var(--fig-border-light)] text-[#344054] transition-colors hover:border-[#1a3366] disabled:cursor-not-allowed disabled:opacity-40"
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
