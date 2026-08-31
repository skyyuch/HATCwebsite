import {getLocale, getTranslations} from 'next-intl/server';
import {ChevronDown} from 'lucide-react';
import SectionTitle from '@/components/home/SectionTitle';
import {getFaqs} from '@/lib/faqs';
import type {Locale} from '@/i18n/routing';

/**
 * Platform FAQ (Figma 92:90) — native <details> accordions. Items come from the
 * CMS (`faqs` collection, `platforms` category) with an i18n fallback
 * (`platforms.faq.items`); answers are converged to gold/silver + MT5/HATC-only
 * platforms and softened to avoid unconfirmed operational promises.
 */
export default async function PlatformFaq() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('platforms.faq');
  const items = await getFaqs(locale, 'platforms');

  return (
    <section className="bg-[var(--fig-light)]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-12 px-6 py-20 sm:px-10 lg:px-[120px] lg:py-24">
        <div className="flex flex-col items-center gap-3 text-center">
          <SectionTitle kicker={t('kicker')} heading={t('heading')} />
          <p className="max-w-[42rem] text-sm text-[var(--fig-text-muted)]">
            {t('subheading')}
          </p>
        </div>

        <div className="mx-auto flex w-full max-w-[900px] flex-col gap-4">
          {items.map((item, i) => (
            <details
              key={item.id}
              open={i === 0}
              className="group rounded-[8px] border border-[var(--fig-border-light)] bg-white p-6"
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
