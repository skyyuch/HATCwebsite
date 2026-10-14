import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {hasLocale, NextIntlClientProvider} from 'next-intl';
import {getMessages, setRequestLocale} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import {sora, inter, instrumentSerif, geist} from '@/lib/fonts';
import '@/styles/globals.css';

/**
 * Root layout for the chrome-less surfaces embedded in the HATC app / h5
 * webview: `/<locale>/embed/announcements`, `/embed/announcements/<slug>`,
 * `/embed/disclaimer`, `/embed/privacy` (第七十輪, dev-team request).
 *
 * WHY A SECOND ROOT LAYOUT RATHER THAN A `?embed=1` FLAG
 * The global Header/Footer are rendered once in `(frontend)/[locale]/layout.tsx`
 * and a nested layout cannot opt out of its parent's chrome — so the embedded
 * variant has to live in a sibling route group with its own root layout. A
 * query flag on the public URLs is not an option: layouts cannot read search
 * params at all (they do not re-render on navigation, so the value would go
 * stale — see node_modules/next/dist/docs → file-conventions/layout.md). It
 * could therefore only be honoured by moving Header/Footer into every page
 * (losing SSG and breaking the global-layout convention), or by hiding them
 * with client-side JS, which flashes the full site chrome inside the webview
 * before removing it.
 *
 * RED LINES for anything added under /embed:
 * - `noindex, nofollow` (set below, inherited by every embed page) and
 *   deliberately **no canonical**. These pages duplicate public ones, but a
 *   canonical next to a noindex is a contradictory signal and risks the
 *   noindex being applied to the canonical target — i.e. deindexing the real
 *   page. They are also kept out of `sitemap.ts` and nothing links to them.
 *   `robots.txt` stays permissive on purpose: a `Disallow` would stop crawlers
 *   from ever reading the `noindex`.
 * - No Header, Footer, breadcrumb, skip link or any other link that would
 *   navigate the webview out to the full site. In-page links stay under
 *   `/embed` (components take an `embed` flag for exactly this).
 * - Copy and data come from the same i18n messages and the same CMS
 *   collections as the public pages. Never fork the text for the app: the two
 *   legal documents are still pending owner/legal sign-off, and a second copy
 *   would drift away from both the website and that review.
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export const metadata: Metadata = {
  robots: {index: false, follow: false}
};

export default async function EmbedLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${sora.variable} ${inter.variable} ${instrumentSerif.variable} ${geist.variable}`}
    >
      {/*
        The base `body` background is the main site's warm white, which shows
        up as a second band under a short embedded page (a one-notice list
        barely fills a phone screen). Match the light surface these pages use
        instead, so the webview reads as one continuous sheet.
      */}
      <body className="min-h-dvh bg-[var(--fig-light)]">
        <NextIntlClientProvider messages={messages}>
          <main id="main">{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
