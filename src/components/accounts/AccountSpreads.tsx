import {getTranslations} from 'next-intl/server';
import {
  ACCOUNT_TIERS,
  CFD_PRODUCTS
} from '@/components/products/tradingConditions';

/**
 * Spreads by account type (replaces the Figma 62:200 "live spreads" preview).
 *
 * The Figma showed a bid/ask quote table, which here could only ever be fake
 * numbers — and real bid/ask belongs to the live-quote widgets, not to a
 * statically rendered conditions page. Instead this renders the APPROVED
 * product × account-type spread matrix from `tradingConditions.ts`
 * (docs/HATC_FACTS.md, owner 2026-10-11): real facts, no「示意數據」label, and
 * strictly not CMS-editable.
 */
export default async function AccountSpreads() {
  const t = await getTranslations('accounts.spreads');
  const tiers = await getTranslations('accounts.tiers');
  const products = await getTranslations('products.items');
  const table = await getTranslations('productsAll.table');

  return (
    <section id="spreads" className="scroll-mt-20 bg-[var(--fig-light)]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-6 py-20 sm:px-10 lg:px-[120px] lg:py-24">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-gold">
            {t('kicker')}
          </span>
          <h2 className="font-sans text-[clamp(1.8rem,4vw,2.25rem)] font-extrabold leading-[1.15] text-[var(--fig-heading-dark)]">
            {t('heading')}
          </h2>
          <p className="max-w-[46rem] text-[15px] leading-[1.6] text-[var(--fig-text-muted)]">
            {t('subtitle')}
          </p>
        </div>

        <p className="text-xs text-[var(--fig-text-muted)] md:hidden">
          {table('scrollHint')}
        </p>

        <div className="overflow-x-auto rounded-[8px] border border-[var(--fig-border-light)]">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <caption className="sr-only">{t('heading')}</caption>
            <thead>
              <tr className="bg-[var(--fig-ink)] text-white">
                <th scope="col" className="px-5 py-4 text-sm font-bold">
                  {t('colProduct')}
                </th>
                {ACCOUNT_TIERS.map((tier) => (
                  <th
                    key={tier.key}
                    scope="col"
                    className="px-5 py-4 text-right text-sm font-bold"
                  >
                    {tiers(`items.${tier.key}.name`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CFD_PRODUCTS.map((product, i) => (
                <tr
                  key={product.key}
                  className={i % 2 === 0 ? 'bg-white' : 'bg-[var(--fig-light)]'}
                >
                  <th
                    scope="row"
                    className="border-b border-[var(--fig-border-light)] px-5 py-4 text-left"
                  >
                    <span className="block text-[15px] font-bold text-[var(--fig-heading-dark)]">
                      {products(`${product.key}.name`)}
                    </span>
                    <span className="block font-[family-name:var(--font-ticker)] text-xs font-semibold text-[var(--fig-text-muted)]">
                      {product.symbol}
                    </span>
                  </th>
                  {ACCOUNT_TIERS.map((tier) => (
                    <td
                      key={tier.key}
                      className="border-b border-[var(--fig-border-light)] px-5 py-4 text-right font-[family-name:var(--font-ticker)] text-sm font-bold text-gold"
                    >
                      {tier.spreads[product.key]}
                    </td>
                  ))}
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
