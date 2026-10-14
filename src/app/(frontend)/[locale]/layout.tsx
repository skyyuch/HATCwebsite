import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {hasLocale, NextIntlClientProvider} from 'next-intl';
import {getMessages, getTranslations, setRequestLocale} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import {siteUrl, siteIndexable, localeAlternates, SHARE_CARD} from '@/lib/seo';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import Analytics from '@/components/Analytics/Analytics';
import OrganizationJsonLd from '@/components/JsonLd/OrganizationJsonLd';
import {sora, inter, instrumentSerif, geist} from '@/lib/fonts';
import '@/styles/globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'common'});

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: t('brandFull'),
      template: `%s｜${t('brand')}`
    },
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: localeAlternates()
    },
    // Deliberately no `og:url`: a layout cannot know the current path, so it
    // could only point at the locale root — and scrapers treat `og:url` as the
    // canonical URL of what was shared, so every subpage would be reported as
    // the homepage. Without it they fall back to the fetched URL, which is
    // correct. Only add it in a page that can supply its own path.
    openGraph: {
      type: 'website',
      siteName: t('brandFull'),
      locale,
      images: [{...SHARE_CARD, alt: t('brandFull')}]
    },
    twitter: {
      card: 'summary_large_image',
      images: [{...SHARE_CARD, alt: t('brandFull')}]
    },
    // `robots.txt` alone does not stop an externally linked UAT URL from being
    // indexed, so non-production builds also emit a page-level noindex.
    robots: {index: siteIndexable, follow: siteIndexable}
  };
}

export default async function LocaleLayout({
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

  const t = await getTranslations('common');
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${sora.variable} ${inter.variable} ${instrumentSerif.variable} ${geist.variable}`}
    >
      <body>
        <NextIntlClientProvider messages={messages}>
          <a href="#main" className="skipLink">
            {t('skipToContent')}
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <OrganizationJsonLd />
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
