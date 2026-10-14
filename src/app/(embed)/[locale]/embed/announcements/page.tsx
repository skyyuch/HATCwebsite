import type {Metadata} from 'next';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import AnnouncementsList from '@/components/announcements/AnnouncementsList';

/** Embedded twin of `/announcements` — see the red lines in `../layout.tsx`. */
export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'metadata.announcements'});

  // No canonical / hreflang / Open Graph: the layout marks these pages
  // noindex, and they are not meant to be shared or indexed on their own.
  return {title: t('title'), description: t('description')};
}

export default async function EmbeddedAnnouncementsPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return <AnnouncementsList embed />;
}
