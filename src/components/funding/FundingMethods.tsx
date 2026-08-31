import {getLocale, getTranslations} from 'next-intl/server';
import {getFundingMarketing} from '@/lib/fundingMarketing';
import {getFundingMethods} from '@/lib/fundingMethods';
import type {Locale} from '@/i18n/routing';

/**
 * Supported deposit / withdrawal channels & timelines (Figma deposit 75:42 /
 * withdrawal 75:226). Light section, a responsive table. `variant` selects the
 * direction. Rows come from the CMS (`funding-methods`, filtered by `type`) with
 * an i18n SAMPLE fallback (`funding.{deposit,withdraw}.methodsSample`). Every
 * channel, time, fee and currency is SAMPLE「示意數據」— NOT an approved fact or a
 * delivery guarantee.
 */
type Variant = 'deposit' | 'withdraw';

export default async function FundingMethods({variant}: {variant: Variant}) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('funding.methods');
  const sampleLabel = await getTranslations('productsAll.table');
  const marketing = await getFundingMarketing(locale);
  const copy = marketing[variant];
  const rows = await getFundingMethods(
    locale,
    variant === 'deposit' ? 'deposit' : 'withdrawal'
  );

  return (
    <section className="bg-white">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-6 py-20 sm:px-10 lg:px-[120px] lg:py-24">
        <div className="flex flex-col gap-3">
          <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-gold">
            {copy.kicker}
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-sans text-[clamp(1.6rem,3.5vw,2rem)] font-extrabold leading-[1.15] text-[var(--fig-heading-dark)]">
              {copy.heading}
            </h2>
            <span className="rounded-[4px] bg-gold/10 px-2.5 py-1 text-xs font-bold text-gold">
              {sampleLabel('sampleLabel')}
            </span>
          </div>
        </div>

        <p className="text-sm text-[var(--fig-text-muted)] lg:hidden">
          {t('scrollHint')}
        </p>

        <div className="overflow-x-auto rounded-[12px] border border-[var(--fig-border-light)]">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="bg-[var(--fig-ink)] text-white">
                <th className="px-5 py-4 text-sm font-bold">{t('colMethod')}</th>
                <th className="px-5 py-4 text-sm font-bold">{t('colTime')}</th>
                <th className="px-5 py-4 text-sm font-bold">{t('colFee')}</th>
                <th className="px-5 py-4 text-sm font-bold">
                  {t('colCurrencies')}
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
                    {row.method}
                  </td>
                  <td className="border-b border-[var(--fig-border-light)] px-5 py-4 text-sm text-[var(--fig-text-muted)]">
                    {row.time}
                  </td>
                  <td
                    className={`border-b border-[var(--fig-border-light)] px-5 py-4 text-sm font-bold ${
                      row.free
                        ? 'text-[var(--fig-up)]'
                        : 'text-[var(--fig-text-muted)]'
                    }`}
                  >
                    {row.fee}
                  </td>
                  <td className="border-b border-[var(--fig-border-light)] px-5 py-4 text-sm text-[var(--fig-text-muted)]">
                    {row.currencies}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs leading-[1.7] text-[var(--fig-text-muted)]">
          {copy.note}
        </p>
      </div>
    </section>
  );
}
