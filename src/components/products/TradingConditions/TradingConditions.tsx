import {getLocale, getTranslations} from 'next-intl/server';
import SectionTitle from '@/components/home/SectionTitle';
import {Link} from '@/i18n/navigation';
import {getProductsMarketing} from '@/lib/productsMarketing';
import type {Locale} from '@/i18n/routing';
import {CFD_PRODUCTS, TRADING_HOURS} from '../tradingConditions';

/**
 * Trading conditions table. Section chrome from CMS; APPROVED numbers only from
 * tradingConditions.ts (the CMS must never be able to override them). The
 * spread column shows the lowest tier value and links to /accounts for the
 * per-account-type breakdown.
 */
export default async function TradingConditions() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('products.conditions');
  const copy = (await getProductsMarketing(locale)).conditions;
  const items = await getTranslations('products.items');
  const table = await getTranslations('productsAll.table');

  return (
    <section id="conditions" className="scroll-mt-20 bg-[var(--fig-ink)]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-12 px-6 py-20 sm:px-10 lg:px-[120px] lg:py-24">
        <SectionTitle kicker={copy.kicker} heading={copy.heading} tone="dark" />

        <div className="overflow-x-auto rounded-lg border border-[var(--fig-border)]">
          <table className="w-full min-w-[700px] border-collapse text-left">
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
                  {table('colContractSize')}
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
                  <td className="px-5 py-4 text-[var(--fig-text-dim)]">
                    {t(
                      p.contractUnit === 'oz'
                        ? 'contractSizeOz'
                        : 'contractSizeGram',
                      {value: p.contractSize}
                    )}
                  </td>
                  <td className="px-5 py-4 font-semibold">
                    {t('spreadFrom', {points: p.spreadFrom})}
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
                  colSpan={5}
                  className="px-5 py-4 font-sans text-[13px] font-normal text-[var(--fig-text-dim)]"
                >
                  {table('colHours')}
                </th>
                <td className="px-5 py-4 text-[13px] text-[var(--fig-text-dim)]">
                  <span className="flex flex-col gap-0.5">
                    <span>{t('hoursSummer', TRADING_HOURS.summer)}</span>
                    <span>{t('hoursWinter', TRADING_HOURS.winter)}</span>
                  </span>
                </td>
              </tr>
              <tr className="border-t border-[var(--fig-border)]">
                <th
                  scope="row"
                  colSpan={5}
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

        <div className="flex flex-col gap-4">
          <Link
            href="/accounts#spreads"
            className="self-start text-[13px] font-semibold text-gold underline-offset-4 hover:underline"
          >
            {t('tiersLink')}
          </Link>
          <p className="max-w-[52rem] text-[13px] leading-[1.6] text-[var(--fig-text-dim)]">
            {t('hoursNote', {
              summerFrom: TRADING_HOURS.summer.breakFrom,
              summerTo: TRADING_HOURS.summer.breakTo,
              winterFrom: TRADING_HOURS.winter.breakFrom,
              winterTo: TRADING_HOURS.winter.breakTo
            })}
          </p>
          <p className="max-w-[52rem] text-[13px] leading-[1.6] text-[var(--fig-text-dim)]">
            {t('note')}
          </p>
        </div>
      </div>
    </section>
  );
}
