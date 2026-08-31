import {getTranslations} from 'next-intl/server';
import {ShieldCheck} from 'lucide-react';

/**
 * Trust strip (Figma 44:165) — light grey section with three credential cards
 * (AA member / seat 008 / fund safety) plus a partner-logo placeholder. All
 * claims trace to approved facts (docs/HATC_FACTS.md); the fund-custody card
 * reflects the owner-confirmed segregation statement. Copy from i18n
 * (trading.trust.*). The partner block is a labelled design placeholder.
 */
const CARDS = ['compliance', 'member', 'custody'] as const;

export default async function TradingTrust() {
  const t = await getTranslations('trading.trust');

  return (
    <section className="bg-[var(--trd-row-alt)] font-[family-name:var(--font-geist)]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-6 py-16 sm:px-10 lg:px-[120px]">
        <div className="grid gap-8 md:grid-cols-3">
          {CARDS.map((key) => (
            <div
              key={key}
              className="flex flex-col gap-3 rounded-[8px] border border-[var(--trd-border)] bg-white p-6"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center rounded-[4px] bg-[var(--trd-navy)] px-2 py-0.5 text-[11px] font-semibold text-white">
                  {t(`cards.${key}.badge`)}
                </span>
                <ShieldCheck
                  className="size-[18px] text-[var(--trd-gold)]"
                  aria-hidden
                />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-[var(--trd-body)]">
                  {t(`cards.${key}.label`)}
                </p>
                <p className="text-[22px] font-bold text-[var(--trd-navy)]">
                  {t(`cards.${key}.title`)}
                </p>
                <p className="text-xs leading-[1.5] text-[var(--trd-muted)]">
                  {t(`cards.${key}.desc`)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-2 rounded-[8px] border border-[var(--trd-border)] bg-white p-5 text-center text-[var(--trd-muted)]">
          <p className="text-[13px] font-semibold">{t('partner.title')}</p>
          <p className="text-[11px]">{t('partner.desc')}</p>
        </div>
      </div>
    </section>
  );
}
