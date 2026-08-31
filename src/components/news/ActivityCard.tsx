import Image from 'next/image';
import {Link} from '@/i18n/navigation';
import type {HomeActivity} from '@/lib/homeActivities';
import type {Locale} from '@/i18n/routing';
import {cn} from '@/lib/utils';

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function formatDate(date: string, locale: Locale): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(parsed);
}

/**
 * Shared news/activity card for homepage teaser + `/news` list.
 * No image → brand navy/gold gradient (not a fake photo).
 */
export default function ActivityCard({
  item,
  locale,
  readMore,
  imageAlt,
  tone = 'light'
}: {
  item: HomeActivity;
  locale: Locale;
  readMore: string;
  imageAlt: string;
  tone?: 'light' | 'dark';
}) {
  const dark = tone === 'dark';
  const body = (
    <>
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, 380px"
            className="object-cover"
            unoptimized={isExternalHref(item.imageUrl)}
          />
        ) : (
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, #0c1a2e 0%, #09395f 45%, #1a3366 70%, #d4af37 160%)'
            }}
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex flex-wrap items-center gap-2">
          {item.tag ? (
            <span
              className={cn(
                'w-fit rounded-[4px] px-2.5 py-1 text-[11px] font-bold',
                dark
                  ? 'bg-[rgba(212,175,55,0.1)] text-gold'
                  : 'bg-[rgba(212,175,55,0.12)] text-[#9a7b1a]'
              )}
            >
              {item.tag}
            </span>
          ) : null}
          {item.date ? (
            <time
              dateTime={item.date}
              className={cn(
                'text-[12px]',
                dark ? 'text-[var(--fig-text-dim)]' : 'text-[var(--fig-text-muted)]'
              )}
            >
              {formatDate(item.date, locale)}
            </time>
          ) : null}
        </div>
        <h3
          className={cn(
            'font-sans text-base font-extrabold leading-snug',
            dark ? 'text-white' : 'text-[var(--fig-heading-dark)]'
          )}
        >
          {item.title}
        </h3>
        {item.summary ? (
          <p
            className={cn(
              'text-[13px] leading-[1.5] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden',
              dark ? 'text-[var(--fig-text-dim)]' : 'text-[var(--fig-text-muted)]'
            )}
          >
            {item.summary}
          </p>
        ) : null}
        {item.href ? (
          <span
            className={cn(
              'mt-auto text-[13px] font-semibold underline underline-offset-4',
              dark ? 'text-gold' : 'text-[#09395f]'
            )}
          >
            {readMore}
          </span>
        ) : null}
      </div>
    </>
  );

  const shellClass = cn(
    'flex flex-col overflow-hidden rounded-lg border',
    dark
      ? 'border-[var(--fig-border)] bg-[var(--fig-surface)]'
      : 'border-[var(--fig-border-light)] bg-white'
  );

  if (!item.href) {
    return <article className={shellClass}>{body}</article>;
  }

  if (isExternalHref(item.href)) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(shellClass, 'transition-opacity hover:opacity-95')}
      >
        {body}
      </a>
    );
  }

  return (
    <Link href={item.href} className={cn(shellClass, 'transition-opacity hover:opacity-95')}>
      {body}
    </Link>
  );
}
