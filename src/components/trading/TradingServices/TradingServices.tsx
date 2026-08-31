import {getLocale, getTranslations} from 'next-intl/server';
import {Globe, Boxes, BarChart3, Headset} from 'lucide-react';
import {getTradingMarketing} from '@/lib/tradingMarketing';
import type {Locale} from '@/i18n/routing';
import SectionHeader from '../SectionHeader';

/**
 * "黃金交易服務與工具" (Figma 44:45) — light grey section with four service
 * cards. Product names trace to approved facts. Section chrome = CMS with
 * i18n fallback; card titles/desc stay in i18n.
 */
const CARDS = [
  {key: 'londonGold', Icon: Globe},
  {key: 'kilobar', Icon: Boxes},
  {key: 'mt5', Icon: BarChart3},
  {key: 'support', Icon: Headset}
] as const;

export default async function TradingServices() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('trading.services');
  const copy = (await getTradingMarketing(locale)).services;

  return (
    <section
      id="services"
      className="scroll-mt-20 bg-[var(--trd-row-alt)] font-[family-name:var(--font-geist)]"
    >
      <div className="mx-auto flex max-w-[1440px] flex-col gap-12 px-6 py-16 sm:px-10 lg:px-[120px] lg:py-20">
        <SectionHeader
          badge={copy.badge}
          heading={copy.heading}
          subtitle={copy.subtitle}
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map(({key, Icon}) => (
            <div
              key={key}
              className="flex flex-col items-start gap-5 rounded-[12px] border border-[var(--trd-border)] bg-white p-8"
            >
              <span className="grid size-12 place-items-center rounded-[24px] border border-[var(--trd-cream-border)] bg-[var(--trd-cream)] text-[var(--trd-gold)]">
                <Icon className="size-[22px]" aria-hidden />
              </span>
              <div className="flex flex-col gap-2">
                <h3 className="text-[18px] font-bold text-[var(--trd-navy)]">
                  {t(`items.${key}.title`)}
                </h3>
                <p className="text-sm leading-[1.5] text-[var(--trd-body)]">
                  {t(`items.${key}.desc`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
