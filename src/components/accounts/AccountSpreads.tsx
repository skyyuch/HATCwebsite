import {getLocale, getTranslations} from 'next-intl/server';
import {getAccountSpreads} from '@/lib/accountSpreads';
import type {Locale} from '@/i18n/routing';

/**
 * Popular-product spreads preview (Figma 62:200). Trimmed to the approved
 * products only (gold / silver). Rows come from the CMS (`account-spreads`
 * collection) with an i18n SAMPLE fallback (`accounts.spreadsSample`). Every
 * quote and spread is SAMPLE「示意數據」, not a live feed and NOT an approved
 * fact — approved average spreads (gold 27 / silver 30) live on /products via
 * tradingConditions.ts.
 */

export default async function AccountSpreads() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('accounts.spreads');
  const sampleLabel = await getTranslations('productsAll.table');
  const rows = await getAccountSpreads(locale);

  return (
    <section className="bg-[var(--fig-light)]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-6 py-20 sm:px-10 lg:px-[120px] lg:py-24">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-gold">
            {t('kicker')}
          </span>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <h2 className="font-sans text-[clamp(1.8rem,4vw,2.25rem)] font-extrabold leading-[1.15] text-[var(--fig-heading-dark)]">
              {t('heading')}
            </h2>
            <span className="rounded-[4px] bg-gold/10 px-2.5 py-1 text-xs font-bold text-gold">
              {sampleLabel('sampleLabel')}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-[8px] border border-[var(--fig-border-light)]">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="bg-[var(--fig-ink)] text-white">
                <th className="px-5 py-4 text-sm font-bold">{t('colPair')}</th>
                <th className="px-5 py-4 text-sm font-bold">{t('colBid')}</th>
                <th className="px-5 py-4 text-sm font-bold">{t('colAsk')}</th>
                <th className="px-5 py-4 text-right text-sm font-bold">
                  {t('colSpread')}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.id}
                  className={i % 2 === 0 ? 'bg-white' : 'bg-[var(--fig-light)]'}
                >
                  <td className="border-b border-[var(--fig-border-light)] px-5 py-4 text-[15px] font-bold text-[var(--fig-heading-dark)]">
                    {row.pair}
                  </td>
                  <td className="border-b border-[var(--fig-border-light)] px-5 py-4 font-[family-name:var(--font-ticker)] text-sm text-[var(--fig-text-muted)]">
                    {row.bid}
                  </td>
                  <td className="border-b border-[var(--fig-border-light)] px-5 py-4 font-[family-name:var(--font-ticker)] text-sm text-[var(--fig-text-muted)]">
                    {row.ask}
                  </td>
                  <td className="border-b border-[var(--fig-border-light)] px-5 py-4 text-right font-[family-name:var(--font-ticker)] text-sm font-bold text-gold">
                    {row.spread}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs leading-[1.7] text-[var(--fig-text-muted)]">
          {t('note')}
        </p>
      </div>
    </section>
  );
}
