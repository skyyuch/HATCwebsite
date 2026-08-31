import {getLocale} from 'next-intl/server';
import {ChevronDown} from 'lucide-react';

import {getFaqs} from '@/lib/faqs';
import {getTradingMarketing} from '@/lib/tradingMarketing';
import type {Locale} from '@/i18n/routing';
import SectionHeader from '../SectionHeader';

/**
 * FAQ (Figma 44:238) — native <details> accordions. Items from CMS `faqs`
 * (category `trading`) with i18n fallback. Section chrome from TradingPage
 * marketing global with i18n fallback.
 */
export default async function TradingFaq() {
  const locale = (await getLocale()) as Locale;
  const copy = (await getTradingMarketing(locale)).faq;
  const items = await getFaqs(locale, 'trading');

  return (
    <section
      id="faq"
      className="scroll-mt-20 bg-[var(--trd-row-alt)] font-[family-name:var(--font-geist)]"
    >
      <div className="mx-auto flex max-w-[1440px] flex-col gap-12 px-6 py-16 sm:px-10 lg:px-[120px] lg:py-20">
        <SectionHeader
          badge={copy.badge}
          heading={copy.heading}
          subtitle={copy.subtitle}
        />

        <div className="flex flex-col gap-4">
          {items.map((item, i) => (
            <details
              key={item.id}
              open={i === 0}
              className="group rounded-[10px] border border-[var(--trd-border)] bg-white p-6"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
                <span className="text-base font-bold text-[var(--trd-navy)]">
                  {item.question}
                </span>
                <ChevronDown
                  className="size-[18px] shrink-0 text-[var(--trd-navy)] transition-transform duration-200 group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <p className="mt-3 text-sm leading-[1.5] text-[var(--trd-body)]">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
