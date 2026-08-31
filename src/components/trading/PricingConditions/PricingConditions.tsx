import {getLocale, getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/utils';
import {buttonVariants} from '@/components/ui/button';
import {getSampleTradingTables} from '@/lib/sampleTradingConditions';
import {getTradingMarketing} from '@/lib/tradingMarketing';
import type {Locale} from '@/i18n/routing';
import SectionHeader from '../SectionHeader';

/**
 * "即時查看具競爭力的交易條件" (Figma 44:200) — SAMPLE live-quote table
 * (labelled「示意數據」). Rows from CMS `sample-trading-conditions` with
 * sampleTradingData.ts fallback. Approved gold27/silver30 live on /products
 * only (tradingConditions.ts) — never from this CMS global.
 */
export default async function PricingConditions() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('trading.pricing');
  const copy = (await getTradingMarketing(locale)).pricing;
  const {pricingRows} = await getSampleTradingTables(locale);

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

        <div className="overflow-x-auto rounded-[12px] border border-[var(--trd-border)]">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <caption className="sr-only">{copy.heading}</caption>
            <thead>
              <tr className="bg-[var(--trd-navy)] text-sm font-semibold text-white">
                <th scope="col" className="px-5 py-4">
                  {t('cols.instrument')}
                </th>
                <th scope="col" className="px-5 py-4 text-right">
                  {t('cols.bid')}
                </th>
                <th scope="col" className="px-5 py-4 text-right">
                  {t('cols.ask')}
                </th>
                <th scope="col" className="px-5 py-4 text-right">
                  {t('cols.spread')}
                </th>
                <th scope="col" className="px-5 py-4 text-right">
                  {t('cols.change')}
                </th>
                <th scope="col" className="px-5 py-4 text-right">
                  {t('cols.session')}
                </th>
              </tr>
            </thead>
            <tbody>
              {pricingRows.map((row, i) => (
                <tr
                  key={`${row.symbol}-${i}`}
                  className={cn(
                    'border-t border-[var(--trd-border)]',
                    i % 2 === 1 && 'bg-[var(--trd-row-alt)]'
                  )}
                >
                  <th scope="row" className="px-5 py-4 text-left">
                    <span className="block text-base font-bold text-[var(--trd-heading)]">
                      {row.symbol}
                    </span>
                    <span className="block text-xs text-[var(--trd-body)]">
                      {t(`names.${row.nameKey}`)}
                    </span>
                  </th>
                  <td className="px-5 py-4 text-right text-base font-semibold text-[var(--trd-navy)]">
                    {row.bid}
                  </td>
                  <td className="px-5 py-4 text-right text-base font-semibold text-[var(--trd-navy)]">
                    {row.ask}
                  </td>
                  <td className="px-5 py-4 text-right text-base font-semibold text-[var(--trd-gold)]">
                    {row.spread}
                  </td>
                  <td className="px-5 py-4 text-right text-sm font-semibold text-[var(--trd-up)]">
                    {row.change}
                  </td>
                  <td className="px-5 py-4 text-right text-sm text-[var(--trd-body)]">
                    {t('session')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="max-w-[600px] text-xs text-[var(--trd-muted)]">
            {t('disclaimer')}
          </p>
          <Link
            href="/products#conditions"
            className={cn(
              buttonVariants({size: 'fig'}),
              'border-[1.5px] border-[var(--trd-navy)] bg-transparent text-[var(--trd-navy)] hover:bg-[var(--trd-navy)]/5 max-sm:w-full'
            )}
          >
            {copy.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
