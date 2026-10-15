/**
 * Slim title row for the `/embed/*` webview twins (第七十輪 red lines in
 * `src/app/(embed)/[locale]/embed/layout.tsx`).
 *
 * The public pages open with a breadcrumb plus a navy hero band; inside the app
 * neither belongs — the breadcrumb links back out to the full site and the app
 * supplies its own title bar, so a full hero would stack three titles. This
 * keeps one `<h1>` for document structure and nothing else.
 *
 * Shared by `LegalPage` and `/embed/faq` (第七十二輪). Announcements
 * deliberately does not use it: that list already has its own heading, which
 * becomes the page's `<h1>` when the hero is dropped.
 */
export default function EmbedPageTitle({
  title,
  meta
}: {
  title: string;
  /** Small supporting line, e.g. the legal pages' "last updated". */
  meta?: string;
}) {
  return (
    <header className="border-b border-[var(--fig-border-light)] bg-white">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-1.5 px-6 py-7 sm:px-10 lg:px-[120px]">
        <h1 className="font-sans text-[22px] font-extrabold leading-[1.3] text-[var(--fig-heading-dark)]">
          {title}
        </h1>
        {meta ? (
          <p className="text-[13px] text-[var(--fig-text-muted)]">{meta}</p>
        ) : null}
      </div>
    </header>
  );
}
