import {getLocale, getTranslations} from 'next-intl/server';
import {getHomeMarketing} from '@/lib/homeMarketing';
import type {Locale} from '@/i18n/routing';
import SectionTitle from '../SectionTitle';

// why-hatc (Figma 4:188): light section, four numbered white cards with a large
// semi-transparent gold index. Content is HATC's own value props (no fabricated
// stats); membership facts trace to docs/HATC_FACTS.md.
const CARDS = ['c1', 'c2', 'c3', 'c4'] as const;

export default async function WhyHATC() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('home.whyV2');
  const copy = (await getHomeMarketing(locale)).why;

  return (
    <section id="why" className="scroll-mt-20 bg-[var(--fig-light)]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-16 px-6 py-20 sm:px-10 lg:px-[120px] lg:py-24">
        <SectionTitle kicker={copy.kicker} heading={copy.heading} />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((key, i) => (
            <div
              key={key}
              className="flex flex-col gap-6 rounded-lg border border-[var(--fig-border-light)] bg-white p-8"
            >
              <span className="font-[family-name:var(--font-ticker)] text-[32px] font-extrabold leading-none text-[rgba(212,175,55,0.2)]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="font-sans text-[18px] font-extrabold text-[var(--fig-heading-dark)]">
                {t(`cards.${key}.title`)}
              </h3>
              <p className="text-[13px] leading-[1.5] text-[var(--fig-text-muted)]">
                {t(`cards.${key}.body`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
