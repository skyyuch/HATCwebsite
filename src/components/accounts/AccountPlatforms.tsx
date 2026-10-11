import {getLocale, getTranslations} from 'next-intl/server';
import SectionTitle from '@/components/home/SectionTitle';
import PlatformVisualPanel from '@/components/platforms/PlatformVisualPanel';
import {resolvePlatformVisual} from '@/components/platforms/platformVisuals';
import {getTradingPlatforms} from '@/lib/tradingPlatforms';
import type {Locale} from '@/i18n/routing';

/**
 * Supported platforms (Figma 62:235).
 *
 * Reads the same `trading-platforms` source as `/platforms` so the platform
 * list is managed in one place — which is what keeps MetaTrader 4 off the site
 * (HATC does not offer it, owner 2026-10-11).
 *
 * The card visual follows the shared precedence in `resolvePlatformVisual`:
 * CMS upload → real terminal capture → official brand mark → branded panel.
 * Generic stock device renders are deliberately never used, so a card either
 * shows HATC's own terminal, the platform's own logo, or no image at all; the
 * point-in-time caption (platforms.types.screenshotNote) appears once when any
 * capture is on screen.
 */

export default async function AccountPlatforms() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('accounts.platforms');
  const terminal = await getTranslations('platforms.types');
  const platforms = await getTradingPlatforms(locale);

  const cards = platforms.map((platform) => ({
    platform,
    visual: resolvePlatformVisual(platform)
  }));
  const hasCapture = cards.some(({visual}) => visual?.kind === 'screenshot');

  return (
    <section className="bg-white">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-14 px-6 py-20 sm:px-10 lg:px-[120px] lg:py-24">
        <SectionTitle kicker={t('kicker')} heading={t('heading')} />

        <div className="grid gap-8 md:grid-cols-3">
          {cards.map(({platform, visual}) => (
            <div
              key={platform.id}
              className="flex flex-col overflow-hidden rounded-[12px] border border-[var(--fig-border-light)] bg-[var(--fig-light)]"
            >
              <PlatformVisualPanel
                visual={visual}
                label={platform.panelLabel}
                alt={platform.name}
                className="h-[340px]"
              />
              <div className="flex flex-col gap-3 p-6">
                <h3 className="font-sans text-lg font-bold text-[var(--fig-heading-dark)]">
                  {platform.name}
                </h3>
                <p className="text-sm leading-[1.6] text-[var(--fig-text-muted)]">
                  {platform.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 text-xs leading-[1.7] text-[var(--fig-text-muted)]">
          {hasCapture ? <p>{terminal('screenshotNote')}</p> : null}
          <p>{t('note')}</p>
        </div>
      </div>
    </section>
  );
}
