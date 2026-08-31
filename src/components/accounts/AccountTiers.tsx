import {getLocale, getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/utils';
import {buttonVariants} from '@/components/ui/button';
import {getSiteSettings, primaryContactHref} from '@/lib/siteSettings';
import {getAccountTiers} from '@/lib/accountTiers';
import type {Locale} from '@/i18n/routing';

/**
 * Account-tier comparison cards (Figma 62:37). Tier cards come from the CMS
 * (`account-tiers` collection) with an i18n SAMPLE fallback (`accounts.tiersSample`).
 *
 * ⚠️ Governance: every figure (min deposit / spread / commission / leverage /
 * execution / platform) is a SAMPLE display value — the section keeps the
 *「示意數據」label and they are NOT approved facts (owner 2026-08-20). Approved
 * conditions (gold 27 / silver 30 / 1:100) live only in tradingConditions.ts.
 */

const SPEC_KEYS = [
  'minDeposit',
  'spread',
  'commission',
  'leverage',
  'execution',
  'platform'
] as const;

export default async function AccountTiers() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('accounts.tiers');
  const nav = await getTranslations('nav');
  const sampleLabel = await getTranslations('productsAll.table');
  const tiers = await getAccountTiers(locale);
  const settings = await getSiteSettings();
  const openAccountHref = primaryContactHref(settings);

  return (
    <section className="bg-[var(--fig-light)]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-12 px-6 py-20 sm:px-10 lg:px-[120px] lg:py-24">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-gold">
            {t('kicker')}
          </span>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <h2 className="font-sans text-[clamp(1.8rem,4vw,2.25rem)] font-extrabold leading-[1.15] text-[var(--fig-heading-dark)]">
              {t('heading')}
            </h2>
            <span className="rounded-[4px] bg-gold/10 px-2.5 py-1 text-xs font-bold text-gold">
              {sampleLabel('sampleLabel')}
            </span>
          </div>
          <p className="max-w-[46rem] text-[15px] leading-[1.6] text-[var(--fig-text-muted)]">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={cn(
                'flex flex-col gap-6 rounded-[12px] bg-white p-8',
                tier.popular
                  ? 'border-2 border-gold shadow-[0_8px_24px_rgba(212,175,55,0.16)]'
                  : 'border border-[var(--fig-border-light)] shadow-[0_8px_24px_rgba(0,0,0,0.03)]'
              )}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-gold">
                    {tier.code}
                  </span>
                  <span
                    className={cn(
                      'rounded-[4px] px-2 py-1 text-[10px] font-bold',
                      tier.popular
                        ? 'bg-gold text-[#070a14]'
                        : 'bg-[var(--fig-light)] text-[var(--fig-text-muted)]'
                    )}
                  >
                    {tier.badge}
                  </span>
                </div>
                <h3 className="font-sans text-xl font-extrabold text-[var(--fig-heading-dark)]">
                  {tier.name}
                </h3>
                <p className="text-sm leading-[1.6] text-[var(--fig-text-muted)]">
                  {tier.desc}
                </p>
              </div>

              <div className="h-px w-full bg-[var(--fig-border-light)]" />

              <dl className="flex flex-col gap-4 text-sm">
                {SPEC_KEYS.map((spec) => (
                  <div key={spec} className="flex items-start justify-between gap-3">
                    <dt className="text-[var(--fig-text-muted)]">
                      {t(`specLabels.${spec}`)}
                    </dt>
                    <dd
                      className={cn(
                        'text-right font-bold',
                        spec === 'spread'
                          ? 'text-gold'
                          : 'text-[var(--fig-heading-dark)]'
                      )}
                    >
                      {tier[spec]}
                    </dd>
                  </div>
                ))}
              </dl>

              {openAccountHref ? (
                <a
                  href={openAccountHref}
                  target="_blank"
                  rel="noopener noreferrer"
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
