import {getLocale, getTranslations} from 'next-intl/server';
import SectionTitle from '@/components/home/SectionTitle';
import {getProductsMarketing} from '@/lib/productsMarketing';
import type {Locale} from '@/i18n/routing';
import {CFD_PRODUCTS, MIN_LOT} from '../tradingConditions';

/**
 * Tradeable products (gold / silver / RMB kilobar). Section chrome from CMS;
 * numbers from tradingConditions.ts (approved facts — never CMS). Spreads vary
 * by account type, so the card shows the lowest value ("X 點起", owner
 * 2026-10-11) and the conditions table links to /accounts for the breakdown.
 */
export default async function ProductList() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('products.list');
  const copy = (await getProductsMarketing(locale)).list;
  const items = await getTranslations('products.items');
  const cond = await getTranslations('products.conditions');

  return (
    <section id="products" className="scroll-mt-20 bg-[var(--fig-light)]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-16 px-6 py-20 sm:px-10 lg:px-[120px] lg:py-24">
        <div className="flex flex-col gap-4">
          <SectionTitle kicker={copy.kicker} heading={copy.heading} />
          {copy.subheading ? (
            <p className="max-w-[40rem] text-[15px] leading-[1.6] text-[var(--fig-text-muted)]">
              {copy.subheading}
            </p>
          ) : null}
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {CFD_PRODUCTS.map((p) => (
            <div
              key={p.key}
              id={p.key}
              className="flex scroll-mt-24 flex-col gap-6 rounded-lg border border-[var(--fig-border-light)] bg-white p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <h3 className="font-sans text-[22px] font-extrabold text-[var(--fig-heading-dark)]">
                    {items(`${p.key}.name`)}
                  </h3>
                  <span className="font-[family-name:var(--font-ticker)] text-sm font-semibold text-[var(--fig-text-muted)]">
                    {p.symbol}
                  </span>
                </div>
                <span className="rounded-[4px] bg-gold/10 px-2.5 py-1 text-xs font-bold text-gold">
                  CFD
                </span>
              </div>

              <p className="text-[15px] leading-[1.6] text-[var(--fig-text-muted)]">
                {items(`${p.key}.desc`)}
              </p>

              <dl className="mt-auto grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-[var(--fig-border-light)] bg-[var(--fig-border-light)]">
                <div className="flex flex-col gap-1 bg-white p-4">
                  <dt className="text-xs text-[var(--fig-text-muted)]">
                    {t('spreadLabel')}
                  </dt>
                  <dd className="font-[family-name:var(--font-ticker)] text-xl font-bold text-[var(--fig-heading-dark)]">
                    {cond('spreadFrom', {points: p.spreadFrom})}
                  </dd>
                </div>
                <div className="flex flex-col gap-1 bg-white p-4">
                  <dt className="text-xs text-[var(--fig-text-muted)]">
                    {t('leverageLabel')}
                  </dt>
                  <dd className="font-[family-name:var(--font-ticker)] text-2xl font-bold text-gold">
                    {p.leverage}
                  </dd>
                </div>
                <div className="flex flex-col gap-1 bg-white p-4">
                  <dt className="text-xs text-[var(--fig-text-muted)]">
                    {cond('colMinLot')}
                  </dt>
                  <dd className="font-[family-name:var(--font-ticker)] text-xl font-bold text-[var(--fig-heading-dark)]">
                    {cond('minLotValue', {value: MIN_LOT})}
                  </dd>
                </div>
                <div className="flex flex-col gap-1 bg-white p-4">
                  <dt className="text-xs text-[var(--fig-text-muted)]">
                    {cond('colFee')}
                  </dt>
                  <dd className="text-xl font-bold text-[var(--fig-heading-dark)]">
                    {cond('feeFree')}
                  </dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
