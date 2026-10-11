import {getLocale, getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/utils';
import {buttonVariants} from '@/components/ui/button';
import LiveQuotesProvider from '@/components/market/LiveQuotesProvider';
import {CFD_PRODUCTS} from '@/components/products/tradingConditions';
import {getTradingMarketing} from '@/lib/tradingMarketing';
import type {Locale} from '@/i18n/routing';
import SectionHeader from '../SectionHeader';
import ConditionsTable, {type ConditionRow} from './ConditionsTable';

/**
 * Product conditions with live MT5 prices (owner 2026-10-11).
 *
 * ✅ Spread / leverage / platform are APPROVED facts from
 *    `tradingConditions.ts`; prices come from the same gateway BFF as the
 *    homepage (`/api/market/quotes`) and are labelled 「即時報價」.
 * ⚠️ The retired version of this section showed placeholder bid/ask rows
 *    (2,342.80 …) including a non-existent XAU/HKD「公斤條港幣」line. Fake
 *    quotes must not come back: when the feed is unavailable the table simply
 *    drops its price columns and shows the approved conditions only.
 *    Bid/ask are deliberately not displayed either — "ask − bid" would
 *    contradict the per-account-type spreads above.
 */
export default async function PricingConditions() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('trading.pricing');
  const conditions = await getTranslations('products.conditions');
  const products = await getTranslations('products.items');
  const market = await getTranslations('home.market');
  const table = await getTranslations('productsAll.table');
  const copy = (await getTradingMarketing(locale)).pricing;

  const rows: ConditionRow[] = CFD_PRODUCTS.map((product) => ({
    key: product.key,
    name: products(`${product.key}.name`),
    symbol: product.symbol,
    gatewaySymbol: product.gatewaySymbol,
    spread: conditions('spreadFrom', {points: product.spreadFrom}),
    leverage: product.leverage,
    platform: conditions('platformValue')
  }));

  return (
    <section
      id="pricing"
      className="scroll-mt-20 bg-white font-[family-name:var(--font-geist)]"
    >
      <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-6 py-16 sm:px-10 lg:px-[120px] lg:py-20">
        <SectionHeader
          badge={copy.badge}
          heading={copy.heading}
          subtitle={copy.subtitle}
        />

        <p className="-mb-4 text-xs text-[var(--trd-muted)] lg:hidden">
          {table('scrollHint')}
        </p>

        <LiveQuotesProvider>
          <ConditionsTable
            rows={rows}
            labels={{
              product: conditions('colProduct'),
              price: t('cols.price'),
              change: t('cols.change'),
              spread: conditions('colSpread'),
              leverage: conditions('colLeverage'),
              platform: conditions('colPlatform'),
              liveLabel: market('liveLabel'),
              sourceNote: market('sourceNote')
            }}
          />
        </LiveQuotesProvider>

        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="max-w-[640px] text-xs leading-[1.7] text-[var(--trd-muted)]">
            {conditions('note')}
          </p>
          <Link
            href="/products#conditions"
            className={cn(
              buttonVariants({size: 'fig'}),
              'shrink-0 border-[1.5px] border-[var(--trd-navy)] bg-transparent text-[var(--trd-navy)] hover:bg-[var(--trd-navy)]/5 max-sm:w-full'
            )}
          >
            {copy.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
