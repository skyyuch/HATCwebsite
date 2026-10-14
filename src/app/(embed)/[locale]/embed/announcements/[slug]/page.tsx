import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import AnnouncementView from '@/components/announcements/AnnouncementView';
import {
  getAnnouncementBySlug,
  getAnnouncementSlugs
} from '@/lib/announcements';
import type {Locale} from '@/i18n/routing';

/**
 * Embedded twin of `/announcements/[slug]` — see the red lines in
 * `../../layout.tsx`.
 *
 * `dynamicParams` stays at its default (true), so a notice published after the
 * build renders on demand instead of 404ing — the app must not need a redeploy
 * to show a new announcement.
 */
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

  return {
    title: announcement.title,
    description: announcement.excerpt || t('description')
  };
}

export default async function EmbeddedAnnouncementPage({
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

  return <AnnouncementView announcement={announcement} locale={locale} embed />;
}
