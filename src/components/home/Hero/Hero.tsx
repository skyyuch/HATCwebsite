import Image from 'next/image';
import {getLocale, getTranslations} from 'next-intl/server';
import {cn} from '@/lib/utils';
import {buttonVariants} from '@/components/ui/button';
import {getHomeMarketing} from '@/lib/homeMarketing';
import type {Locale} from '@/i18n/routing';
import {getSiteSettings, primaryContactHref} from '@/lib/siteSettings';
import {SAMPLE_HERO_PRICE, SAMPLE_SPARKLINE} from '../sampleMarketData';
import MarketTicker from './MarketTicker';

/**
 * Figma-led dark hero (owner 2026-08-10): full-bleed gold imagery + navy scrim,
 * an eyebrow badge from approved facts, headline, dual CTA and a live-price card
 * (sample data, clearly labelled). A market ticker anchors the bottom edge.
 * Marketing copy = CMS HomePage global with i18n fallback; open-account link via
 * SiteSettings.
 */
export default async function Hero() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('home.heroV2');
  const copy = (await getHomeMarketing(locale)).hero;
  const common = await getTranslations('common');
  const settings = await getSiteSettings();
  const openAccountHref = primaryContactHref(settings);

  return (
    <section className="relative overflow-hidden bg-[var(--fig-ink)] text-white">
      <Image
        src="/figma/raw/raw_2.png"
        alt={t('bgAlt')}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{background: 'rgba(7,10,20,0.8)'}}
      />

      <div className="relative mx-auto grid max-w-[1440px] items-center gap-12 px-6 pb-24 pt-28 sm:px-10 lg:grid-cols-[687fr_481fr] lg:gap-16 lg:px-[120px] lg:pb-20 lg:pt-40">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          <span className="inline-flex w-fit items-center rounded-[4px] border border-gold bg-[rgba(212,175,55,0.12)] px-3 py-1.5 text-xs font-bold text-gold">
            {copy.badge}
          </span>

          <h1 className="text-[clamp(2.4rem,5.4vw,3.5rem)] font-extrabold leading-[1.15] text-white">
            {copy.titleLine1}
            <br />
            <span className="text-gold">{copy.titleBrand}</span>
            {' '}
            {copy.titleTail}
          </h1>

          <p className="max-w-[34rem] text-base leading-[1.6] text-[var(--fig-text-dim)]">
            {copy.subtitle}
          </p>

          <div className="mt-2 flex flex-wrap gap-4">
            {openAccountHref ? (
              <a
                href={openAccountHref}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({variant: 'gold', size: 'fig'}),
                  'max-sm:flex-1'
                )}
              >
                {copy.ctaPrimary}
              </a>
            ) : (
              <a
                href="#gold-services"
                className={cn(
                  buttonVariants({variant: 'gold', size: 'fig'}),
                  'max-sm:flex-1'
                )}
              >
                {copy.ctaPrimary}
              </a>
            )}
            <a
              href="#support"
              className={cn(
                buttonVariants({variant: 'onDark', size: 'fig'}),
                'max-sm:flex-1'
              )}
            >
              {common('contactUs')}
            </a>
          </div>
        </div>

        {/* Right column — live-price card (SAMPLE data) */}
        <div className="w-full max-w-[481px] justify-self-end rounded-2xl border border-[var(--fig-border)] bg-[rgba(17,22,37,0.8)] p-6 backdrop-blur-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gold">
              {t('priceTitle')} XAU/USD
            </span>
            <span className="text-xs text-[var(--fig-text-dim)]">
              {t('sampleData')}
            </span>
          </div>

          <div className="mt-5 flex items-end gap-3">
            <span className="font-[family-name:var(--font-ticker)] text-[32px] font-extrabold leading-none text-white">
              {SAMPLE_HERO_PRICE.value}
            </span>
            <span className="pb-1 text-sm font-bold text-[var(--fig-up)]">
              {SAMPLE_HERO_PRICE.change}
            </span>
          </div>

          <svg
            aria-hidden
            viewBox="0 0 105 32"
            preserveAspectRatio="none"
            className="mt-5 h-12 w-full"
          >
            <path
              d={SAMPLE_SPARKLINE}
              fill="none"
              stroke="var(--fig-gold)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <div className="mt-5 flex justify-between border-t border-[var(--fig-border)] pt-4">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-[var(--fig-text-dim)]">
                {t('high')}
              </span>
              <span className="text-sm font-bold text-white">
                {SAMPLE_HERO_PRICE.high}
              </span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[11px] text-[var(--fig-text-dim)]">
                {t('low')}
              </span>
              <span className="text-sm font-bold text-white">
                {SAMPLE_HERO_PRICE.low}
              </span>
            </div>
          </div>
        </div>
      </div>

      <MarketTicker sampleLabel={t('sampleData')} />
    </section>
  );
}
