import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import EmbedPageTitle from '@/components/common/EmbedPageTitle';
import {company} from '@/content/company';
import {getSiteSettings} from '@/lib/siteSettings';

type LegalDoc = 'privacy' | 'disclaimer';

type Section = {heading: string; body: string[]};

/**
 * Shared layout for the two legal pages (`/privacy`, `/disclaimer`).
 *
 * ⚠️ GOVERNANCE — read before editing the copy (docs/HANDOFF.md 第五十六輪).
 *    The body text is a deliberately CONSERVATIVE draft derived from two things
 *    only: (a) what this site actually does — no analytics script is wired
 *    (components/Analytics is a null placeholder), no front-end form submits
 *    anything (the academy newsletter is an honest placeholder), and the only
 *    cookies are `NEXT_LOCALE` plus the admin-only `payload-lng` / login
 *    cookie; and (b) the approved facts in docs/HATC_FACTS.md.
 *
 *    It therefore states NO retention periods, NO named processors or hosting
 *    providers, NO governing-law / arbitration clause and NO compliance
 *    guarantee — none of those are owner-confirmed. Do NOT pad these pages with
 *    legal boilerplate; the owner and their legal adviser sign off first.
 *
 * Contact details are operational, so they come from CMS `SiteSettings` (never
 * hard-coded); the registered office is an approved fact and always shows.
 *
 * `embed` renders the app-webview variant (`/<locale>/embed/{privacy,
 * disclaimer}`): the breadcrumb is dropped because it links back out to the
 * full site, the navy hero collapses to a slim title row (the app has its own
 * title bar), and the link to the sibling document stays under `/embed`. Same
 * copy, same CMS contact details — see src/app/(embed)/[locale]/embed/layout.tsx.
 */
export default async function LegalPage({
  doc,
  embed = false
}: {
  doc: LegalDoc;
  embed?: boolean;
}) {
  const t = await getTranslations('legal');
  const footer = await getTranslations('home.footerV2');
  const nav = await getTranslations('nav');
  const common = await getTranslations('common');
  const footerFacts = await getTranslations('footer');
  const settings = await getSiteSettings();

  const title = footer(doc);
  const sections = t.raw(`${doc}.sections`) as Section[];
  // Company name and office address are localised; the English legal name is
  // appended only where it differs from the localised one.
  const legalName = common('brandFull');
  const address = footerFacts('address');
  const updated = `${t('updatedLabel')}：${t('updatedAt')}`;
  const siblingHref = `${embed ? '/embed' : ''}/${doc === 'privacy' ? 'disclaimer' : 'privacy'}`;

  return (
    <>
      {embed ? (
        <EmbedPageTitle title={title} meta={updated} />
      ) : (
        <>
          <nav
            aria-label={title}
            className="border-b border-[var(--fig-border-light)] bg-white"
          >
            <div className="mx-auto flex max-w-[1440px] items-center gap-2 px-6 py-5 text-[13px] text-[var(--fig-text-muted)] sm:px-10 lg:px-[120px]">
              <Link href="/" className="transition-colors hover:text-[#09395f]">
                {nav('home')}
              </Link>
              <span aria-hidden className="text-[var(--fig-border-light)]">
                ›
              </span>
              <span className="font-semibold text-[#0c111d]">{title}</span>
            </div>
          </nav>

          <section className="relative overflow-hidden bg-[linear-gradient(118deg,#0b1a2f_0%,#09395f_55%,#123a63_100%)]">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(115deg, transparent 0 46px, #d4af37 46px 47px)'
              }}
            />
            <div className="relative mx-auto flex max-w-[1440px] flex-col gap-3 px-6 py-14 sm:px-10 lg:px-[120px] lg:py-16">
              <h1 className="font-sans text-[clamp(1.9rem,4.5vw,2.75rem)] font-black leading-[1.15] text-white">
                {title}
              </h1>
              <p className="text-[14px] text-white/70">{updated}</p>
              <div
                aria-hidden
                className="mt-2 h-px w-full max-w-[1200px] bg-[linear-gradient(90deg,rgba(212,175,55,0.7),transparent)]"
              />
            </div>
          </section>
        </>
      )}

      <section className="bg-white">
        <div className="mx-auto max-w-[1440px] px-6 py-16 sm:px-10 lg:px-[120px] lg:py-20">
          <div className="flex max-w-[820px] flex-col gap-10">
            <p className="text-[17px] leading-[1.75] text-[var(--fig-text-muted)]">
              {t(`${doc}.intro`)}
            </p>

            <ol className="flex flex-col gap-10">
              {sections.map((section, i) => (
                <li key={section.heading} className="flex flex-col gap-3">
                  <h2 className="font-sans text-[20px] font-extrabold leading-[1.35] text-[var(--fig-heading-dark)]">
                    <span className="mr-2 text-gold">{i + 1}.</span>
                    {section.heading}
                  </h2>
                  {section.body.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-[15px] leading-[1.8] text-[var(--fig-text-muted)]"
                    >
                      {paragraph}
                    </p>
                  ))}
                </li>
              ))}
            </ol>

            <div className="flex flex-col gap-3 rounded-[12px] border border-[var(--fig-border-light)] bg-[var(--fig-light)] p-6 sm:p-8">
              <h2 className="font-sans text-[20px] font-extrabold text-[var(--fig-heading-dark)]">
                {t('contactHeading')}
              </h2>
              <p className="text-[15px] leading-[1.8] text-[var(--fig-text-muted)]">
                {t('contactBody')}
              </p>
              <dl className="flex flex-col gap-2 text-[15px]">
                <div className="flex flex-wrap gap-x-2">
                  <dt className="text-[var(--fig-text-muted)]">
                    {t('contactCompany')}
                  </dt>
                  <dd className="font-semibold text-[var(--fig-heading-dark)]">
                    {legalName === company.legalNameEn
                      ? legalName
                      : `${legalName}（${company.legalNameEn}）`}
                  </dd>
                </div>
                <div className="flex flex-wrap gap-x-2">
                  <dt className="text-[var(--fig-text-muted)]">
                    {t('contactAddress')}
                  </dt>
                  <dd className="font-semibold text-[var(--fig-heading-dark)]">
                    {address}
                  </dd>
                </div>
                {settings.email ? (
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="text-[var(--fig-text-muted)]">
                      {t('contactEmail')}
                    </dt>
                    <dd className="font-semibold text-[var(--fig-heading-dark)]">
                      <a
                        href={`mailto:${settings.email}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {settings.email}
                      </a>
                    </dd>
                  </div>
                ) : null}
                {settings.phone ? (
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="text-[var(--fig-text-muted)]">
                      {t('contactPhone')}
                    </dt>
                    <dd className="font-semibold text-[var(--fig-heading-dark)]">
                      <a
                        href={`tel:${settings.phone}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {settings.phone}
                      </a>
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>

            <p className="text-[13px] leading-[1.7] text-[var(--fig-text-muted)]">
              <Link
                href={siblingHref}
                className="font-semibold text-gold underline-offset-4 hover:underline"
              >
                {footer(doc === 'privacy' ? 'disclaimer' : 'privacy')}
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
