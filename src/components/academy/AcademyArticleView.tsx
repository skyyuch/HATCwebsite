import Image from 'next/image';
import {RichText} from '@payloadcms/richtext-lexical/react';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import type {AcademyArticleDetail} from '@/lib/academyArticles';

function isExternalSrc(src: string): boolean {
  return /^https?:\/\//i.test(src);
}

function formatPublishedAt(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function Cover({
  article,
  fallbackAlt
}: {
  article: AcademyArticleDetail;
  fallbackAlt: string;
}) {
  if (article.coverUrl) {
    return (
      <Image
        src={article.coverUrl}
        alt={article.coverAlt || fallbackAlt}
        fill
        priority
        sizes="(max-width: 768px) 100vw, 800px"
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
 * `/academy/[slug]` article body. Dark/gold light surface (matches list).
 * Lexical via Payload RichText; seed/excerpt-only when no CMS body.
 * Neutral education — not investment advice.
 */
export default async function AcademyArticleView({
  article,
  locale
}: {
  article: AcademyArticleDetail;
  locale: string;
}) {
  const t = await getTranslations('academy');

  return (
    <article className="bg-[var(--fig-light)]">
      <div className="mx-auto flex max-w-[800px] flex-col gap-10 px-6 py-16 sm:px-10 lg:py-20">
        <nav aria-label={t('breadcrumb')}>
          <Link
            href="/academy"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#09395f] underline-offset-4 hover:underline"
          >
            <span aria-hidden>←</span>
            {t('backToList')}
          </Link>
        </nav>

        <header className="flex flex-col gap-4">
          {article.category ? (
            <span className="w-fit rounded-[4px] bg-[rgba(212,175,55,0.12)] px-2.5 py-1 text-[11px] font-bold text-[#9a7b1a]">
              {article.category}
            </span>
          ) : null}
          <h1 className="font-sans text-[clamp(1.75rem,4vw,2.25rem)] font-extrabold leading-[1.2] text-[var(--fig-heading-dark)]">
            {article.title}
          </h1>
          {article.publishedAt ? (
            <time
              dateTime={article.publishedAt}
              className="text-[13px] text-[var(--fig-text-muted)]"
            >
              {formatPublishedAt(article.publishedAt, locale)}
            </time>
          ) : null}
          <p className="text-sm leading-[1.65] text-[var(--fig-text-muted)]">
            {t('disclaimer')}
          </p>
        </header>

        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
          <Cover article={article} fallbackAlt={t('imageAlt')} />
        </div>

        {article.body ? (
          <div
            className={[
              'font-sans text-[15px] leading-[1.75] text-[var(--fig-heading-dark)]',
              '[&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:font-sans [&_h2]:text-xl [&_h2]:font-extrabold',
              '[&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:font-sans [&_h3]:text-lg [&_h3]:font-bold',
              '[&_p]:mb-4 [&_p]:text-[var(--fig-heading-dark)]',
              '[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5',
              '[&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5',
              '[&_li]:mb-1.5',
              '[&_a]:font-semibold [&_a]:text-[#09395f] [&_a]:underline [&_a]:underline-offset-4',
              '[&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-gold [&_blockquote]:pl-4 [&_blockquote]:text-[var(--fig-text-muted)]',
              '[&_hr]:my-8 [&_hr]:border-[var(--fig-border-light)]'
            ].join(' ')}
          >
            <RichText data={article.body} />
          </div>
        ) : (
          <p className="text-[15px] leading-[1.75] text-[var(--fig-text-muted)]">
            {t('bodyEmpty')}
          </p>
        )}

        <footer className="border-t border-[var(--fig-border-light)] pt-8">
          <Link
            href="/academy"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#09395f] underline-offset-4 hover:underline"
          >
            <span aria-hidden>←</span>
            {t('backToList')}
          </Link>
        </footer>
      </div>
    </article>
  );
}
