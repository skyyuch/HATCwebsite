import Image from 'next/image';
import {getLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/utils';
import {buttonVariants} from '@/components/ui/button';
import {getHomeMarketing} from '@/lib/homeMarketing';
import type {Locale} from '@/i18n/routing';
import {getSiteSettings, primaryContactHref} from '@/lib/siteSettings';

/**
 * final-cta-band (Figma 4:288): dark full-bleed conversion band above the footer.
 * Marketing copy = CMS with i18n fallback; open-account via SiteSettings.
 */
export default async function FinalCta() {
  const locale = (await getLocale()) as Locale;
  const copy = (await getHomeMarketing(locale)).finalCta;
  const settings = await getSiteSettings();
  const openAccountHref = primaryContactHref(settings);

  return (
    <section className="relative overflow-hidden bg-[var(--fig-ink)]">
      <Image
        src="/figma/raw/raw_14.png"
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{background: 'rgba(7,10,20,0.9)'}}
      />

      <div className="relative mx-auto flex max-w-[1440px] flex-col items-center gap-6 px-6 py-20 text-center sm:px-10 lg:px-[120px]">
        <h2 className="font-sans text-[clamp(1.75rem,3.5vw,2rem)] font-extrabold leading-tight text-white">
          {copy.heading}
        </h2>
        <p className="max-w-[36rem] text-[15px] text-[var(--fig-text-dim)]">
          {copy.body}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {openAccountHref ? (
            <a
              href={openAccountHref}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({variant: 'gold', size: 'fig'}))}
            >
              {copy.ctaPrimary}
            </a>
          ) : (
            <Link
              href="/register"
              className={cn(buttonVariants({variant: 'gold', size: 'fig'}))}
            >
              {copy.ctaPrimary}
            </Link>
          )}
          <Link
            href="/register"
            className={cn(buttonVariants({variant: 'onDark', size: 'fig'}))}
          >
            {copy.ctaSecondary}
          </Link>
        </div>
      </div>
    </section>
  );
}
