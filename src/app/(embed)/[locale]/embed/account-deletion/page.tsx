import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import LegalPage from '@/components/legal/LegalPage';

/**
 * Embedded twin of `/account-deletion` — see the red lines in `../layout.tsx`.
 *
 * This is the in-app half of Google Play's account deletion requirement: the
 * app links here so a user can start the request without leaving it, while the
 * public page covers users who already uninstalled. Same `legal.accountDeletion`
 * copy, deliberately — do not fork it for the app.
 */
export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'metadata.accountDeletion'});

  return {title: t('title'), description: t('description')};
}

export default async function EmbeddedAccountDeletionPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return <LegalPage doc="accountDeletion" embed />;
}
