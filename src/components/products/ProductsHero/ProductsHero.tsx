import Image from 'next/image';
import {getLocale, getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/utils';
import {buttonVariants} from '@/components/ui/button';
import {getProductsMarketing} from '@/lib/productsMarketing';
import type {Locale} from '@/i18n/routing';
import {getSiteSettings, primaryContactHref} from '@/lib/siteSettings';

/**
 * Products hero. Marketing copy = CMS with i18n fallback. Approved AA/008 badge
 * reused from home.heroV2. CTAs via SiteSettings. Numbers never from CMS.
 */
export default async function ProductsHero() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('products.hero');
  const copy = (await getProductsMarketing(locale)).hero;
  const nav = await getTranslations('nav');
  const common = await getTranslations('common');
  const heroV2 = await getTranslations('home.heroV2');
  const settings = await getSiteSettings();
  const contactHref = primaryContactHref(settings);

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
        style={{background: 'rgba(7,10,20,0.82)'}}
      />

      <div className="relative mx-auto flex max-w-[1440px] flex-col gap-6 px-6 pb-16 pt-28 sm:px-10 lg:px-[120px] lg:pt-32">
        <nav aria-label="breadcrumb" className="flex items-center gap-2 text-[13px]">
          <Link
            href="/"
            className="text-[var(--fig-text-dim)] transition-colors hover:text-white"
          >
            {nav('home')}
          </Link>
          <span aria-hidden className="text-[var(--fig-text-dim)]">
            /
          </span>
          <span className="text-gold">{nav('products')}</span>
        </nav>

        <span className="inline-flex w-fit items-center rounded-[4px] border border-gold bg-[rgba(212,175,55,0.12)] px-3 py-1.5 text-xs font-bold text-gold">
          {heroV2('badge')}
        </span>

        <h1 className="max-w-[46rem] text-[clamp(2.2rem,5vw,3.25rem)] font-extrabold leading-[1.15] text-white">
          {copy.titleLead}
          <span className="text-gold">{copy.titleAccent}</span>
          {copy.titleTail}
        </h1>

        <p className="max-w-[42rem] text-lg leading-[1.5] text-[var(--fig-text-dim)]">
          {copy.subtitle}
        </p>

        <div className="mt-2 flex flex-wrap gap-4">
          {contactHref ? (
            <a
              href={contactHref}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({variant: 'gold', size: 'fig'}),
                'max-sm:flex-1'
              )}
            >
              {nav('openAccount')}
            </a>
          ) : (
            <Link
              href="/register"
              className={cn(
                buttonVariants({variant: 'gold', size: 'fig'}),
                'max-sm:flex-1'
              )}
            >
              {nav('openAccount')}
            </Link>
          )}
          <a
            href="#conditions"
            className={cn(
              buttonVariants({variant: 'onDark', size: 'fig'}),
              'max-sm:flex-1'
            )}
          >
            {common('viewMore')}
          </a>
        </div>
      </div>
    </section>
  );
}
