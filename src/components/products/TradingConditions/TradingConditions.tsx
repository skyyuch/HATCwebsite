import {getLocale, getTranslations} from 'next-intl/server';
import SectionTitle from '@/components/home/SectionTitle';
import {getProductsMarketing} from '@/lib/productsMarketing';
import type {Locale} from '@/i18n/routing';
import {CFD_PRODUCTS} from '../tradingConditions';

/**
 * Trading conditions table. Section chrome from CMS; APPROVED numbers only from
 * tradingConditions.ts (CMS must never override gold27/silver30/1:100).
 */
export default async function TradingConditions() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('products.conditions');
  const copy = (await getProductsMarketing(locale)).conditions;
  const items = await getTranslations('products.items');

  return (
    <section id="conditions" className="scroll-mt-20 bg-[var(--fig-ink)]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-12 px-6 py-20 sm:px-10 lg:px-[120px] lg:py-24">
        <SectionTitle kicker={copy.kicker} heading={copy.heading} tone="dark" />

        <div className="overflow-x-auto rounded-lg border border-[var(--fig-border)]">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <caption className="sr-only">{copy.heading}</caption>
            <thead>
              <tr className="bg-[var(--fig-surface)] text-[13px] uppercase tracking-[0.08em] text-[var(--fig-text-dim)]">
                <th scope="col" className="px-5 py-4 font-semibold">
                  {t('colProduct')}
                </th>
                <th scope="col" className="px-5 py-4 font-semibold">
                  {t('colSymbol')}
                </th>
                <th scope="col" className="px-5 py-4 font-semibold">
                  {t('colSpread')}
                </th>
                <th scope="col" className="px-5 py-4 font-semibold">
                  {t('colLeverage')}
                </th>
                <th scope="col" className="px-5 py-4 font-semibold">
                  {t('colPlatform')}
                </th>
              </tr>
            </thead>
            <tbody className="font-[family-name:var(--font-ticker)] text-[15px] text-white">
              {CFD_PRODUCTS.map((p) => (
                <tr
                  key={p.key}
                  className="border-t border-[var(--fig-border)]"
                >
                  <th
                    scope="row"
                    className="px-5 py-4 font-sans font-bold text-white"
                  >
                    {items(`${p.key}.name`)}
                  </th>
                  <td className="px-5 py-4 text-[var(--fig-text-dim)]">
                    {p.symbol}
                  </td>
                  <td className="px-5 py-4 font-semibold">
                    {p.spread} {t('pointsUnit')}
                  </td>
                  <td className="px-5 py-4 font-semibold text-gold">
                    {p.leverage}
                  </td>
                  <td className="px-5 py-4 text-[var(--fig-text-dim)]">
                    {t('platformValue')}
                  </td>
                </tr>
              ))}
              <tr className="border-t border-[var(--fig-border)]">
                <th
                  scope="row"
                  colSpan={4}
                  className="px-5 py-4 font-sans text-[13px] font-normal text-[var(--fig-text-dim)]"
                >
                  {t('pendingLabel')}
                </th>
                <td className="px-5 py-4 text-[13px] text-[var(--fig-text-dim)]">
                  {t('pending')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="max-w-[52rem] text-[13px] leading-[1.6] text-[var(--fig-text-dim)]">
          {t('note')}
        </p>
      </div>
    </section>
  );
}
