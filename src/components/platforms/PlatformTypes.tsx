import {getLocale, getTranslations} from 'next-intl/server';
import SectionTitle from '@/components/home/SectionTitle';
import {getTradingPlatforms} from '@/lib/tradingPlatforms';
import {getSiteSettings, primaryContactHref} from '@/lib/siteSettings';
import type {Locale} from '@/i18n/routing';
import PlatformTabsClient from './PlatformTabsClient';

type Bullet = {title: string; desc: string};

/**
 * Platform-types section (Figma 92:28 + 92:50). Tab cards come from the CMS
 * (`trading-platforms` collection) with an i18n fallback (`platforms.types.items`);
 * the value-prop bullets are shared page-level copy (`platforms.detail.bullets`),
 * converged to gold/silver and softened per governance. The detail CTA is an
 * operational open-account link resolved via CMS (falls back to /register).
 */
export default async function PlatformTypes() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('platforms.types');
  const detail = await getTranslations('platforms.detail');
  const nav = await getTranslations('nav');

  const platforms = await getTradingPlatforms(locale);
  const bullets = detail.raw('bullets') as Bullet[];

  const settings = await getSiteSettings();
  const openAccountHref = primaryContactHref(settings);

  return (
    <section id="platform-types" className="scroll-mt-20 bg-white">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-14 px-6 py-20 sm:px-10 lg:px-[120px] lg:py-24">
        <SectionTitle kicker={t('kicker')} heading={t('heading')} />
        <p className="-mt-8 text-center text-sm text-[var(--fig-text-muted)]">
          {t('subheading')}
        </p>

        <PlatformTabsClient
          platforms={platforms}
          bullets={bullets}
          visualNote={t('visualNote')}
          ctaLabel={nav('openAccount')}
          ctaHref={openAccountHref ?? '/register'}
          ctaExternal={Boolean(openAccountHref)}
        />
      </div>
    </section>
  );
}
