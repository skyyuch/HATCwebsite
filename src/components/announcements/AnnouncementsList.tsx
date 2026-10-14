import {getLocale} from 'next-intl/server';
import AnnouncementFeed from '@/components/announcements/AnnouncementFeed';
import AnnouncementsHero from '@/components/announcements/AnnouncementsHero';
import {getAnnouncementCategories, getAnnouncements} from '@/lib/announcements';
import type {Locale} from '@/i18n/routing';

/**
 * `/announcements` body: hero + CMS-driven notice feed. Reads on the server so
 * the whole list ships in the prerendered HTML (SSG); filtering/pagination are
 * client-side over that set.
 *
 * `embed` renders the app-webview variant (`/<locale>/embed/announcements`):
 * the hero is dropped — it carries a breadcrumb back to the full site, and the
 * app supplies its own title bar — which leaves the feed's own heading as the
 * page's h1. See src/app/(embed)/[locale]/embed/layout.tsx.
 */
export default async function AnnouncementsList({
  embed = false
}: {
  embed?: boolean;
}) {
  const locale = (await getLocale()) as Locale;
  const [items, categories] = await Promise.all([
    getAnnouncements(locale),
    getAnnouncementCategories(locale)
  ]);

  return (
    <>
      {embed ? null : <AnnouncementsHero />}
      <AnnouncementFeed items={items} categories={categories} embed={embed} />
    </>
  );
}
