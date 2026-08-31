import Image from 'next/image';
import {getLocale, getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/utils';
import {buttonVariants} from '@/components/ui/button';
import {getHomeMarketing} from '@/lib/homeMarketing';
import type {Locale} from '@/i18n/routing';

/**
 * company-story (Figma 4:245): dark full-bleed band over a Hong Kong skyline.
 * The giant "008" is the approved seat number (docs/HATC_FACTS.md). Marketing
 * copy = CMS with i18n fallback; CTA links to About.
 */
export default async function CompanyStory() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('home.story');
  const copy = (await getHomeMarketing(locale)).story;
  const facts = await getTranslations('home.facts');

  return (
    <section className="relative overflow-hidden bg-[var(--fig-ink)]">
      <Image
        src="/figma/raw/raw_7.png"
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

      <div className="relative mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-12 px-6 py-20 sm:px-10 lg:flex-row lg:items-center lg:px-[120px] lg:py-24">
        <div className="flex max-w-[635px] flex-col gap-6">
          <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-gold">
            {copy.kicker}
          </span>
          <h2 className="font-sans text-[clamp(1.75rem,3.5vw,2rem)] font-extrabold leading-[1.2] text-white">
            {copy.heading}
          </h2>
          <p className="text-sm leading-[1.65] text-[var(--fig-text-dim)]">
            {copy.body}
          </p>
          <Link
            href="/about"
            className={cn(buttonVariants({variant: 'gold', size: 'fig'}), 'w-fit')}
          >
            {copy.cta}
          </Link>
        </div>

        <div className="flex flex-col items-start gap-2 lg:items-end lg:text-right">
          <span className="font-[family-name:var(--font-ticker)] text-[96px] font-extrabold leading-none text-[rgba(212,175,55,0.17)]">
            {facts('memberNoValue')}
          </span>
          <span className="text-sm font-bold uppercase tracking-[0.14em] text-gold">
            {t('seatLabel')}
          </span>
        </div>
      </div>
    </section>
  );
}
