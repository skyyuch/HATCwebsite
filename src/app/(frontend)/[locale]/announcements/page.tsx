import type {Metadata} from 'next';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import AnnouncementsList from '@/components/announcements/AnnouncementsList';
import {siteUrl, localeAlternates} from '@/lib/seo';

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'metadata.announcements'});

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `${siteUrl}/${locale}/announcements`,
      languages: localeAlternates('/announcements')
    }
  };
}

export default async function AnnouncementsPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return <AnnouncementsList />;
}
