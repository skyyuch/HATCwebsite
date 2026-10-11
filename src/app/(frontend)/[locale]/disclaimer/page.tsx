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
  const t = await getTranslations({locale, namespace: 'metadata.disclaimer'});

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `${siteUrl}/${locale}/disclaimer`,
      languages: localeAlternates('/disclaimer')
    }
  };
}

/**
 * Site disclaimer. Copy lives in `legal.disclaimer` and reuses the approved
 * risk / third-party-payment wording already on /platforms and /funding — see
 * the governance note in components/legal/LegalPage.tsx before editing.
 */
export default async function DisclaimerPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return <LegalPage doc="disclaimer" />;
}
