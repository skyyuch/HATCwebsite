import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/utils';
import {buttonVariants} from '@/components/ui/button';
import {getPlatformsMarketing} from '@/lib/platformsMarketing';
import {demoAccountHref, getSiteSettings} from '@/lib/siteSettings';
import PlatformVisualPanel from './PlatformVisualPanel';
import {
  TERMINAL_HERO,
  visualNote,
  type PlatformVisual
} from './platformVisuals';

/**
 * Dark hero for `/platforms` (Figma 92:4). Shares the homepage dark/gold system;
 * the Figma orange accent is mapped to HATC gold.
 *
 * The hero picture follows the same precedence as the rest of the site: an
 * owner upload from the CMS, otherwise real captures of the web terminal and
 * the app together. The primary CTA scrolls to platform-types; the demo CTA
 * only renders once the owner configures a demo-account URL in the CMS.
 */
export default async function PlatformsHero() {
  const t = await getTranslations('platforms.hero');
  const terminal = await getTranslations('platforms.types');
  const nav = await getTranslations('nav');
  const demoHref = demoAccountHref(await getSiteSettings());

  const {heroImage} = await getPlatformsMarketing();
  const visual: PlatformVisual = heroImage
    ? {kind: 'upload', src: heroImage}
    : {kind: 'combo', ...TERMINAL_HERO};
  const note = visualNote(visual);

  return (
    <section className="relative overflow-hidden bg-[var(--fig-ink)] text-white">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 80% -10%, rgba(212,175,55,0.16), transparent 60%), linear-gradient(180deg, #0b1020 0%, #070a14 100%)'
        }}
      />

      <div className="relative mx-auto grid max-w-[1440px] items-center gap-12 px-6 pb-20 pt-28 sm:px-10 lg:grid-cols-2 lg:px-[120px] lg:pt-32">
        <div className="flex flex-col gap-6">
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

          <span className="w-fit rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-gold">
            {t('badge')}
          </span>

          <h1 className="font-sans text-[clamp(2.2rem,5vw,3rem)] font-extrabold leading-[1.15] text-white">
            {t('titleLead')}
            <span className="text-gold">{t('titleAccent')}</span>
            {t('titleTail')}
          </h1>

          <p className="max-w-[34rem] text-base leading-[1.6] text-[var(--fig-text-dim)] sm:text-lg">
            {t('subtitle')}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="#platform-types"
              className={cn(buttonVariants({variant: 'gold', size: 'fig'}))}
            >
              {t('ctaLearn')}
            </a>
            {demoHref ? (
              <a
                href={demoHref}
                className={cn(buttonVariants({variant: 'onDark', size: 'fig'}))}
              >
                {t('ctaDemo')}
              </a>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <PlatformVisualPanel
            visual={visual}
            label={t('breadcrumb')}
            alt={t('breadcrumb')}
            priority
            className="h-[300px] rounded-[16px] border border-[var(--fig-border)] sm:h-[380px] lg:h-[420px]"
          />
          {note ? (
            <p className="text-xs leading-[1.6] text-[var(--fig-text-dim)]">
              {terminal(note)}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
