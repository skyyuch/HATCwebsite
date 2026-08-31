import {getLocale, getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/utils';
import {buttonVariants} from '@/components/ui/button';
import {getFundingMarketing} from '@/lib/fundingMarketing';
import {getSiteSettings, primaryContactHref} from '@/lib/siteSettings';
import type {Locale} from '@/i18n/routing';

/**
 * Dark hero for `/funding` (Figma 75:206). Shares the homepage dark/gold system;
 * the Figma orange accent is mapped to HATC gold. Trust badges use approved
 * facts only (fund segregation) — no fabricated "multiple global awards" claim.
 * The hero background uses the shared navy gradient (no stock photo). Copy is
 * CMS-overridable via the `funding-page` global; the open-account link is an
 * operational link resolved via CMS (never hard-coded).
 */
export default async function FundingHero() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('funding.hero');
  const nav = await getTranslations('nav');
  const marketing = await getFundingMarketing(locale);
  const settings = await getSiteSettings();
  const openAccountHref = primaryContactHref(settings);
  const heroImage = marketing.images?.hero ?? '/figma/funding/hero.png';

  return (
    <section className="relative overflow-hidden bg-[var(--fig-ink)] text-white">
      <div aria-hidden className="absolute inset-0">
        {/* Development placeholder image (Figma sample); owner-replaceable via CMS. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-[rgba(7,10,20,0.86)]" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 90% at 50% -10%, rgba(212,175,55,0.16), transparent 60%)'
          }}
        />
      </div>

      <div className="relative mx-auto flex max-w-[1440px] flex-col items-start gap-6 px-6 pb-24 pt-28 sm:px-10 lg:px-[120px] lg:pt-32">
        <nav
          aria-label="breadcrumb"
          className="flex items-center gap-2 text-[13px]"
        >
          <Link
            href="/"
            className="text-[var(--fig-text-dim)] transition-colors hover:text-white"
          >
            {nav('home')}
          </Link>
          <span aria-hidden className="text-[var(--fig-text-dim)]">
            /
          </span>
          <span className="text-gold">{t('breadcrumb')}</span>
        </nav>

        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-gold/10 px-3 py-1.5 text-xs font-bold text-gold">
            {t('badge1')}
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white">
            {t('badge2')}
          </span>
        </div>

        <div className="flex max-w-[50rem] flex-col gap-4">
          <h1 className="font-sans text-[clamp(2.2rem,5vw,3rem)] font-extrabold leading-[1.15] text-white">
            {marketing.hero.titleLead}
            <span className="text-gold">{marketing.hero.titleAccent}</span>
            {marketing.hero.titleTail}
          </h1>
          <p className="max-w-[44rem] text-base leading-[1.6] text-[var(--fig-text-dim)] sm:text-lg">
            {marketing.hero.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
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
        </div>
      </div>
    </section>
  );
}
