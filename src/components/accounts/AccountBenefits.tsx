import {getLocale, getTranslations} from 'next-intl/server';
import {CreditCard, Monitor, Percent, Zap, type LucideIcon} from 'lucide-react';
import SectionTitle from '@/components/home/SectionTitle';
import {getAccountBenefits, type BenefitIcon} from '@/lib/accountBenefits';
import type {Locale} from '@/i18n/routing';

/**
 * Core account benefits (Figma 62:171). White section, 4 cards. Cards come from
 * the CMS (`account-benefits` collection) with an i18n fallback
 * (`accounts.benefits.items`). The icon is chosen from a fixed set.
 */

const ICONS: Record<BenefitIcon, LucideIcon> = {
  percent: Percent,
  zap: Zap,
  creditCard: CreditCard,
  monitor: Monitor
};

export default async function AccountBenefits() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('accounts.benefits');
  const items = await getAccountBenefits(locale);

  return (
    <section className="bg-white">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-14 px-6 py-20 sm:px-10 lg:px-[120px] lg:py-24">
        <SectionTitle kicker={t('kicker')} heading={t('heading')} />

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => {
            const Icon = ICONS[item.icon] ?? Percent;
            return (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-[8px] border border-[var(--fig-border-light)] bg-[var(--fig-light)] p-6"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-gold/10 text-gold">
                  <Icon className="size-6" />
                </span>
                <h3 className="font-sans text-lg font-bold text-[var(--fig-heading-dark)]">
                  {item.title}
                </h3>
                <p className="text-sm leading-[1.6] text-[var(--fig-text-muted)]">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
