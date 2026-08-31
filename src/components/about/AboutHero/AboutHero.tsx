import Image from 'next/image';
import {getLocale, getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {getAboutMarketing} from '@/lib/aboutMarketing';
import type {Locale} from '@/i18n/routing';

/**
 * About hero (Figma 12:19). Marketing copy = CMS AboutPage with i18n fallback.
 */
export default async function AboutHero() {
  const locale = (await getLocale()) as Locale;
  const copy = (await getAboutMarketing(locale)).hero;
  const nav = await getTranslations('nav');
  const common = await getTranslations('common');

  return (
    <section className="relative overflow-hidden bg-[var(--fig-ink)] text-white">
      <Image
        src="/figma/about/about-hero-bg.png"
        alt=""
        aria-hidden
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{background: 'rgba(7,10,20,0.85)'}}
      />

      <div className="relative mx-auto flex max-w-[1440px] flex-col gap-6 px-6 pb-16 pt-28 sm:px-10 lg:px-[120px] lg:pt-32">
        <nav aria-label="breadcrumb" className="flex items-center gap-2 text-[13px]">
          <Link href="/" className="text-[var(--fig-text-dim)] transition-colors hover:text-white">
            {nav('home')}
          </Link>
          <span aria-hidden className="text-[var(--fig-text-dim)]">
            /
          </span>
          <span className="text-gold">{nav('aboutHatc')}</span>
        </nav>

        <h1 className="text-[clamp(2.4rem,5.4vw,3.5rem)] font-extrabold leading-[1.2] text-white">
          {copy.titleLead}
          <span className="text-gold">{common('brand')}</span>
        </h1>

        <p className="max-w-[42rem] text-lg leading-[1.5] text-[var(--fig-text-dim)] lg:text-xl">
          {copy.subtitle}
        </p>
      </div>
    </section>
  );
}
