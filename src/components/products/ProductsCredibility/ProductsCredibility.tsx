import {getLocale, getTranslations} from 'next-intl/server';
import {ShieldCheck, Landmark, BadgeCheck} from 'lucide-react';
import SectionTitle from '@/components/home/SectionTitle';
import {getProductsMarketing} from '@/lib/productsMarketing';
import type {Locale} from '@/i18n/routing';

/**
 * Why trade with HATC. Section chrome from CMS; card bodies reuse FACTS-backed
 * home.trust.* / about.credentials.security.
 */
const CARDS = [
  {key: 'field', Icon: Landmark},
  {key: 'grade', Icon: BadgeCheck},
  {key: 'member', Icon: ShieldCheck}
] as const;

export default async function ProductsCredibility() {
  const locale = (await getLocale()) as Locale;
  const copy = (await getProductsMarketing(locale)).credibility;
  const trust = await getTranslations('home.trust');
  const security = await getTranslations('about.credentials.security');

  return (
    <section className="bg-[var(--fig-light)]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-12 px-6 py-20 sm:px-10 lg:px-[120px] lg:py-24">
        <SectionTitle kicker={copy.kicker} heading={copy.heading} />

        <div className="grid gap-6 md:grid-cols-3">
          {CARDS.map(({key, Icon}) => (
            <div
              key={key}
              className="flex flex-col gap-4 rounded-lg border border-[var(--fig-border-light)] bg-white p-8"
            >
              <span className="grid size-12 place-items-center rounded-3xl bg-gold/10 text-gold">
                <Icon className="size-6" aria-hidden />
              </span>
              <h3 className="font-sans text-[20px] font-extrabold text-[var(--fig-heading-dark)]">
                {trust(`${key}.title`)}
              </h3>
              <p className="text-[13px] leading-[1.6] text-[var(--fig-text-muted)]">
                {trust(`${key}.sub`)}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-start gap-4 rounded-lg border border-[var(--fig-border-light)] bg-white p-6 sm:flex-row sm:items-center sm:gap-5">
          <span className="grid size-12 shrink-0 place-items-center rounded-3xl bg-gold/10 text-gold">
            <ShieldCheck className="size-6" aria-hidden />
          </span>
          <div className="flex flex-col gap-1">
            <h3 className="font-sans text-[18px] font-bold text-[var(--fig-heading-dark)]">
              {security('title')}
            </h3>
            <p className="text-[13px] leading-[1.6] text-[var(--fig-text-muted)]">
              {security('body')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
