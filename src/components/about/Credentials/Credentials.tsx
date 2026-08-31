import {getLocale, getTranslations} from 'next-intl/server';
import {ShieldCheck} from 'lucide-react';
import SectionTitle from '@/components/home/SectionTitle';
import {getAboutMarketing} from '@/lib/aboutMarketing';
import type {Locale} from '@/i18n/routing';

/**
 * credentials (Figma 12:41). Section chrome from CMS; card bodies stay in i18n
 * (FACTS-grounded).
 */
const CARDS = ['c1', 'c2', 'c3'] as const;

export default async function Credentials() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('about.credentials');
  const copy = (await getAboutMarketing(locale)).credentials;

  return (
    <section className="bg-[var(--fig-ink)]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-12 px-6 py-20 sm:px-10 lg:px-[120px] lg:py-24">
        <SectionTitle kicker={copy.kicker} heading={copy.heading} tone="dark" />

        <div className="grid gap-6 md:grid-cols-3">
          {CARDS.map((key) => (
            <div
              key={key}
              className="flex flex-col gap-3 rounded-lg border border-[var(--fig-border)] bg-[var(--fig-surface)] p-8"
            >
              <h3 className="font-sans text-[26px] font-extrabold leading-tight text-gold">
                {t(`cards.${key}.title`)}
              </h3>
              <span className="text-[18px] font-semibold text-white">
                {t(`cards.${key}.sub`)}
              </span>
              <p className="text-[13px] leading-[1.6] text-[var(--fig-text-dim)]">
                {t(`cards.${key}.body`)}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-start gap-4 rounded-lg border border-[var(--fig-border)] bg-[var(--fig-surface)] p-6 sm:flex-row sm:items-center sm:gap-5">
          <span className="grid size-12 shrink-0 place-items-center rounded-3xl bg-[rgba(212,175,55,0.12)] text-gold">
            <ShieldCheck className="size-6" aria-hidden />
          </span>
          <div className="flex flex-col gap-1">
            <h3 className="font-sans text-[18px] font-bold text-white">
              {t('security.title')}
            </h3>
            <p className="text-[13px] leading-[1.6] text-[var(--fig-text-dim)]">
              {t('security.body')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
