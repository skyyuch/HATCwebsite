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
  const t = await getTranslations({locale, namespace: 'metadata.accountDeletion'});

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `${siteUrl}/${locale}/account-deletion`,
      languages: localeAlternates('/account-deletion')
    }
  };
}

/**
 * Account & data deletion. This is the URL filed in the Google Play Console
 * Data safety form, so it must stay publicly reachable without a login and must
 * not be folded into another page — see the governance note in
 * components/legal/LegalPage.tsx before editing the copy (`legal.accountDeletion`).
 */
export default async function AccountDeletionPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return <LegalPage doc="accountDeletion" />;
}
