import {getLocale, getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {UserPlus, MonitorSmartphone, Wallet, LineChart} from 'lucide-react';
import {cn} from '@/lib/utils';
import {buttonVariants} from '@/components/ui/button';
import {getHomeMarketing} from '@/lib/homeMarketing';
import type {Locale} from '@/i18n/routing';
import {getSiteSettings, primaryContactHref} from '@/lib/siteSettings';
import SectionTitle from '../SectionTitle';

// client-support (Figma 4:255): light section, four support-topic cards. The
// contact CTA is an operational link resolved via the CMS (never hard-coded).
// Topic-appropriate icons used in place of Figma's single placeholder headset.
const CARDS = [
  {key: 's1', Icon: UserPlus},
  {key: 's2', Icon: MonitorSmartphone},
  {key: 's3', Icon: Wallet},
  {key: 's4', Icon: LineChart}
] as const;

export default async function ClientSupport() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('home.support');
  const copy = (await getHomeMarketing(locale)).support;
  const common = await getTranslations('common');
  const settings = await getSiteSettings();
  const contactHref = primaryContactHref(settings);

  return (
    <section id="support" className="scroll-mt-20 bg-[var(--fig-light)]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-16 px-6 py-20 sm:px-10 lg:px-[120px] lg:py-24">
        <SectionTitle kicker={copy.kicker} heading={copy.heading} />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map(({key, Icon}) => (
            <div
              key={key}
              className="flex flex-col gap-4 rounded-lg border border-[var(--fig-border-light)] bg-white p-6"
            >
              <span className="grid size-10 place-items-center rounded-[20px] bg-[rgba(212,175,55,0.12)] text-gold">
                <Icon className="size-[18px]" aria-hidden />
              </span>
              <h3 className="font-sans text-base font-extrabold text-[var(--fig-heading-dark)]">
                {t(`cards.${key}.title`)}
              </h3>
              <p className="text-[13px] leading-[1.5] text-[var(--fig-text-muted)]">
                {t(`cards.${key}.body`)}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          {contactHref ? (
            <a
              href={contactHref}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({variant: 'gold', size: 'fig'}))}
            >
              {copy.cta}
            </a>
          ) : (
            <Link
              href="/account"
              className={cn(buttonVariants({variant: 'gold', size: 'fig'}))}
              aria-label={common('contactUs')}
            >
              {copy.cta}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
