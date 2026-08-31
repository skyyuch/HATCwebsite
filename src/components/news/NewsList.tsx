import {getLocale, getTranslations} from 'next-intl/server';
import ActivityCard from '@/components/news/ActivityCard';
import {getHomeActivities} from '@/lib/homeActivities';
import type {Locale} from '@/i18n/routing';

/**
 * `/news` list body. Same CMS source as homepage LatestNews; full enabled set
 * (reader limit 50). Empty → neutral empty copy from i18n (no invented items).
 */
export default async function NewsList() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('news');
  const common = await getTranslations('common');
  const items = await getHomeActivities(locale);

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
        </header>

        {items.length === 0 ? (
          <p className="mx-auto max-w-xl text-center text-sm leading-[1.65] text-[var(--fig-text-muted)]">
            {t('empty')}
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ActivityCard
                key={item.id}
                item={item}
                locale={locale}
                readMore={common('readMore')}
                imageAlt={t('imageAlt')}
                tone="light"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
