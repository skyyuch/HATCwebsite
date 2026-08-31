import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';

/**
 * Gold Academy page hero (Figma 98:33) — HATC-ised. The Figma is a Vantage
 * template: orange gradient + floating 3D coins / gold bars / bokeh / glow.
 * Per the design red lines (no orange, no floating 3D coins, no glowing gold)
 * this is rebuilt as a restrained navy→gold gradient band with a subtle gold
 * accent line only. White breadcrumb bar sits above it (matches the white
 * global Header). Copy avoids any profit promise.
 */
export default async function AcademyHero() {
  const t = await getTranslations('academy');
  const nav = await getTranslations('nav');

  return (
    <>
      <nav
        aria-label={t('breadcrumb')}
        className="border-b border-[var(--fig-border-light)] bg-white"
      >
        <div className="mx-auto flex max-w-[1440px] items-center gap-2 px-6 py-5 text-[13px] text-[var(--fig-text-muted)] sm:px-10 lg:px-[120px]">
          <Link href="/" className="transition-colors hover:text-[#09395f]">
            {nav('home')}
          </Link>
          <span aria-hidden className="text-[var(--fig-border-light)]">
            ›
          </span>
          <span className="font-semibold text-[#0c111d]">{t('hero.title')}</span>
        </div>
      </nav>

      <section className="relative overflow-hidden bg-[linear-gradient(118deg,#0b1a2f_0%,#09395f_55%,#123a63_100%)]">
        {/* Restrained decorative accents (no neon / no floating coins). */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(115deg, transparent 0 46px, #d4af37 46px 47px)'
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.18),transparent_65%)]"
        />

        <div className="relative mx-auto flex max-w-[1440px] flex-col gap-4 px-6 py-16 sm:px-10 lg:px-[120px] lg:py-20">
          <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-[12px] font-bold uppercase tracking-[0.14em] text-gold ring-1 ring-[rgba(212,175,55,0.4)]">
            {t('hero.badge')}
          </span>
          <h1 className="font-sans text-[clamp(2rem,5vw,3rem)] font-black leading-[1.15] text-white">
            {t('hero.title')}
          </h1>
          <p className="max-w-[720px] text-[18px] leading-[1.6] text-white/80">
            {t('hero.subtitle')}
          </p>
          <div
            aria-hidden
            className="mt-2 h-px w-full max-w-[1200px] bg-[linear-gradient(90deg,rgba(212,175,55,0.7),transparent)]"
          />
        </div>
      </section>
    </>
  );
}
