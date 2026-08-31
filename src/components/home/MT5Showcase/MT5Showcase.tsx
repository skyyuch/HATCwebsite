import Image from 'next/image';
import {getLocale, getTranslations} from 'next-intl/server';
import {Smartphone, SlidersHorizontal, LineChart} from 'lucide-react';
import {cn} from '@/lib/utils';
import {buttonVariants} from '@/components/ui/button';
import {getHomeMarketing} from '@/lib/homeMarketing';
import type {Locale} from '@/i18n/routing';
import SectionTitle from '../SectionTitle';

// mt5-showcase (Figma 4:154): dark full-bleed section with a platform screenshot
// card and feature list. The screenshot is a Figma placeholder (owner replaces).
const FEATURES = [
  {key: 'f1', Icon: Smartphone},
  {key: 'f2', Icon: SlidersHorizontal},
  {key: 'f3', Icon: LineChart}
] as const;

export default async function MT5Showcase() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('home.mt5');
  const copy = (await getHomeMarketing(locale)).mt5;

  return (
    <section id="mt5" className="relative scroll-mt-20 overflow-hidden bg-[var(--fig-ink)]">
      <Image
        src="/figma/raw/raw_4.png"
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{background: 'rgba(7,10,20,0.9)'}}
      />

      <div className="relative mx-auto flex max-w-[1440px] flex-col gap-16 px-6 py-20 sm:px-10 lg:px-[120px] lg:py-24">
        <SectionTitle kicker={copy.kicker} heading={copy.heading} tone="dark" />

        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left — platform screenshot card */}
          <div className="relative aspect-[584/380] overflow-hidden rounded-2xl border border-[var(--fig-border)] bg-[var(--fig-surface)]">
            <Image
              src="/figma/raw/raw_3.png"
              alt={t('screenshotAlt')}
              fill
              sizes="(max-width: 1024px) 100vw, 584px"
              className="object-cover"
            />
          </div>

          {/* Right — features + CTA */}
          <div className="flex flex-col gap-8">
            <h3 className="font-sans text-[28px] font-extrabold leading-tight text-white">
              {copy.subheading}
            </h3>
            <p className="text-[15px] leading-[1.65] text-[var(--fig-text-dim)]">
              {copy.body}
            </p>
            <ul className="flex flex-col gap-5">
              {FEATURES.map(({key, Icon}) => (
                <li key={key} className="flex items-start gap-4">
                  <span className="grid size-7 shrink-0 place-items-center rounded-[14px] bg-[rgba(212,175,55,0.12)] text-gold">
                    <Icon className="size-3.5" aria-hidden />
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[15px] font-bold text-white">
                      {t(`features.${key}.title`)}
                    </span>
                    <span className="text-[13px] text-[var(--fig-text-dim)]">
                      {t(`features.${key}.sub`)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex flex-wrap gap-4">
              <a
                href="#support"
                className={cn(buttonVariants({variant: 'gold', size: 'fig'}))}
              >
                {copy.ctaPrimary}
              </a>
              <a
                href="#academy"
                className={cn(buttonVariants({variant: 'onDark', size: 'fig'}))}
              >
                {copy.ctaSecondary}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
