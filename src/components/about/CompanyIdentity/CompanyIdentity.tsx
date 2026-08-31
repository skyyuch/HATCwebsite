import Image from 'next/image';
import {getLocale, getTranslations} from 'next-intl/server';
import {getAboutMarketing} from '@/lib/aboutMarketing';
import type {Locale} from '@/i18n/routing';

/**
 * company-identity (Figma 12:28). Section chrome from CMS; body paragraphs stay
 * in i18n (fact-grounded).
 */
export default async function CompanyIdentity() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('about.identity');
  const copy = (await getAboutMarketing(locale)).identity;

  return (
    <section className="bg-[var(--fig-light)]">
      <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-6 py-20 sm:px-10 lg:grid-cols-2 lg:gap-16 lg:px-[120px] lg:py-24">
        <div className="flex flex-col gap-6">
          <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-gold">
            {copy.kicker}
          </span>
          <h2 className="font-sans text-[clamp(1.8rem,4vw,2.25rem)] font-extrabold leading-[1.15] text-[var(--fig-heading-dark)]">
            {copy.heading}
          </h2>
          <p className="text-[17px] leading-[1.7] text-[var(--fig-heading-dark)]">
            {t('p1')}
          </p>
          <p className="text-[15px] leading-[1.7] text-[var(--fig-text-muted)]">
            {t('p2')}
          </p>
          <p className="text-[15px] leading-[1.7] text-[var(--fig-text-muted)]">
            {t('p3')}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[var(--fig-border-light)]">
          <Image
            src="/office/reception.jpg"
            alt={t('imageAlt')}
            width={1160}
            height={840}
            sizes="(max-width: 1024px) 100vw, 580px"
            className="aspect-[580/420] h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
