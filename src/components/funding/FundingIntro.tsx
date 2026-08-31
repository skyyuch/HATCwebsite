import {getLocale, getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/utils';
import {buttonVariants} from '@/components/ui/button';
import {getFundingMarketing} from '@/lib/fundingMarketing';
import {getSiteSettings, primaryContactHref} from '@/lib/siteSettings';
import type {Locale} from '@/i18n/routing';

/**
 * "How to deposit / withdraw" intro (Figma deposit 75:31 / withdrawal 75:215).
 * White section, two columns: heading + step list + CTA on the left, a Figma
 * placeholder visual on the right (owner-replaceable via CMS `funding-page`
 * deposit/withdraw image). `variant` selects the direction; steps come from i18n
 * (`funding.{deposit,withdraw}.steps`); headings are CMS-overridable.
 */

type Variant = 'deposit' | 'withdraw';
type Step = {text: string};

export default async function FundingIntro({variant}: {variant: Variant}) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations(`funding.${variant}.intro`);
  const tSteps = await getTranslations(`funding.${variant}`);
  const marketing = await getFundingMarketing(locale);
  const copy = marketing[variant];
  const steps = tSteps.raw('steps') as Step[];
  const settings = await getSiteSettings();
  const openAccountHref = primaryContactHref(settings);
  const image = marketing.images?.[variant] ?? `/figma/funding/${variant}.png`;

  // Alternate media side so deposit (image right) and withdraw (image left) read
  // as two distinct blocks.
  const imageFirst = variant === 'withdraw';

  return (
    <section className="bg-[var(--fig-light)]">
      <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-6 py-20 sm:px-10 lg:grid-cols-2 lg:gap-16 lg:px-[120px] lg:py-24">
        <div className={cn('flex flex-col gap-6', imageFirst && 'lg:order-2')}>
          <h2 className="font-sans text-[clamp(1.7rem,3.5vw,2rem)] font-extrabold leading-[1.15] text-[var(--fig-heading-dark)]">
            {copy.introHeading}
          </h2>
          <p className="text-base leading-[1.6] text-[var(--fig-text-muted)]">
            {copy.introBody}
          </p>

          <ol className="flex flex-col gap-3">
            {steps.map((step, i) => (
              <li
                key={step.text}
                className="flex items-start gap-3 text-[15px] leading-[1.6] text-[var(--fig-text-muted)]"
              >
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-gold/10 text-xs font-bold text-gold">
                  {i + 1}
                </span>
                <span>{step.text}</span>
              </li>
            ))}
          </ol>

          <div>
            {openAccountHref ? (
              <a
                href={openAccountHref}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({variant: 'gold', size: 'fig'}))}
              >
                {t('cta')}
              </a>
            ) : (
              <Link
                href="/register"
                className={cn(buttonVariants({variant: 'gold', size: 'fig'}))}
              >
                {t('cta')}
              </Link>
            )}
          </div>
        </div>

        <div
          aria-hidden
          className={cn(
            'relative h-[280px] overflow-hidden rounded-[16px] border border-[var(--fig-border-light)] bg-[var(--fig-ink)] sm:h-[320px]',
            imageFirst && 'lg:order-1'
          )}
        >
          {/* Development placeholder image (Figma sample); owner-replaceable via CMS. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
