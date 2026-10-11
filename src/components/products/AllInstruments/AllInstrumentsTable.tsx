import {getLocale, getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import type {Locale} from '@/i18n/routing';
import {getInstruments, groupInstruments, type Instrument} from '@/lib/instruments';
import {CFD_PRODUCTS, MIN_LOT, TRADING_HOURS} from '../tradingConditions';

/**
 * All tradeable products table for `/products/all`.
 *
 * ✅ Governance (owner 2026-10-11): every condition in this table — contract
 * size, spread, leverage, minimum lot size, trading commission, trading hours —
 * is an APPROVED FACT read from tradingConditions.ts, so there is NO「示意數據」
 * label. The CMS `instruments` collection only controls each row's name,
 * grouping and order.
 */
export default async function AllInstrumentsTable() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('productsAll.table');
  const cats = await getTranslations('productsAll.categories');
  const cond = await getTranslations('products.conditions');
  const instruments = await getInstruments(locale);
  const groups = groupInstruments(instruments);

  const productOf = (row: Instrument) =>
    row.productKey
      ? CFD_PRODUCTS.find((p) => p.key === row.productKey)
      : undefined;

  const hours = (
    <div className="flex flex-col gap-0.5">
      <span>{cond('hoursSummer', TRADING_HOURS.summer)}</span>
      <span>{cond('hoursWinter', TRADING_HOURS.winter)}</span>
    </div>
  );

  return (
    <section id="products" className="scroll-mt-20 bg-[var(--fig-light)]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-6 py-20 sm:px-10 lg:px-[120px] lg:py-24">
        <div className="flex flex-col gap-4">
          <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-gold">
            {t('kicker')}
          </span>
          <h2 className="font-sans text-[clamp(1.8rem,4vw,2.25rem)] font-extrabold leading-[1.15] text-[var(--fig-heading-dark)]">
            {t('heading')}
          </h2>
          <p className="max-w-[46rem] text-[15px] leading-[1.6] text-[var(--fig-text-muted)]">
            {t('note')}
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
                <table className="w-full min-w-[920px] border-collapse text-left">
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
                        {cond('colMinLot')}
                      </th>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[var(--fig-text-muted)]">
                        {cond('colFee')}
                      </th>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[var(--fig-text-muted)]">
                        {t('colHours')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map((item) => {
                      const product = productOf(item);
                      const pending = (
                        <span className="text-[var(--fig-text-muted)]">
                          {cond('pending')}
                        </span>
                      );

                      return (
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
                            {product
                              ? cond(
                                  product.contractUnit === 'oz'
                                    ? 'contractSizeOz'
                                    : 'contractSizeGram',
                                  {value: product.contractSize}
                                )
                              : pending}
                          </td>
                          <td className="px-5 py-4 font-[family-name:var(--font-ticker)] text-[15px] font-semibold text-[var(--fig-heading-dark)]">
                            {product
                              ? cond('spreadFrom', {points: product.spreadFrom})
                              : pending}
                          </td>
                          <td className="px-5 py-4 font-[family-name:var(--font-ticker)] text-[15px] font-bold text-gold">
                            {product ? product.leverage : pending}
                          </td>
                          <td className="px-5 py-4 font-[family-name:var(--font-ticker)] text-[15px] text-[var(--fig-text-muted)]">
                            {product
                              ? cond('minLotValue', {value: MIN_LOT})
                              : pending}
                          </td>
                          <td className="px-5 py-4 text-[15px] text-[var(--fig-text-muted)]">
                            {product ? cond('feeFree') : pending}
                          </td>
                          <td className="px-5 py-4 text-[13px] leading-[1.5] text-[var(--fig-text-muted)]">
                            {product ? hours : pending}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}

        <div className="flex flex-col gap-4">
          <Link
            href="/accounts#spreads"
            className="self-start text-[13px] font-semibold text-gold underline-offset-4 hover:underline"
          >
            {cond('tiersLink')}
          </Link>
          <p className="max-w-[52rem] text-[13px] leading-[1.6] text-[var(--fig-text-muted)]">
            {cond('hoursNote', {
              summerFrom: TRADING_HOURS.summer.breakFrom,
              summerTo: TRADING_HOURS.summer.breakTo,
              winterFrom: TRADING_HOURS.winter.breakFrom,
              winterTo: TRADING_HOURS.winter.breakTo
            })}
          </p>
        </div>
      </div>
    </section>
  );
}
