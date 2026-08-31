import type {Metadata} from 'next';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {siteUrl, localeAlternates} from '@/lib/seo';
import NewsList from '@/components/news/NewsList';

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'metadata.news'});

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `${siteUrl}/${locale}/news`,
      languages: localeAlternates('/news')
    }
  };
}

export default async function NewsPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return <NewsList />;
}
