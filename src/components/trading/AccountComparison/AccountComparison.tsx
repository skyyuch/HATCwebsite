import {getLocale, getTranslations} from 'next-intl/server';
import {Check, Info} from 'lucide-react';
import {cn} from '@/lib/utils';
import {buttonVariants} from '@/components/ui/button';
import {
  getSampleTradingTables,
  type ResolvedAccountCell
} from '@/lib/sampleTradingConditions';
import {getTradingMarketing} from '@/lib/tradingMarketing';
import type {Locale} from '@/i18n/routing';
import {getSiteSettings, primaryContactHref} from '@/lib/siteSettings';
import SectionHeader from '../SectionHeader';

/**
 * "交易帳戶比較" (Figma 44:80) — ILLUSTRATIVE FORMAT (示意). Rows from CMS
 * `sample-trading-conditions` with sampleTradingData.ts fallback. Section chrome
 * from TradingPage marketing global. Never presents approved trading conditions.
 */
export default async function AccountComparison() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('trading.accounts');
  const copy = (await getTradingMarketing(locale)).accounts;
  const {accountRows} = await getSampleTradingTables(locale);
  const common = await getTranslations('common');
  const settings = await getSiteSettings();
  const learnMoreHref = primaryContactHref(settings);

  function cellContent(
    cell: ResolvedAccountCell,
    tier: 'standard' | 'professional'
  ) {
    switch (cell.type) {
      case 'pending':
        return (
          <span
            className={cn(
              'font-bold',
              tier === 'standard'
                ? 'text-[var(--trd-gold)]'
                : 'text-[var(--trd-navy)]'
            )}
          >
            {t('pending')}
          </span>
        );
      case 'text':
        return (
          <span className="font-medium text-[var(--trd-heading)]">
            {cell.value}
          </span>
        );
      case 'priority':
        return (
          <span className="inline-flex items-center gap-1 font-medium text-[var(--trd-heading)]">
            <Check className="size-4 text-[var(--trd-up)]" aria-hidden />
            {t('priority').replace(/^✓\s*/, '')}
          </span>
        );
      case 'check':
        return (
          <Check
            className="mx-auto size-4 text-[var(--trd-up)]"
            aria-label="✓"
          />
        );
      case 'dash':
        return <span className="text-[var(--trd-muted)]" aria-hidden>—</span>;
    }
  }

  const stdCell =
    'bg-[var(--trd-cream)] border-x border-[var(--trd-cream-border)] px-5 py-4 text-center text-sm';

  return (
    <section className="bg-white font-[family-name:var(--font-geist)]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-6 py-16 sm:px-10 lg:px-[120px] lg:py-20">
        <SectionHeader
          badge={copy.badge}
          heading={copy.heading}
          subtitle={copy.subtitle}
        />

        <div className="overflow-x-auto rounded-[12px] border border-[var(--trd-border)]">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <caption className="sr-only">{copy.heading}</caption>
            <thead>
              <tr className="bg-[var(--trd-row-alt)]">
                <th
                  scope="col"
                  className="w-[320px] px-6 py-6 text-[15px] font-semibold text-[var(--trd-body)]"
                >
                  {t('colSpec')}
                </th>
                <th
                  scope="col"
                  className="border-x border-[var(--trd-cream-border)] bg-[var(--trd-cream)] px-6 py-5 text-center align-top"
                >
                  <span className="mb-2 inline-flex items-center rounded-[4px] bg-[var(--trd-gold)] px-2 py-0.5 text-[11px] font-bold text-white">
                    {t('recommend')}
                  </span>
                  <span className="block text-[20px] font-bold text-[var(--trd-navy)]">
                    {t('standard')}
                  </span>
                </th>
                <th
                  scope="col"
                  className="px-6 py-5 text-center align-middle text-[20px] font-bold text-[var(--trd-heading)]"
                >
                  {t('professional')}
                </th>
              </tr>
            </thead>
            <tbody>
              {accountRows.map((row, i) => (
                <tr
                  key={row.key}
                  className={cn(
                    'border-t border-[var(--trd-border)]',
                    i % 2 === 1 && 'bg-[var(--trd-row-alt)]'
                  )}
                >
                  <th
                    scope="row"
                    className="w-[320px] px-5 py-4 text-sm font-semibold text-[var(--trd-heading)]"
                  >
                    {t(`rows.${row.key}`)}
                  </th>
                  <td className={stdCell}>
                    {cellContent(row.standard, 'standard')}
                  </td>
                  <td className="px-5 py-4 text-center text-sm text-[var(--trd-heading)]">
                    {cellContent(row.professional, 'professional')}
                  </td>
                </tr>
              ))}
              <tr className="border-t border-[var(--trd-border)] bg-[var(--trd-row-alt)]">
                <td className="w-[320px] px-5 py-6" />
                <td className="border-x border-[var(--trd-cream-border)] bg-[var(--trd-cream)] px-6 py-6">
                  <LearnMore href={learnMoreHref} label={common('readMore')} variant="solid" />
                </td>
                <td className="px-6 py-6">
                  <LearnMore href={learnMoreHref} label={common('readMore')} variant="outline" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="flex items-start justify-center gap-2 text-center text-xs leading-[1.5] text-[var(--trd-muted)]">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{t('disclaimer')}</span>
        </p>
      </div>
    </section>
  );
}

function LearnMore({
  href,
  label,
  variant
}: {
  href: string | null;
  label: string;
  variant: 'solid' | 'outline';
}) {
  const className = cn(
    buttonVariants({size: 'fig'}),
    'w-full',
    variant === 'solid'
      ? 'bg-[var(--trd-navy)] text-white hover:bg-[var(--trd-navy-hover)]'
      : 'border-[1.5px] border-[var(--trd-navy)] bg-transparent text-[var(--trd-navy)] hover:bg-[var(--trd-navy)]/5'
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {label}
      </a>
    );
  }
  return (
    <a href="#pricing" className={className}>
      {label}
    </a>
  );
}
