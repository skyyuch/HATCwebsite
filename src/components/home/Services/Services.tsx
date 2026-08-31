import {getLocale, getTranslations} from 'next-intl/server';
import {Check} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/utils';
import {buttonVariants} from '@/components/ui/button';
import {getHomeMarketing} from '@/lib/homeMarketing';
import type {Locale} from '@/i18n/routing';
import SectionTitle from '../SectionTitle';
import {SAMPLE_CANDLES, SAMPLE_PRICE_CARDS} from '../sampleMarketData';

// gold-services (Figma 4:71): light section pairing the value proposition with a
// candlestick chart mockup + price cards. Chart/prices are SAMPLE data, labelled.
const FEATURES = ['f1', 'f2', 'f3'] as const;
const GRID_LINES = [24, 60, 96, 132];
const TIME_AXIS = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

export default async function Services() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('home.goldServices');
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

          {/* Right — chart mockup + price cards (SAMPLE) */}
          <div className="flex flex-col gap-5">
            <div className="rounded-lg border border-[var(--fig-border)] bg-[var(--fig-ink)] p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">
                  {t('chartSymbol')}
                </span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-xs text-[var(--fig-up)]">
                    <span
                      aria-hidden
                      className="size-1.5 rounded-full bg-[var(--fig-up)]"
                    />
                    {t('live')}
                  </span>
                  <span className="text-[11px] text-[var(--fig-text-dim)]">
                    {t('chartSample')}
                  </span>
                </div>
              </div>

              <svg
                aria-hidden
                viewBox="0 0 300 160"
                preserveAspectRatio="none"
                className="mt-4 h-40 w-full"
              >
                {GRID_LINES.map((y) => (
                  <line
                    key={y}
                    x1="0"
                    x2="300"
                    y1={y}
                    y2={y}
                    stroke="var(--fig-border)"
                    strokeWidth="1"
                  />
                ))}
                {SAMPLE_CANDLES.map((c) => {
                  const color = c.up ? 'var(--fig-up)' : 'var(--fig-down)';
                  return (
                    <g key={c.x}>
                      <line
                        x1={c.x + 10}
                        x2={c.x + 10}
                        y1={c.wickTop}
                        y2={c.wickBottom}
                        stroke={color}
                        strokeWidth="1.5"
                      />
                      <rect
                        x={c.x}
                        y={c.bodyY}
                        width="20"
                        height={c.bodyH}
                        rx="1"
                        fill={color}
                      />
                    </g>
                  );
                })}
              </svg>

              <div className="mt-3 flex justify-between font-[family-name:var(--font-ticker)] text-[11px] text-[var(--fig-text-dim)]">
                {TIME_AXIS.map((time) => (
                  <span key={time}>{time}</span>
                ))}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {SAMPLE_PRICE_CARDS.map((card) => (
                <div
                  key={card.symbol}
                  className="rounded-lg border border-[var(--fig-border)] bg-[var(--fig-surface)] p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white">
                        {card.symbol}
                      </span>
                      <span className="text-xs text-[var(--fig-text-dim)]">
                        {t(`loco.${card.nameKey}`)}
                      </span>
                    </div>
                    <span className="rounded-[4px] bg-[rgba(16,185,129,0.1)] px-2 py-1 text-xs font-semibold text-[var(--fig-up)]">
                      {card.change}
                    </span>
                  </div>
                  <div className="mt-3 font-[family-name:var(--font-ticker)] text-[22px] font-bold text-gold">
                    {card.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
