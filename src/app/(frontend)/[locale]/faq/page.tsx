import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import FaqList from '@/components/faq/FaqList';
import {siteUrl, localeAlternates} from '@/lib/seo';

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'metadata.faq'});

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `${siteUrl}/${locale}/faq`,
      languages: localeAlternates('/faq')
    }
  };
}

export default async function FaqPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return <FaqList />;
}
