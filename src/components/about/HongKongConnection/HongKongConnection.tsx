import Image from 'next/image';
import {getLocale} from 'next-intl/server';
import {getAboutMarketing} from '@/lib/aboutMarketing';
import type {Locale} from '@/i18n/routing';

/**
 * hong-kong-connection (Figma 12:129). Marketing copy = CMS with i18n fallback.
 */
export default async function HongKongConnection() {
  const locale = (await getLocale()) as Locale;
  const copy = (await getAboutMarketing(locale)).hongkong;

  return (
    <section className="relative overflow-hidden bg-[var(--fig-ink)]">
      <Image
        src="/figma/about/about-hk-bg.png"
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{background: 'rgba(7,10,20,0.8)'}}
      />

      <div className="relative mx-auto max-w-[1440px] px-6 py-20 sm:px-10 lg:px-[120px] lg:py-24">
        <div className="flex max-w-[720px] flex-col gap-6">
          <span className="text-sm font-bold uppercase tracking-[0.14em] text-gold">
            {copy.kicker}
          </span>
          <h2 className="font-sans text-[clamp(1.9rem,4vw,2.5rem)] font-extrabold leading-[1.3] text-white">
            {copy.headingLead}
            {' '}
            <span className="text-gold">{copy.headingAccent}</span>
          </h2>
          <p className="text-base leading-[1.8] text-[var(--fig-text-dim)]">
            {copy.body}
          </p>
        </div>
      </div>
    </section>
  );
}
