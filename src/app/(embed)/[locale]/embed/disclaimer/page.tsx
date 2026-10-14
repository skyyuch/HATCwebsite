import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import LegalPage from '@/components/legal/LegalPage';

/**
 * Embedded twin of `/disclaimer` — see the red lines in `../layout.tsx`.
 * The copy is the same `legal.disclaimer` draft the public page renders and is
 * still pending owner/legal sign-off; do not fork it for the app.
 */
export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'metadata.disclaimer'});

  return {title: t('title'), description: t('description')};
}

export default async function EmbeddedDisclaimerPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return <LegalPage doc="disclaimer" embed />;
}
