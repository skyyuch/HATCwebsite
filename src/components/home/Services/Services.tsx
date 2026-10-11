import {getLocale, getTranslations} from 'next-intl/server';
import {Check} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/utils';
import {buttonVariants} from '@/components/ui/button';
import {getHomeMarketing} from '@/lib/homeMarketing';
import type {Locale} from '@/i18n/routing';
import SectionTitle from '../SectionTitle';
import ServiceMarketPanel from './ServiceMarketPanel';

// gold-services (Figma 4:71): light section pairing the value proposition with
// the gold chart + price cards. The market column renders real gateway data
// when the feed answers and labelled sample data until then.
const FEATURES = ['f1', 'f2', 'f3'] as const;

export default async function Services() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('home.goldServices');
  const market = await getTranslations('home.market');
  const copy = (await getHomeMarketing(locale)).services;

  return (
    <section
      id="gold-services"
      className="scroll-mt-20 bg-[var(--fig-light)]"
    >
      <div className="mx-auto flex max-w-[1440px] flex-col gap-16 px-6 py-20 sm:px-10 lg:px-[120px] lg:py-24">
        <SectionTitle kicker={copy.kicker} heading={copy.heading} />

        <div className="grid items-center gap-12 lg:grid-cols-[533fr_635fr]">
          {/* Left — value proposition */}
          <div className="flex flex-col gap-8">
            <h3 className="font-sans text-[28px] font-extrabold leading-tight text-[var(--fig-heading-dark)]">
              {copy.subheading}
            </h3>
            <p className="text-[15px] leading-[1.65] text-[var(--fig-text-muted)]">
              {copy.body}
            </p>
            <ul className="flex flex-col gap-5">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-full bg-gold/15 text-gold">
                    <Check className="size-3" aria-hidden strokeWidth={3} />
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[15px] font-bold text-[var(--fig-heading-dark)]">
                      {t(`features.${f}.title`)}
                    </span>
                    <span className="text-[13px] text-[var(--fig-text-muted)]">
                      {t(`features.${f}.sub`)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <Link
              href="/products"
              className={cn(buttonVariants({variant: 'gold', size: 'fig'}), 'w-fit')}
            >
              {copy.cta}
            </Link>
          </div>

          {/* Right — gold chart + price cards (real feed, sample fallback) */}
          <ServiceMarketPanel
            locale={locale}
            labels={{
              chartSymbol: t('chartSymbol'),
              chartDaily: t('chartDaily'),
              chartUnavailable: t('chartUnavailable'),
              sampleLabel: t('chartSample'),
              liveLabel: market('liveLabel'),
              sourceNote: market('sourceNote'),
              names: {gold: t('loco.gold'), silver: t('loco.silver')}
            }}
          />
        </div>
      </div>
    </section>
  );
}
