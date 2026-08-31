import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/utils';
import {buttonVariants} from '@/components/ui/button';
import {getSiteSettings, primaryContactHref} from '@/lib/siteSettings';

/**
 * Dark hero for `/accounts` (Figma 62:24). Shares the homepage dark/gold system;
 * the Figma blue accent is mapped to HATC gold. Open-account is an operational
 * link resolved via CMS (never hard-coded); the demo CTA points at /register
 * until the owner supplies a demo flow.
 */
export default async function AccountsHero() {
  const t = await getTranslations('accounts.hero');
  const nav = await getTranslations('nav');
  const settings = await getSiteSettings();
  const openAccountHref = primaryContactHref(settings);

  return (
    <section className="relative overflow-hidden bg-[var(--fig-ink)] text-white">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 50% -10%, rgba(212,175,55,0.14), transparent 60%), linear-gradient(180deg, #0b1020 0%, #070a14 100%)'
        }}
      />

      <div className="relative mx-auto flex max-w-[1440px] flex-col items-center gap-8 px-6 pb-20 pt-28 text-center sm:px-10 lg:px-[120px] lg:pt-32">
        <nav
          aria-label="breadcrumb"
          className="flex items-center gap-2 self-start text-[13px]"
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

        <div className="flex max-w-[52rem] flex-col items-center gap-4">
          <span className="rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-gold">
            {t('badge')}
          </span>
          <h1 className="font-sans text-[clamp(2.2rem,5vw,3rem)] font-extrabold leading-[1.15] text-white">
            {t('titleLead')}
            <span className="text-gold">{t('titleAccent')}</span>
            {t('titleTail')}
          </h1>
          <p className="max-w-[46rem] text-base leading-[1.6] text-[var(--fig-text-dim)] sm:text-lg">
            {t('subtitle')}
          </p>
        </div>

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
            href="/register"
            className={cn(buttonVariants({variant: 'onDark', size: 'fig'}))}
          >
            {t('ctaDemo')}
          </Link>
        </div>
      </div>
    </section>
  );
}
