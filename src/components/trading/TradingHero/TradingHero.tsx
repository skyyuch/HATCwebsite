import Image from 'next/image';
import {getLocale, getTranslations} from 'next-intl/server';
import {cn} from '@/lib/utils';
import {buttonVariants} from '@/components/ui/button';
import {getTradingMarketing} from '@/lib/tradingMarketing';
import type {Locale} from '@/i18n/routing';
import {getSiteSettings, primaryContactHref} from '@/lib/siteSettings';

/**
 * Trading overview hero (Figma 44:29) — light system. Marketing copy = CMS
 * TradingPage with i18n fallback; badge reuses approved AA/008 fact.
 */
export default async function TradingHero() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('trading.hero');
  const copy = (await getTradingMarketing(locale)).hero;
  const heroV2 = await getTranslations('home.heroV2');
  const common = await getTranslations('common');
  const settings = await getSiteSettings();
  const contactHref = primaryContactHref(settings);

  return (
    <section className="bg-white font-[family-name:var(--font-geist)]">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-12 px-6 py-14 sm:px-10 lg:flex-row lg:justify-between lg:gap-16 lg:px-[120px] lg:py-20">
        <div className="flex w-full max-w-[580px] flex-col items-start gap-6">
          <span className="inline-flex items-center rounded-full border border-[var(--trd-gold)] bg-[var(--trd-cream)] px-3 py-1 text-[13px] font-semibold text-[var(--trd-gold)]">
            {heroV2('badge')}
          </span>

          <h1 className="font-[family-name:var(--font-serif-display)] text-[clamp(2.5rem,5.4vw,3.5rem)] font-normal leading-[1.1] text-[var(--trd-navy)]">
            {copy.titleLine1}
            <br />
            {copy.titleLine2}
          </h1>

          <p className="text-base leading-[1.6] text-[var(--trd-body)]">
            {copy.subtitle}
          </p>

          <div className="mt-2 flex flex-wrap gap-4 max-sm:w-full">
            <a
              href="#services"
              className={cn(
                buttonVariants({size: 'fig'}),
                'bg-[var(--trd-navy)] text-white hover:bg-[var(--trd-navy-hover)] max-sm:flex-1'
              )}
            >
              {heroV2('ctaPrimary')}
            </a>
            {contactHref ? (
              <a
                href={contactHref}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({size: 'fig'}),
                  'border-[1.5px] border-[var(--trd-navy)] bg-transparent text-[var(--trd-navy)] hover:bg-[var(--trd-navy)]/5 max-sm:flex-1'
                )}
              >
                {common('contactUs')}
              </a>
            ) : (
              <a
                href="#faq"
                className={cn(
                  buttonVariants({size: 'fig'}),
                  'border-[1.5px] border-[var(--trd-navy)] bg-transparent text-[var(--trd-navy)] hover:bg-[var(--trd-navy)]/5 max-sm:flex-1'
                )}
              >
                {common('contactUs')}
              </a>
            )}
          </div>
        </div>

        <div className="relative aspect-[540/400] w-full max-w-[540px] shrink-0 overflow-hidden rounded-[12px]">
          <Image
            src="/figma/trading/hero-tablet.png"
            alt={t('imageAlt')}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 540px"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
