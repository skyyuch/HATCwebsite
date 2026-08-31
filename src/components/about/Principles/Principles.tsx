import {getLocale, getTranslations} from 'next-intl/server';
import SectionTitle from '@/components/home/SectionTitle';
import {getAboutMarketing} from '@/lib/aboutMarketing';
import type {Locale} from '@/i18n/routing';

/**
 * mission-and-values (Figma 12:67). Section chrome from CMS; principle cards
 * stay in i18n.
 */
const ITEMS = ['p1', 'p2', 'p3', 'p4'] as const;

export default async function Principles() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('about.principles');
  const copy = (await getAboutMarketing(locale)).principles;

  return (
    <section className="bg-[var(--fig-light)]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-16 px-6 py-20 sm:px-10 lg:px-[120px] lg:py-24">
        <SectionTitle kicker={copy.kicker} heading={copy.heading} />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((key, i) => (
            <div
              key={key}
              className="flex flex-col gap-4 rounded-lg border border-[var(--fig-border-light)] bg-white p-8"
            >
              <span className="font-[family-name:var(--font-ticker)] text-[32px] font-extrabold leading-none text-[rgba(212,175,55,0.35)]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="font-sans text-[18px] font-extrabold text-[var(--fig-heading-dark)]">
                {t(`items.${key}.title`)}
              </h3>
              <p className="text-[13px] leading-[1.5] text-[var(--fig-text-muted)]">
                {t(`items.${key}.body`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
