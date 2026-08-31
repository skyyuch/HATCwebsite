import Image from 'next/image';
import {getLocale, getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {
  getAcademyArticles,
  type AcademyArticle
} from '@/lib/academyArticles';
import type {Locale} from '@/i18n/routing';

function isExternalSrc(src: string): boolean {
  return /^https?:\/\//i.test(src);
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
        sizes="(max-width: 768px) 100vw, 380px"
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
 * `/academy` list body. Same CMS source as homepage Academy; full enabled set
 * (reader limit 50). No DB / empty CMS → i18n seed a1–a3. Cards link to
 * `/academy/[slug]`. Neutral education only — not investment advice.
 */
export default async function AcademyList() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('academy');
  const home = await getTranslations('home.goldAcademy');
  const items = await getAcademyArticles(locale);

  return (
    <section className="bg-[var(--fig-light)]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-12 px-6 py-16 sm:px-10 lg:px-[120px] lg:py-20">
        <header className="flex flex-col items-center gap-3 text-center">
          <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-gold">
            {t('kicker')}
          </span>
          <h1 className="font-sans text-[clamp(1.8rem,4vw,2.25rem)] font-extrabold leading-[1.15] text-[var(--fig-heading-dark)]">
            {t('heading')}
          </h1>
          <p className="max-w-2xl text-sm leading-[1.65] text-[var(--fig-text-muted)]">
            {t('disclaimer')}
          </p>
        </header>

        {items.length === 0 ? (
          <p className="mx-auto max-w-xl text-center text-sm leading-[1.65] text-[var(--fig-text-muted)]">
            {t('empty')}
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((article) => (
              <Link
                key={article.id}
                href={`/academy/${article.slug}`}
                className="group flex flex-col overflow-hidden rounded-lg border border-[var(--fig-border-light)] bg-white transition-colors hover:border-[rgba(212,175,55,0.45)]"
              >
                <div className="relative aspect-[16/9] w-full">
                  <ArticleCover article={article} fallbackAlt={t('imageAlt')} />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-6">
                  {article.category ? (
                    <span className="w-fit rounded-[4px] bg-[rgba(212,175,55,0.12)] px-2.5 py-1 text-[11px] font-bold text-[#9a7b1a]">
                      {article.category}
                    </span>
                  ) : null}
                  <h2 className="font-sans text-base font-extrabold leading-snug text-[var(--fig-heading-dark)]">
                    {article.title}
                  </h2>
                  {article.excerpt ? (
                    <p className="text-[13px] leading-[1.5] text-[var(--fig-text-muted)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] overflow-hidden">
                      {article.excerpt}
                    </p>
                  ) : null}
                  <span className="mt-auto text-[13px] font-semibold text-[#09395f] underline underline-offset-4 group-hover:text-gold">
                    {home('readMore')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
