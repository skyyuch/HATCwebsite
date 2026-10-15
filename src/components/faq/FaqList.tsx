import {getLocale, getTranslations} from 'next-intl/server';
import {ChevronDown} from 'lucide-react';
import EmbedPageTitle from '@/components/common/EmbedPageTitle';
import PageHeroBand from '@/components/common/PageHeroBand';
import {getAllFaqs} from '@/lib/faqs';
import {getSiteSettings, primaryContactHref} from '@/lib/siteSettings';
import type {Locale} from '@/i18n/routing';

/**
 * `/faq` — one page gathering every FAQ category the CMS holds (第七十二輪,
 * owner request: a FAQ page reachable from the 關於 HATC menu).
 *
 * It is a second *presentation* of the same `faqs` collection the inline
 * sections on `/trading`, `/accounts` and `/platforms` render — not a copy. The
 * owner decided those sections stay, so a question edited in the CMS changes
 * both surfaces at once; there is no separate FAQ content to keep in sync.
 *
 * Headings come from `faq.categories.*`, keyed by the category ids in
 * `src/lib/faqs.ts` — see the warning there before adding a category.
 *
 * Everything renders on the server: the whole list ships in the prerendered
 * HTML (● SSG, and the questions are indexable even while collapsed), and the
 * category links are plain in-page anchors, so the page needs no JavaScript.
 *
 * `embed` renders the app-webview variant (`/<locale>/embed/faq`): the hero
 * collapses to a slim title row and the closing customer-service card is
 * dropped — it is an operational CMS link that would take the webview out of
 * the app, which already has its own support entry. See
 * src/app/(embed)/[locale]/embed/layout.tsx.
 */
export default async function FaqList({embed = false}: {embed?: boolean}) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('faq');
  const common = await getTranslations('common');

  const [groups, settings] = await Promise.all([
    getAllFaqs(locale),
    getSiteSettings()
  ]);
  // Operational link → CMS only. No destination = no button (site-wide rule).
  const contactHref = embed ? null : primaryContactHref(settings);

  return (
    <>
      {embed ? (
        <EmbedPageTitle title={t('hero.title')} />
      ) : (
        <PageHeroBand
          breadcrumbLabel={t('breadcrumb')}
          badge={t('hero.badge')}
          title={t('hero.title')}
          subtitle={t('hero.subtitle')}
          density="tight"
        />
      )}

      <section className="bg-[var(--fig-light)]">
        <div className="mx-auto w-full max-w-[1440px] px-6 py-16 sm:px-10 lg:px-[120px] lg:py-20">
          <div className="mx-auto flex w-full max-w-[900px] flex-col gap-10">
            {groups.length === 0 ? (
              <p className="text-[15px] text-[var(--fig-text-muted)]">
                {t('empty')}
              </p>
            ) : null}

            {groups.length > 1 ? (
              <nav aria-label={t('jumpLabel')} className="flex flex-wrap gap-2">
                {groups.map(({category}) => (
                  <a
                    key={category}
                    href={`#faq-${category}`}
                    className="rounded-full border border-[var(--fig-border-light)] bg-white px-4 py-2 text-[13px] font-semibold text-[var(--fig-heading-dark)] transition-colors hover:border-[#09395f] hover:text-[#09395f]"
                  >
                    {t(`categories.${category}`)}
                  </a>
                ))}
              </nav>
            ) : null}

            {groups.map(({category, items}) => (
              <section
                key={category}
                id={`faq-${category}`}
                className="flex scroll-mt-20 flex-col gap-4"
              >
                {/*
                  20px, matching the section headings on the legal pages: in the
                  embed variant the page title is 22px, so a 22px group heading
                  would flatten the hierarchy.
                */}
                <h2 className="font-sans text-[20px] font-extrabold leading-[1.35] text-[var(--fig-heading-dark)]">
                  {t(`categories.${category}`)}
                </h2>

                {items.map((item) => (
                  <details
                    key={item.id}
                    className="group rounded-[8px] border border-[var(--fig-border-light)] bg-white p-6"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
                      <span className="text-base font-bold text-[var(--fig-heading-dark)]">
                        {item.question}
                      </span>
                      <ChevronDown
                        className="size-[18px] shrink-0 text-[var(--fig-heading-dark)] transition-transform duration-200 group-open:rotate-180"
                        aria-hidden
                      />
                    </summary>
                    <p className="mt-3 whitespace-pre-line text-sm leading-[1.6] text-[var(--fig-text-muted)]">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </section>
            ))}

            {contactHref ? (
              <div className="flex flex-col gap-3 rounded-[12px] border border-[var(--fig-border-light)] bg-white p-6 sm:p-8">
                <h2 className="font-sans text-[20px] font-extrabold text-[var(--fig-heading-dark)]">
                  {t('help.heading')}
                </h2>
                <p className="text-[15px] leading-[1.8] text-[var(--fig-text-muted)]">
                  {t('help.body')}
                </p>
                <a
                  href={contactHref}
                  className="w-fit font-semibold text-gold underline-offset-4 hover:underline"
                >
                  {common('contactUs')}
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
