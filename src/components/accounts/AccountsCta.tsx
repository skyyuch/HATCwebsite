import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/utils';
import {buttonVariants} from '@/components/ui/button';
import {getSiteSettings, primaryContactHref} from '@/lib/siteSettings';

/**
 * Closing conversion band (Figma 62:327). Dark section, single gold CTA.
 * Open-account is an operational link resolved via CMS. Copy is softened —
 * no fabricated trader counts.
 */
export default async function AccountsCta() {
  const t = await getTranslations('accounts.cta');
  const hero = await getTranslations('accounts.hero');
  const settings = await getSiteSettings();
  const openAccountHref = primaryContactHref(settings);

  return (
    <section className="bg-[var(--fig-ink)]">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-6 px-6 py-24 text-center sm:px-10 lg:px-[120px]">
        <h2 className="max-w-[46rem] font-sans text-[clamp(1.6rem,3.5vw,2rem)] font-extrabold leading-tight text-white">
          {t('heading')}
        </h2>
        <p className="max-w-[42rem] text-base leading-[1.6] text-[var(--fig-text-dim)]">
          {t('body')}
        </p>
        {openAccountHref ? (
          <a
            href={openAccountHref}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({variant: 'gold', size: 'fig'}))}
          >
            {hero('ctaOpen')}
          </a>
        ) : (
          <Link
            href="/register"
            className={cn(buttonVariants({variant: 'gold', size: 'fig'}))}
          >
            {hero('ctaOpen')}
          </Link>
        )}
      </div>
    </section>
  );
}
