import Image from 'next/image';
import {getLocale, getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/utils';
import {buttonVariants} from '@/components/ui/button';
import {
  getAcademyArticles,
  type AcademyArticle
} from '@/lib/academyArticles';
import {getHomeMarketing} from '@/lib/homeMarketing';
import type {Locale} from '@/i18n/routing';
import SectionTitle from '../SectionTitle';

const HOMEPAGE_LIMIT = 3;

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
 * gold-academy (Figma 4:213): darkest section, three article cards.
 * Educational, neutral content (not investment advice). Reads Payload
 * `academy-articles` via `getAcademyArticles`; no DB → i18n seed a1–a3
 * (Figma placeholder thumbs). Cards link to `/academy/[slug]`. CMS Phase 3.
 */
export default async function Academy() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('home.goldAcademy');
  const copy = (await getHomeMarketing(locale)).academy;
  const articles = (await getAcademyArticles(locale)).slice(0, HOMEPAGE_LIMIT);

  return (
    <section id="academy" className="scroll-mt-20 bg-[var(--fig-ink)]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-16 px-6 py-20 sm:px-10 lg:px-[120px] lg:py-24">
        <SectionTitle kicker={copy.kicker} heading={copy.heading} tone="dark" />

        <div className="grid gap-6 md:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/academy/${article.slug}`}
              className="group flex flex-col overflow-hidden rounded-lg border border-[var(--fig-border)] bg-[var(--fig-surface)] transition-colors hover:border-[rgba(212,175,55,0.45)]"
            >
              <div className="relative aspect-[16/9] w-full">
                <ArticleCover article={article} fallbackAlt={t('imageAlt')} />
              </div>
              <div className="flex flex-1 flex-col gap-4 p-6">
                {article.category ? (
                  <span className="w-fit rounded-[4px] bg-[rgba(212,175,55,0.1)] px-2.5 py-1 text-[11px] font-bold text-gold">
                    {article.category}
                  </span>
                ) : null}
                <h3 className="font-sans text-base font-extrabold leading-snug text-white">
                  {article.title}
                </h3>
                {article.excerpt ? (
                  <p className="text-[13px] leading-[1.5] text-[var(--fig-text-dim)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
                    {article.excerpt}
                  </p>
                ) : null}
                <span className="mt-auto text-[13px] font-semibold text-gold underline underline-offset-4">
                  {t('readMore')}
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex justify-center">
          <Link
            href="/academy"
            className={cn(buttonVariants({variant: 'onDark', size: 'fig'}))}
          >
            {t('browseAll')}
          </Link>
        </div>
      </div>
    </section>
  );
}
