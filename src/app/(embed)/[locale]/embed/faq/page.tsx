import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import FaqList from '@/components/faq/FaqList';

/**
 * Embedded twin of `/faq` — see the red lines in `../layout.tsx`.
 * Same `faqs` collection, same i18n copy as the public page; do not fork it.
 */
export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'metadata.faq'});

  return {title: t('title'), description: t('description')};
}

export default async function EmbeddedFaqPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return <FaqList embed />;
}
