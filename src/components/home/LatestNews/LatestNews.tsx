import {getLocale, getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/utils';
import {buttonVariants} from '@/components/ui/button';
import ActivityCard from '@/components/news/ActivityCard';
import {getHomeActivities} from '@/lib/homeActivities';
import type {Locale} from '@/i18n/routing';
import SectionTitle from '../SectionTitle';

const HOMEPAGE_LIMIT = 3;

/**
 * Homepage "最新消息" teaser. Reads Payload `home-activities` via
 * `getHomeActivities`. Empty list → neutral empty UI (no fabricated items).
 * Not in Figma frame 4:4; added for CMS Phase 2 (light band after Academy).
 */
export default async function LatestNews() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('news');
  const common = await getTranslations('common');
  const items = (await getHomeActivities(locale)).slice(0, HOMEPAGE_LIMIT);

  return (
    <section id="news" className="scroll-mt-20 bg-[var(--fig-light)]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-16 px-6 py-20 sm:px-10 lg:px-[120px] lg:py-24">
        <SectionTitle kicker={t('kicker')} heading={t('heading')} />

        {items.length === 0 ? (
          <p className="mx-auto max-w-xl text-center text-sm leading-[1.65] text-[var(--fig-text-muted)]">
            {t('empty')}
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
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

        <div className="flex justify-center">
          <Link
            href="/news"
            className={cn(buttonVariants({variant: 'default', size: 'fig'}))}
          >
            {t('viewAll')}
          </Link>
        </div>
      </div>
    </section>
  );
}
