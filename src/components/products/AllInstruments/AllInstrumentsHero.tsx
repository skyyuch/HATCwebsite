import Image from 'next/image';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';

/**
 * Dark hero for `/products/all`. Shares the /products dark/gold system.
 * Copy is i18n (structural page chrome); no CMS marketing override needed here.
 */
export default async function AllInstrumentsHero() {
  const t = await getTranslations('productsAll.hero');
  const nav = await getTranslations('nav');

  return (
    <section className="relative overflow-hidden bg-[var(--fig-ink)] text-white">
      <Image
        src="/figma/raw/raw_2.png"
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
          <Link
            href="/"
            className="text-[var(--fig-text-dim)] transition-colors hover:text-white"
          >
            {nav('home')}
          </Link>
          <span aria-hidden className="text-[var(--fig-text-dim)]">
            /
          </span>
          <Link
            href="/products"
            className="text-[var(--fig-text-dim)] transition-colors hover:text-white"
          >
            {nav('products')}
          </Link>
          <span aria-hidden className="text-[var(--fig-text-dim)]">
            /
          </span>
          <span className="text-gold">{t('breadcrumb')}</span>
        </nav>

        <h1 className="max-w-[46rem] font-sans text-[clamp(2.2rem,5vw,3.25rem)] font-extrabold leading-[1.15] text-white">
          {t('titleLead')}
          <span className="text-gold">{t('titleAccent')}</span>
          {t('titleTail')}
        </h1>

        <p className="max-w-[42rem] text-lg leading-[1.5] text-[var(--fig-text-dim)]">
          {t('subtitle')}
        </p>
      </div>
    </section>
  );
}
