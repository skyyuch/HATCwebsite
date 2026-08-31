import {getLocale, getTranslations} from 'next-intl/server';
import {ChevronDown} from 'lucide-react';
import SectionTitle from '@/components/home/SectionTitle';
import {getFaqs} from '@/lib/faqs';
import type {Locale} from '@/i18n/routing';

/**
 * Account FAQ (Figma 62:292) — native <details> accordions. Items come from the
 * CMS (`faqs` collection, `accounts` category) with an i18n fallback
 * (`accounts.faq.items`); answers are softened to avoid unconfirmed operational
 * promises and all figures are flagged illustrative.
 */

export default async function AccountFaq() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('accounts.faq');
  const items = await getFaqs(locale, 'accounts');

  return (
    <section className="bg-white">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-12 px-6 py-20 sm:px-10 lg:px-[120px] lg:py-24">
        <SectionTitle kicker={t('kicker')} heading={t('heading')} />

        <div className="flex flex-col gap-4">
          {items.map((item, i) => (
            <details
              key={item.id}
              open={i === 0}
              className="group rounded-[8px] border border-[var(--fig-border-light)] bg-[var(--fig-light)] p-6"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
                <span className="text-base font-bold text-[var(--fig-heading-dark)]">
                  {item.question}
                </span>
                <ChevronDown
                  className="size-[18px] shrink-0 text-[var(--fig-heading-dark)] transition-transform duration-200 group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <p className="mt-3 text-sm leading-[1.6] text-[var(--fig-text-muted)]">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
