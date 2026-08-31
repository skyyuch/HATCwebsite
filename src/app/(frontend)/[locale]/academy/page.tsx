import type {Metadata} from 'next';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {siteUrl, localeAlternates} from '@/lib/seo';
import AcademyList from '@/components/academy/AcademyList';

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'metadata.academy'});

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `${siteUrl}/${locale}/academy`,
      languages: localeAlternates('/academy')
    }
  };
}

export default async function AcademyPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return <AcademyList />;
}
