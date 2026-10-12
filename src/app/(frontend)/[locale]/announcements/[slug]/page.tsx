import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import AnnouncementView from '@/components/announcements/AnnouncementView';
import {
  getAnnouncementBySlug,
  getAnnouncementSlugs
} from '@/lib/announcements';
import {siteUrl, localeAlternates} from '@/lib/seo';
import type {Locale} from '@/i18n/routing';

export async function generateStaticParams() {
  const slugs = await getAnnouncementSlugs();
  return slugs.map((slug) => ({slug}));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string; slug: string}>;
}): Promise<Metadata> {
  const {locale, slug} = await params;
  const announcement = await getAnnouncementBySlug(locale as Locale, slug);
  const t = await getTranslations({locale, namespace: 'metadata.announcements'});

  if (!announcement) {
    return {title: t('title'), description: t('description')};
  }

  const description = announcement.excerpt || t('description');
  const path = `/announcements/${announcement.slug}`;

  return {
    title: announcement.title,
    description,
    alternates: {
      canonical: `${siteUrl}/${locale}${path}`,
      languages: localeAlternates(path)
    },
    openGraph: {
      title: announcement.title,
      description,
      type: 'article'
    }
  };
}

export default async function AnnouncementPage({
  params
}: {
  params: Promise<{locale: string; slug: string}>;
}) {
  const {locale, slug} = await params;
  setRequestLocale(locale);

  const announcement = await getAnnouncementBySlug(locale as Locale, slug);
  if (!announcement) {
    notFound();
  }

  return <AnnouncementView announcement={announcement} locale={locale} />;
}
