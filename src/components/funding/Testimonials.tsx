import {getLocale} from 'next-intl/server';
import {getFundingMarketing} from '@/lib/fundingMarketing';
import {getTestimonials} from '@/lib/testimonials';
import type {Locale} from '@/i18n/routing';

/**
 * Client testimonials (Figma 75:305). White section.
 *
 * ⚠️ Governance red line: testimonials are real company facts and are NEVER
 * fabricated in code. Entries come solely from the `testimonials` CMS collection
 * (no i18n seed) — when empty (no DB / nothing published) this whole section is
 * hidden. Avatars use a gold initial placeholder until the owner supplies real
 * media.
 */
export default async function Testimonials() {
  const locale = (await getLocale()) as Locale;
  const items = await getTestimonials(locale);

  if (items.length === 0) {
    return null;
  }

  const marketing = await getFundingMarketing(locale);

  return (
    <section className="bg-white">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-12 px-6 py-20 sm:px-10 lg:px-[120px] lg:py-24">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-gold">
            {marketing.testimonials.kicker}
          </span>
          <h2 className="font-sans text-[clamp(1.7rem,3.5vw,2rem)] font-extrabold leading-[1.15] text-[var(--fig-heading-dark)]">
            {marketing.testimonials.heading}
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {items.map((item) => (
            <figure
              key={item.id}
              className="flex flex-col gap-6 rounded-[16px] bg-[var(--fig-light)] p-8"
            >
              <blockquote className="text-base leading-[1.6] text-[var(--fig-text-muted)]">
                {item.quote}
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="flex size-12 items-center justify-center rounded-full bg-gold/15 font-sans text-lg font-bold text-gold"
                >
                  {item.authorName.trim().charAt(0)}
                </span>
                <span className="flex flex-col">
                  <span className="font-sans text-[15px] font-bold text-[var(--fig-heading-dark)]">
                    {item.authorName}
                  </span>
                  {item.authorTitle ? (
                    <span className="text-[13px] text-[var(--fig-text-muted)]">
                      {item.authorTitle}
                    </span>
                  ) : null}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
