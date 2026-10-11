import {getLocale, getTranslations} from 'next-intl/server';
import Image from 'next/image';
import SectionTitle from '@/components/home/SectionTitle';
import {resolveTerminalVisual} from '@/components/platforms/terminalScreenshots';
import {getTradingPlatforms} from '@/lib/tradingPlatforms';
import type {Locale} from '@/i18n/routing';

/**
 * Supported platforms (Figma 62:235).
 *
 * Reads the same `trading-platforms` source as `/platforms` so the platform
 * list is managed in one place — which is what keeps MetaTrader 4 off the site
 * (HATC does not offer it, owner 2026-10-11).
 *
 * The card visual follows the shared precedence in `resolveTerminalVisual`:
 * CMS upload → real terminal capture → branded gradient panel. The Figma's
 * generic device renders are deliberately NOT used here, so a card either
 * shows HATC's own terminal or no image at all; the point-in-time caption
 * (platforms.types.screenshotNote) appears once when any capture is on screen.
 */

export default async function AccountPlatforms() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('accounts.platforms');
  const terminal = await getTranslations('platforms.types');
  const platforms = await getTradingPlatforms(locale);

  const cards = platforms.map((platform) => ({
    platform,
    visual: resolveTerminalVisual(platform, locale)
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
              <div
                className="relative flex h-[260px] items-center justify-center overflow-hidden"
                style={{
                  background:
                    'radial-gradient(120% 120% at 20% 0%, rgba(212,175,55,0.22), transparent 55%), linear-gradient(140deg, #0b1020 0%, #070a14 100%)'
                }}
              >
                {visual ? (
                  // Portrait captures: anchor to the top so the instrument and
                  // price stay visible, then fade the cropped edge into the
                  // card body instead of cutting the chart off mid-candle.
                  <>
                    <Image
                      src={visual.src}
                      alt={platform.name}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover object-top"
                    />
                    <span
                      aria-hidden
                      className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-[var(--fig-light)]"
                    />
                  </>
                ) : (
                  <span
                    aria-hidden
                    className="font-[family-name:var(--font-ticker)] text-2xl font-bold tracking-wide text-gold/90"
                  >
                    {platform.panelLabel}
                  </span>
                )}
              </div>
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
