import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';

/**
 * Shared title band for the content surfaces that sit under the white global
 * header: a white breadcrumb bar above a restrained navy→gold gradient section.
 *
 * Extracted in 第七十二輪, when `/faq` would have become the **third** verbatim
 * copy of it — `AcademyHero` and `AnnouncementsHero` were identical apart from
 * the i18n namespace and the vertical padding. Both now render this.
 *
 * The decoration is deliberately restrained: a faint diagonal hairline pattern,
 * one soft radial tint and a gold rule. The Figma originals (Vantage templates)
 * had an orange gradient with floating 3D coins, glowing gold bars and bokeh —
 * all on the Never-use list in `docs/DESIGN_DIRECTION.md`.
 *
 * ⚠️ `LegalPage` keeps its own version on purpose: it has no badge, shows an
 * "updated at" line instead of a subtitle, omits the radial tint and uses a
 * smaller title. Folding those four differences in here would cost more props
 * than the duplication saves. Its slim embed header, however, is shared —
 * see `EmbedPageTitle`.
 */
export default async function PageHeroBand({
  breadcrumbLabel,
  badge,
  title,
  subtitle,
  density = 'default'
}: {
  /** Accessible name of the breadcrumb nav (e.g. 公告導覽). */
  breadcrumbLabel: string;
  badge: string;
  title: string;
  subtitle: string;
  /** `tight` trims the band for shorter pages (announcements, FAQ). */
  density?: 'default' | 'tight';
}) {
  const nav = await getTranslations('nav');

  return (
    <>
      <nav
        aria-label={breadcrumbLabel}
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
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.18),transparent_65%)]"
        />

        <div
          className={`relative mx-auto flex max-w-[1440px] flex-col gap-4 px-6 sm:px-10 lg:px-[120px] ${
            density === 'tight' ? 'py-14 lg:py-16' : 'py-16 lg:py-20'
          }`}
        >
          <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-[12px] font-bold uppercase tracking-[0.14em] text-gold ring-1 ring-[rgba(212,175,55,0.4)]">
            {badge}
          </span>
          <h1 className="font-sans text-[clamp(2rem,5vw,3rem)] font-black leading-[1.15] text-white">
            {title}
          </h1>
          <p className="max-w-[720px] text-[18px] leading-[1.6] text-white/80">
            {subtitle}
          </p>
          <div
            aria-hidden
            className="mt-2 h-px w-full max-w-[1200px] bg-[linear-gradient(90deg,rgba(212,175,55,0.7),transparent)]"
          />
        </div>
      </section>
    </>
  );
}
