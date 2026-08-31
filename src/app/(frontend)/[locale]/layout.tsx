import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {hasLocale, NextIntlClientProvider} from 'next-intl';
import {getMessages, getTranslations, setRequestLocale} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import {siteUrl, localeAlternates} from '@/lib/seo';
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
    openGraph: {
      type: 'website',
      siteName: t('brandFull'),
      locale
    },
    robots: {index: true, follow: true}
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
