import Image from 'next/image';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/utils';
import {buttonVariants} from '@/components/ui/button';
import {getPlatformsMarketing} from '@/lib/platformsMarketing';

const HERO_FALLBACK = '/figma/platforms/hero-devices.png';

/**
 * Dark hero for `/platforms` (Figma 92:4). Shares the homepage dark/gold system;
 * the Figma orange accent is mapped to HATC gold. The device visual prefers the
 * CMS-uploaded hero image (`platforms-page` global) and falls back to the Figma
 * template's multi-device mockup (owner: 「圖先用 Figma 的」) — a generic charts
 * render, NOT a real HATC platform screenshot; labelled 示意 until replaced. The
 * primary CTA scrolls to platform-types; the demo CTA points at /accounts.
 */
export default async function PlatformsHero() {
  const t = await getTranslations('platforms.hero');
  const nav = await getTranslations('nav');

  const {heroImage} = await getPlatformsMarketing();
  const heroSrc = heroImage ?? HERO_FALLBACK;
  const isSample = !heroImage;

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
            <Link
              href="/accounts"
              className={cn(buttonVariants({variant: 'onDark', size: 'fig'}))}
            >
              {t('ctaDemo')}
            </Link>
          </div>
        </div>

        <div className="relative">
          <div
            className="relative flex h-[320px] items-center justify-center overflow-hidden rounded-[16px] border border-[var(--fig-border)] sm:h-[400px]"
            style={{
              background:
                'radial-gradient(120% 120% at 70% 10%, rgba(212,175,55,0.18), transparent 55%), linear-gradient(150deg, #111625 0%, #070a14 100%)'
            }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(212,175,55,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.4) 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }}
            />
            <Image
              src={heroSrc}
              alt=""
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              priority
              className="object-contain p-4"
            />
          </div>
          {isSample ? (
            <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-3 py-1 text-[11px] font-semibold tracking-wide text-white/85 backdrop-blur-sm">
              {t('visualLabel')}
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
