import {getLocale, getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/utils';
import {buttonVariants} from '@/components/ui/button';
import {
  ACCOUNT_TIERS,
  CFD_PRODUCTS,
  MIN_LOT
} from '@/components/products/tradingConditions';
import {getTradingMarketing} from '@/lib/tradingMarketing';
import type {Locale} from '@/i18n/routing';
import SectionHeader from '../SectionHeader';

/**
 * "交易帳戶比較" — the APPROVED four account types (docs/HATC_FACTS.md →
 * "Account types & trading conditions", owner 2026-10-11), rendered in the
 * light --trd-* system of this page.
 *
 * ✅ Figures come from `tradingConditions.ts`, the same source as /accounts, so
 *    there is NO「示意數據」label and nothing here is CMS-editable — only the
 *    section chrome (badge/heading/subtitle) comes from the trading-page global.
 * ⚠️ The retired sample two-tier table (標準 Standard / 專業 Professional with
 *    「待確認」cells) clashed with the real Standard/Pro tiers: same names,
 *    different numbers. It must not come back, nor may the fabricated service
 *    rows it carried (priority support / education / dedicated manager) or the
 *    「推薦」badge — none of those are owner-confirmed. The only badges allowed
 *    are the fact-derived lowest-deposit / lowest-spread ones.
 */
export default async function AccountComparison() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('trading.accounts');
  const tiers = await getTranslations('accounts.tiers');
  const conditions = await getTranslations('products.conditions');
  const products = await getTranslations('products.items');
  const table = await getTranslations('productsAll.table');
  const copy = (await getTradingMarketing(locale)).accounts;

  /** VIP: highlighted because it holds the lowest spreads, not as a sales pick. */
  const featured = 'vip';
  const featuredCell =
    'bg-[var(--trd-cream)] border-x border-[var(--trd-cream-border)]';

  return (
    <section className="bg-white font-[family-name:var(--font-geist)]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-6 py-16 sm:px-10 lg:px-[120px] lg:py-20">
        <SectionHeader
          badge={copy.badge}
          heading={copy.heading}
          subtitle={copy.subtitle}
        />

        <p className="text-xs text-[var(--trd-muted)] lg:hidden">
          {table('scrollHint')}
        </p>

        <div className="overflow-x-auto rounded-[12px] border border-[var(--trd-border)]">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <caption className="sr-only">{copy.heading}</caption>
            <thead>
              <tr className="bg-[var(--trd-row-alt)]">
                <th
                  scope="col"
                  className="w-[180px] px-5 py-6 text-[15px] font-semibold text-[var(--trd-body)] sm:w-[240px] sm:px-6"
                >
                  {t('colSpec')}
                </th>
                {ACCOUNT_TIERS.map((tier) => (
                  <th
                    key={tier.key}
                    scope="col"
                    className={cn(
                      'px-5 py-5 text-center align-top',
                      tier.key === featured && featuredCell
                    )}
                  >
                    <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--trd-gold)]">
                      {tier.code}
                    </span>
                    <span
                      className={cn(
                        'block text-[18px] font-bold',
                        tier.key === featured
                          ? 'text-[var(--trd-navy)]'
                          : 'text-[var(--trd-heading)]'
                      )}
                    >
                      {tiers(`items.${tier.key}.name`)}
                    </span>
                    <span className="mt-2 block min-h-[20px]">
                      {tier.badge ? (
                        <span className="inline-flex items-center rounded-[4px] bg-[var(--trd-navy)] px-2 py-0.5 text-[11px] font-semibold text-white">
                          {tiers(`badges.${tier.badge}`)}
                        </span>
                      ) : null}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <Row
                label={tiers('specLabels.minDeposit')}
                featured={featured}
                featuredCell={featuredCell}
                values={ACCOUNT_TIERS.map((tier) => ({
                  key: tier.key,
                  value: tiers('minDepositValue', {amount: tier.minDepositUsd})
                }))}
              />
              <Row
                label={tiers('specLabels.leverage')}
                zebra
                featured={featured}
                featuredCell={featuredCell}
                values={ACCOUNT_TIERS.map((tier) => ({
                  key: tier.key,
                  value: tier.leverage
                }))}
              />
              <Row
                label={tiers('specLabels.platform')}
                featured={featured}
                featuredCell={featuredCell}
                values={ACCOUNT_TIERS.map((tier) => ({
                  key: tier.key,
                  value: conditions('platformValue')
                }))}
              />
              <Row
                label={conditions('colMinLot')}
                zebra
                featured={featured}
                featuredCell={featuredCell}
                values={ACCOUNT_TIERS.map((tier) => ({
                  key: tier.key,
                  value: conditions('minLotValue', {value: MIN_LOT})
                }))}
              />
              <Row
                label={conditions('colFee')}
                featured={featured}
                featuredCell={featuredCell}
                values={ACCOUNT_TIERS.map((tier) => ({
                  key: tier.key,
                  value: conditions('feeFree')
                }))}
              />

              {/* Spreads: one row per product, grouped under a single unit header. */}
              <tr className="border-t border-[var(--trd-border)] bg-[var(--trd-navy)]">
                <th
                  scope="colgroup"
                  colSpan={ACCOUNT_TIERS.length + 1}
                  className="px-5 py-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-white"
                >
                  {tiers('spreadsLabel')}
                </th>
              </tr>
              {CFD_PRODUCTS.map((product, i) => (
                <Row
                  key={product.key}
                  label={products(`${product.key}.name`)}
                  sublabel={product.symbol}
                  zebra={i % 2 === 1}
                  highlightValue
                  featured={featured}
                  featuredCell={featuredCell}
                  values={ACCOUNT_TIERS.map((tier) => ({
                    key: tier.key,
                    value: String(tier.spreads[product.key])
                  }))}
                />
              ))}

              {/* Owner-pending conditions are never invented. */}
              <Row
                label={conditions('pendingLabel')}
                featured={featured}
                featuredCell={featuredCell}
                muted
                values={ACCOUNT_TIERS.map((tier) => ({
                  key: tier.key,
                  value: conditions('pending')
                }))}
              />
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4">
          <Link
            href="/accounts"
            className={cn(
              buttonVariants({size: 'fig'}),
              'self-start border-[1.5px] border-[var(--trd-navy)] bg-transparent text-[var(--trd-navy)] hover:bg-[var(--trd-navy)]/5 max-sm:w-full'
            )}
          >
            {t('cta')}
          </Link>
          <p className="text-xs leading-[1.7] text-[var(--trd-muted)]">
            {tiers('note')}
          </p>
        </div>
      </div>
    </section>
  );
}

function Row({
  label,
  sublabel,
  values,
  featured,
  featuredCell,
  zebra = false,
  muted = false,
  highlightValue = false
}: {
  label: string;
  sublabel?: string;
  values: Array<{key: string; value: string}>;
  featured: string;
  featuredCell: string;
  zebra?: boolean;
  muted?: boolean;
  highlightValue?: boolean;
}) {
  return (
    <tr
      className={cn(
        'border-t border-[var(--trd-border)]',
        zebra && 'bg-[var(--trd-row-alt)]'
      )}
    >
      <th
        scope="row"
        className="w-[180px] px-5 py-4 text-sm font-semibold text-[var(--trd-heading)] sm:w-[240px]"
      >
        {label}
        {sublabel ? (
          <span className="mt-0.5 block font-[family-name:var(--font-geist)] text-xs font-normal text-[var(--trd-muted)]">
            {sublabel}
          </span>
        ) : null}
      </th>
      {values.map((cell) => (
        <td
          key={cell.key}
          className={cn(
            'px-5 py-4 text-center text-sm',
            cell.key === featured && featuredCell,
            muted
              ? 'text-[var(--trd-muted)]'
              : highlightValue
                ? 'font-bold text-[var(--trd-gold)]'
                : 'font-medium text-[var(--trd-heading)]'
          )}
        >
          {cell.value}
        </td>
      ))}
    </tr>
  );
}
