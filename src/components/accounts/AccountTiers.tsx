import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/utils';
import {buttonVariants} from '@/components/ui/button';
import {getSiteSettings, openAccountHref} from '@/lib/siteSettings';
import {
  ACCOUNT_TIERS,
  CFD_PRODUCTS,
  MIN_LOT
} from '@/components/products/tradingConditions';

/**
 * Account-type comparison cards (Figma 62:37).
 *
 * ✅ Every figure comes from `tradingConditions.ts` = APPROVED facts
 *    (docs/HATC_FACTS.md → "Account types & trading conditions", owner
 *    2026-10-11), so this section carries NO「示意數據」label and the numbers are
 *    deliberately NOT CMS-editable. Only the surrounding copy is translatable.
 * ⚠️ The retired sample tiers (Standard STP / RAW ECN / cent account, 1:500,
 *    1:1000, per-lot commissions) must never come back.
 */
export default async function AccountTiers() {
  const t = await getTranslations('accounts.tiers');
  const nav = await getTranslations('nav');
  const conditions = await getTranslations('products.conditions');
  const settings = await getSiteSettings();
  const openHref = openAccountHref(settings);

  return (
    <section id="tiers" className="scroll-mt-20 bg-[var(--fig-light)]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-12 px-6 py-20 sm:px-10 lg:px-[120px] lg:py-24">
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

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {ACCOUNT_TIERS.map((tier) => (
            <div
              key={tier.key}
              className={cn(
                'flex flex-col gap-6 rounded-[12px] bg-white p-8',
                tier.badge === 'lowestSpread'
                  ? 'border-2 border-gold shadow-[0_8px_24px_rgba(212,175,55,0.16)]'
                  : 'border border-[var(--fig-border-light)] shadow-[0_8px_24px_rgba(0,0,0,0.03)]'
              )}
            >
              <div className="flex flex-col gap-3">
                <div className="flex min-h-[26px] items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-gold">
                    {tier.code}
                  </span>
                  {tier.badge ? (
                    <span
                      className={cn(
                        'rounded-[4px] px-2 py-1 text-[10px] font-bold',
                        tier.badge === 'lowestSpread'
                          ? 'bg-gold text-[#070a14]'
                          : 'bg-[var(--fig-light)] text-[var(--fig-text-muted)]'
                      )}
                    >
                      {t(`badges.${tier.badge}`)}
                    </span>
                  ) : null}
                </div>
                <h3 className="font-sans text-xl font-extrabold text-[var(--fig-heading-dark)]">
                  {t(`items.${tier.key}.name`)}
                </h3>
                <p className="text-sm leading-[1.6] text-[var(--fig-text-muted)]">
                  {t(`items.${tier.key}.desc`)}
                </p>
              </div>

              <div className="h-px w-full bg-[var(--fig-border-light)]" />

              <dl className="flex flex-col gap-4 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-[var(--fig-text-muted)]">
                    {t('specLabels.minDeposit')}
                  </dt>
                  <dd className="text-right font-bold text-[var(--fig-heading-dark)]">
                    {t('minDepositValue', {amount: tier.minDepositUsd})}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-[var(--fig-text-muted)]">
                    {t('specLabels.leverage')}
                  </dt>
                  <dd className="text-right font-bold text-[var(--fig-heading-dark)]">
                    {tier.leverage}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-[var(--fig-text-muted)]">
                    {t('specLabels.platform')}
                  </dt>
                  <dd className="text-right font-bold text-[var(--fig-heading-dark)]">
                    {conditions('platformValue')}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-[var(--fig-text-muted)]">
                    {conditions('colMinLot')}
                  </dt>
                  <dd className="text-right font-bold text-[var(--fig-heading-dark)]">
                    {conditions('minLotValue', {value: MIN_LOT})}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-[var(--fig-text-muted)]">
                    {conditions('colFee')}
                  </dt>
                  <dd className="text-right font-bold text-[var(--fig-heading-dark)]">
                    {conditions('feeFree')}
                  </dd>
                </div>
              </dl>

              <div className="flex flex-col gap-3 rounded-[8px] bg-[var(--fig-light)] p-4">
                <span className="text-xs font-bold text-[var(--fig-text-muted)]">
                  {t('spreadsLabel')}
                </span>
                <dl className="flex flex-col gap-2 text-sm">
                  {CFD_PRODUCTS.map((product) => (
                    <div
                      key={product.key}
                      className="flex items-baseline justify-between gap-3"
                    >
                      <dt className="font-[family-name:var(--font-ticker)] text-[var(--fig-text-muted)]">
                        {product.symbol}
                      </dt>
                      <dd className="font-[family-name:var(--font-ticker)] font-bold text-gold">
                        {tier.spreads[product.key]}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              {openHref ? (
                <a
                  href={openHref}
                  className={cn(
                    buttonVariants({variant: 'gold', size: 'fig'}),
                    'mt-auto w-full'
                  )}
                >
                  {nav('openAccount')}
                </a>
              ) : (
                <Link
                  href="/register"
                  className={cn(
                    buttonVariants({variant: 'gold', size: 'fig'}),
                    'mt-auto w-full'
                  )}
                >
                  {nav('openAccount')}
                </Link>
              )}
            </div>
          ))}
        </div>

        <p className="text-xs leading-[1.7] text-[var(--fig-text-muted)]">
          {t('note')}
        </p>
      </div>
    </section>
  );
}
