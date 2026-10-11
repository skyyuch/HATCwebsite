import {getLocale, getTranslations} from 'next-intl/server';
import SectionTitle from '@/components/home/SectionTitle';
import {getTradingPlatforms} from '@/lib/tradingPlatforms';
import type {Locale} from '@/i18n/routing';

/**
 * Supported platforms (Figma 62:235).
 *
 * Reads the same `trading-platforms` source as `/platforms` so the platform
 * list is managed in one place — which is what keeps MetaTrader 4 off the site
 * (HATC does not offer it, owner 2026-10-11). The Figma shows platform
 * screenshots; per the red line against fake imagery we render a branded
 * gradient panel until the owner supplies real ones.
 */

export default async function AccountPlatforms() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('accounts.platforms');
  const items = await getTradingPlatforms(locale);

  return (
    <section className="bg-white">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-14 px-6 py-20 sm:px-10 lg:px-[120px] lg:py-24">
        <SectionTitle kicker={t('kicker')} heading={t('heading')} />

        <div className="grid gap-8 md:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col overflow-hidden rounded-[12px] border border-[var(--fig-border-light)] bg-[var(--fig-light)]"
            >
              <div
                aria-hidden
                className="flex h-[200px] items-center justify-center"
                style={{
                  background:
                    'radial-gradient(120% 120% at 20% 0%, rgba(212,175,55,0.22), transparent 55%), linear-gradient(140deg, #0b1020 0%, #070a14 100%)'
                }}
              >
                <span className="font-[family-name:var(--font-ticker)] text-2xl font-bold tracking-wide text-gold/90">
                  {item.panelLabel}
                </span>
              </div>
              <div className="flex flex-col gap-3 p-6">
                <h3 className="font-sans text-lg font-bold text-[var(--fig-heading-dark)]">
                  {item.name}
                </h3>
                <p className="text-sm leading-[1.6] text-[var(--fig-text-muted)]">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs leading-[1.7] text-[var(--fig-text-muted)]">
          {t('note')}
        </p>
      </div>
    </section>
  );
}
