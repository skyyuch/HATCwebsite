import {getLocale, getTranslations} from 'next-intl/server';
import {milestoneEntries} from '@/content/milestones';
import SectionTitle from '@/components/home/SectionTitle';
import {getAboutMarketing} from '@/lib/aboutMarketing';
import type {Locale} from '@/i18n/routing';

/**
 * company-timeline (Figma 12:92). REAL milestone dates from FACTS /
 * milestones.ts. Section chrome from CMS; item copy from i18n.
 */
export default async function Timeline() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('about.timeline');
  const copy = (await getAboutMarketing(locale)).timeline;
  const ms = await getTranslations('home.milestones');

  return (
    <section className="bg-[var(--fig-ink)]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-16 px-6 py-20 sm:px-10 lg:px-[120px] lg:py-24">
        <SectionTitle kicker={copy.kicker} heading={copy.heading} tone="dark" />

        <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {milestoneEntries.map((entry) => (
            <li key={entry.date} className="flex flex-col gap-3">
              {/* Figma 12:92: big gold year + a gold connector line fading to
                  the right, threading the columns into one timeline. */}
              <div className="flex items-center gap-4">
                <span className="font-[family-name:var(--font-ticker)] text-[40px] font-extrabold leading-none text-gold">
                  {entry.date.slice(0, 4)}
                </span>
                <span
                  aria-hidden
                  className="h-0.5 flex-1 rounded-full bg-gradient-to-r from-gold to-transparent"
                />
              </div>
              <time
                dateTime={entry.date}
                className="font-[family-name:var(--font-ticker)] text-[13px] tabular-nums text-[var(--fig-text-dim)]"
              >
                {entry.date}
              </time>
              <h3 className="font-sans text-[16px] font-bold text-white">
                {t(`items.${entry.key}.title`)}
              </h3>
              <p className="text-[13px] leading-[1.6] text-[var(--fig-text-dim)]">
                {ms(`items.${entry.key}`)}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
