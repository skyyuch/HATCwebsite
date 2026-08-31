import {getLocale, getTranslations} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import {getInstruments, groupInstruments} from '@/lib/instruments';

/**
 * All tradeable products table for `/products/all`. Rows come from the CMS
 * (`instruments` collection) with an i18n SAMPLE fallback.
 *
 * ⚠️ Governance: contract size / spread / leverage / hours are illustrative,
 * hence the「示意數據」badge + note. Approved figures live in tradingConditions.ts.
 */
export default async function AllInstrumentsTable() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('productsAll.table');
  const cats = await getTranslations('productsAll.categories');
  const instruments = await getInstruments(locale);
  const groups = groupInstruments(instruments);

  return (
    <section id="products" className="scroll-mt-20 bg-[var(--fig-light)]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-6 py-20 sm:px-10 lg:px-[120px] lg:py-24">
        <div className="flex flex-col gap-4">
          <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-gold">
            {t('kicker')}
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-sans text-[clamp(1.8rem,4vw,2.25rem)] font-extrabold leading-[1.15] text-[var(--fig-heading-dark)]">
              {t('heading')}
            </h2>
            <span className="rounded-[4px] bg-gold/10 px-2.5 py-1 text-xs font-bold text-gold">
              {t('sampleLabel')}
            </span>
          </div>
          <p className="max-w-[46rem] text-[15px] leading-[1.6] text-[var(--fig-text-muted)]">
            {t('sampleNote')}
          </p>
        </div>

        {groups.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[var(--fig-border-light)] bg-white p-10 text-center text-[15px] text-[var(--fig-text-muted)]">
            {t('empty')}
          </p>
        ) : (
          groups.map((group) => (
            <div key={group.category} className="flex flex-col gap-4">
              <h3 className="font-sans text-lg font-bold text-[var(--fig-heading-dark)]">
                {cats(group.category)}
              </h3>

              <p className="text-xs text-[var(--fig-text-muted)] md:hidden">
                {t('scrollHint')}
              </p>

              <div className="overflow-x-auto rounded-lg border border-[var(--fig-border-light)] bg-white">
                <table className="w-full min-w-[720px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[var(--fig-border-light)] bg-[var(--fig-light)]">
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[var(--fig-text-muted)]">
                        {t('colProduct')}
                      </th>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[var(--fig-text-muted)]">
                        {t('colContractSize')}
                      </th>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[var(--fig-text-muted)]">
                        {t('colSpread')}
                      </th>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[var(--fig-text-muted)]">
                        {t('colLeverage')}
                      </th>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[var(--fig-text-muted)]">
                        {t('colHours')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-[var(--fig-border-light)] last:border-b-0 transition-colors hover:bg-[var(--fig-light)]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[15px] font-bold text-[var(--fig-heading-dark)]">
                              {item.name}
                            </span>
                            <span className="font-[family-name:var(--font-ticker)] text-xs font-semibold text-[var(--fig-text-muted)]">
                              {item.symbol}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[15px] text-[var(--fig-text-muted)]">
                          {item.contractSize || '—'}
                        </td>
                        <td className="px-5 py-4 font-[family-name:var(--font-ticker)] text-[15px] font-semibold text-[var(--fig-heading-dark)]">
                          {item.spread || '—'}
                        </td>
                        <td className="px-5 py-4 font-[family-name:var(--font-ticker)] text-[15px] font-bold text-gold">
                          {item.leverage || '—'}
                        </td>
                        <td className="px-5 py-4 text-[15px] text-[var(--fig-text-muted)]">
                          {item.tradingHours || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
