import {getLocale, getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/utils';
import {buttonVariants} from '@/components/ui/button';
import {getTradingMarketing} from '@/lib/tradingMarketing';
import type {Locale} from '@/i18n/routing';
import {getSiteSettings, primaryContactHref} from '@/lib/siteSettings';

/**
 * Closing CTA band (Figma 44:281). Marketing copy = CMS with i18n fallback;
 * operational CTAs via SiteSettings.
 */
export default async function TradingCta() {
  const locale = (await getLocale()) as Locale;
  const copy = (await getTradingMarketing(locale)).cta;
  const nav = await getTranslations('nav');
  const common = await getTranslations('common');
  const settings = await getSiteSettings();
  const contactHref = primaryContactHref(settings);

  return (
    <section className="border-t-2 border-[var(--trd-gold)] bg-[#0f1e40] font-[family-name:var(--font-geist)]">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-8 px-6 py-20 text-center sm:px-10 lg:px-[120px]">
        <div className="flex flex-col items-center gap-4">
          <h2 className="font-[family-name:var(--font-serif-display)] text-[clamp(2.25rem,4vw,2.75rem)] font-normal leading-[1.15] text-white">
            {copy.heading}
          </h2>
          <p className="max-w-[640px] text-base leading-[1.6] text-[var(--trd-muted)]">
            {copy.body}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-5 max-sm:w-full">
          {contactHref ? (
            <a
              href={contactHref}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({size: 'fig'}),
                'bg-[var(--trd-gold)] text-[var(--trd-navy)] hover:brightness-95 max-sm:flex-1'
              )}
            >
              {nav('openAccount')}
            </a>
          ) : (
            <Link
              href="/register"
              className={cn(
                buttonVariants({size: 'fig'}),
                'bg-[var(--trd-gold)] text-[var(--trd-navy)] hover:brightness-95 max-sm:flex-1'
              )}
            >
              {nav('openAccount')}
            </Link>
          )}
          {contactHref ? (
            <a
              href={contactHref}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({size: 'fig'}),
                'border-[1.5px] border-white bg-transparent text-white hover:bg-white/10 max-sm:flex-1'
              )}
            >
              {common('contactUs')}
            </a>
          ) : (
            <Link
              href="/account"
              aria-label={common('contactUs')}
              className={cn(
                buttonVariants({size: 'fig'}),
                'border-[1.5px] border-white bg-transparent text-white hover:bg-white/10 max-sm:flex-1'
              )}
            >
              {common('contactUs')}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
