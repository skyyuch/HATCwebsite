import {RichText} from '@payloadcms/richtext-lexical/react';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import type {AnnouncementDetail} from '@/lib/announcements';
import {formatDateLong} from '@/lib/dates';

/**
 * `/announcements/[slug]` notice body. Light surface matching the list; Lexical
 * rendered through Payload's `RichText` (same prose styling as the Academy
 * detail page, plus table support since trading-arrangement notices often
 * carry a schedule table).
 */
export default async function AnnouncementView({
  announcement,
  locale
}: {
  announcement: AnnouncementDetail;
  locale: string;
}) {
  const t = await getTranslations('announcements');

  return (
    <article className="bg-[var(--fig-light)]">
      <div className="mx-auto flex max-w-[800px] flex-col gap-10 px-6 py-16 sm:px-10 lg:py-20">
        <nav aria-label={t('breadcrumb')}>
          <Link
            href="/announcements"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#09395f] underline-offset-4 hover:underline"
          >
            <span aria-hidden>←</span>
            {t('backToList')}
          </Link>
        </nav>

        <header className="flex flex-col gap-4">
          {announcement.category ? (
            <span className="w-fit rounded-[4px] bg-[rgba(212,175,55,0.12)] px-2.5 py-1 text-[11px] font-bold text-[#9a7b1a]">
              {announcement.category.name}
            </span>
          ) : null}
          <h1 className="font-sans text-[clamp(1.75rem,4vw,2.25rem)] font-extrabold leading-[1.2] text-[var(--fig-heading-dark)]">
            {announcement.title}
          </h1>
          {announcement.publishedAt ? (
            <time
              dateTime={announcement.publishedAt}
              className="text-[13px] text-[var(--fig-text-muted)]"
            >
              {formatDateLong(announcement.publishedAt, locale)}
            </time>
          ) : null}
          {announcement.excerpt ? (
            <p className="text-[15px] leading-[1.7] text-[var(--fig-text-muted)]">
              {announcement.excerpt}
            </p>
          ) : null}
          <div
            aria-hidden
            className="h-px w-full bg-[var(--fig-border-light)]"
          />
        </header>

        {announcement.body ? (
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
              '[&_hr]:my-8 [&_hr]:border-[var(--fig-border-light)]',
              '[&_table]:my-6 [&_table]:w-full [&_table]:border-collapse [&_table]:text-[14px]',
              '[&_th]:border [&_th]:border-[var(--fig-border-light)] [&_th]:bg-white [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-bold',
              '[&_td]:border [&_td]:border-[var(--fig-border-light)] [&_td]:px-3 [&_td]:py-2'
            ].join(' ')}
          >
            <RichText data={announcement.body} />
          </div>
        ) : (
          <p className="text-[15px] leading-[1.75] text-[var(--fig-text-muted)]">
            {t('bodyEmpty')}
          </p>
        )}

        <footer className="border-t border-[var(--fig-border-light)] pt-8">
          <Link
            href="/announcements"
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
