import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import LegalPage from '@/components/legal/LegalPage';
import {localeAlternates, siteUrl} from '@/lib/seo';

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'metadata.privacy'});

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `${siteUrl}/${locale}/privacy`,
      languages: localeAlternates('/privacy')
    }
  };
}

/**
 * Privacy policy. Copy lives in `legal.privacy` and is a conservative draft —
 * see the governance note in components/legal/LegalPage.tsx before editing.
 */
export default async function PrivacyPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return <LegalPage doc="privacy" />;
}
