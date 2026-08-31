import Image from 'next/image';
import {getLocale, getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/utils';
import {buttonVariants} from '@/components/ui/button';
import {getProductsMarketing} from '@/lib/productsMarketing';
import type {Locale} from '@/i18n/routing';
import {getSiteSettings, primaryContactHref} from '@/lib/siteSettings';

/**
 * Closing conversion band. Marketing copy = CMS with i18n fallback; CTAs via
 * SiteSettings.
 */
export default async function ProductsCta() {
  const locale = (await getLocale()) as Locale;
  const copy = (await getProductsMarketing(locale)).cta;
  const nav = await getTranslations('nav');
  const common = await getTranslations('common');
  const settings = await getSiteSettings();
  const contactHref = primaryContactHref(settings);

  return (
    <section className="relative overflow-hidden bg-[var(--fig-ink)]">
      <Image
        src="/figma/about/about-cta-bg.png"
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{background: 'rgba(7,10,20,0.95)'}}
      />

      <div className="relative mx-auto flex max-w-[1440px] flex-col items-center gap-6 px-6 py-20 text-center sm:px-10 lg:px-[120px]">
        <h2 className="font-sans text-[clamp(1.6rem,3.5vw,2rem)] font-extrabold leading-tight text-white">
          {copy.heading}
        </h2>
        <p className="max-w-[40rem] text-base text-[var(--fig-text-dim)]">
          {copy.body}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {contactHref ? (
            <a
              href={contactHref}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({variant: 'gold', size: 'fig'}))}
            >
              {nav('openAccount')}
            </a>
          ) : (
            <Link
              href="/register"
              className={cn(buttonVariants({variant: 'gold', size: 'fig'}))}
            >
              {nav('openAccount')}
            </Link>
          )}
          {contactHref ? (
            <a
              href={contactHref}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({variant: 'onDark', size: 'fig'}))}
            >
              {common('contactUs')}
            </a>
          ) : (
            <Link
              href="/account"
              className={cn(buttonVariants({variant: 'onDark', size: 'fig'}))}
              aria-label={common('contactUs')}
            >
              {common('contactUs')}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
