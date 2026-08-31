import {getLocale, getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/utils';
import {buttonVariants} from '@/components/ui/button';
import {getFundingMarketing} from '@/lib/fundingMarketing';
import {getSiteSettings, primaryContactHref} from '@/lib/siteSettings';
import type {Locale} from '@/i18n/routing';

/**
 * Closing conversion band (Figma 75:324). Dark section. Copy is softened — no
 * fabricated "$100,000 virtual funds" / demo claims. Primary CTA opens a real
 * account (operational link via CMS); the secondary CTA points at /accounts.
 */
export default async function FundingCta() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('funding.cta');
  const marketing = await getFundingMarketing(locale);
  const settings = await getSiteSettings();
  const openAccountHref = primaryContactHref(settings);
  const ctaImage = marketing.images?.cta ?? '/figma/funding/cta.png';

  return (
    <section className="relative overflow-hidden bg-[var(--fig-ink)]">
      <div aria-hidden className="absolute inset-0">
        {/* Development placeholder image (Figma sample); owner-replaceable via CMS. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ctaImage}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-[rgba(7,10,20,0.85)]" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 90% at 50% 0%, rgba(212,175,55,0.12), transparent 60%)'
          }}
        />
      </div>
      <div className="relative mx-auto flex max-w-[1440px] flex-col items-center gap-6 px-6 py-24 text-center sm:px-10 lg:px-[120px]">
        <h2 className="max-w-[46rem] font-sans text-[clamp(1.7rem,3.5vw,2.25rem)] font-extrabold leading-tight text-white">
          {marketing.cta.heading}
        </h2>
        <p className="max-w-[42rem] text-base leading-[1.6] text-[var(--fig-text-dim)]">
          {marketing.cta.body}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {openAccountHref ? (
            <a
              href={openAccountHref}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({variant: 'gold', size: 'fig'}))}
            >
              {t('ctaOpen')}
            </a>
          ) : (
            <Link
              href="/register"
              className={cn(buttonVariants({variant: 'gold', size: 'fig'}))}
            >
              {t('ctaOpen')}
            </Link>
          )}
          <Link
            href="/accounts"
            className={cn(buttonVariants({variant: 'onDark', size: 'fig'}))}
          >
            {t('ctaDemo')}
          </Link>
        </div>
      </div>
    </section>
  );
}
