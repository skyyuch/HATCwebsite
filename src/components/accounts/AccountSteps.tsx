import {getTranslations} from 'next-intl/server';
import {ArrowRight} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/utils';
import {buttonVariants} from '@/components/ui/button';
import {getSiteSettings, primaryContactHref} from '@/lib/siteSettings';

/** Three-step account opening (Figma 62:255). Dark section. */

type Step = {title: string; desc: string};

export default async function AccountSteps() {
  const t = await getTranslations('accounts.steps');
  const hero = await getTranslations('accounts.hero');
  const items = t.raw('items') as Step[];
  const settings = await getSiteSettings();
  const openAccountHref = primaryContactHref(settings);

  return (
    <section className="bg-[var(--fig-ink)]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-14 px-6 py-20 sm:px-10 lg:px-[120px] lg:py-24">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="flex flex-col gap-3">
            <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-gold">
              {t('kicker')}
            </span>
            <h2 className="max-w-[36rem] font-sans text-[clamp(1.8rem,4vw,2.25rem)] font-extrabold leading-[1.15] text-white">
              {t('heading')}
            </h2>
          </div>
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

        <div className="grid gap-8 md:grid-cols-3">
          {items.map((item, i) => (
            <div
              key={item.title}
              className="flex flex-col gap-6 rounded-[12px] border border-[var(--fig-border)] bg-[var(--fig-surface)] p-8"
            >
              <div className="flex items-center justify-between">
                <span className="font-sans text-5xl font-extrabold text-gold/20">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="flex size-9 items-center justify-center rounded-full bg-gold/10 text-gold">
                  <ArrowRight className="size-4" />
                </span>
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="font-sans text-lg font-bold text-white">
                  {item.title}
                </h3>
                <p className="text-sm leading-[1.6] text-[var(--fig-text-dim)]">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
