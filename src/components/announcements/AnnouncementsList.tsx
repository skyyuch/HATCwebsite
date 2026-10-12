import {getLocale} from 'next-intl/server';
import AnnouncementFeed from '@/components/announcements/AnnouncementFeed';
import AnnouncementsHero from '@/components/announcements/AnnouncementsHero';
import {getAnnouncementCategories, getAnnouncements} from '@/lib/announcements';
import type {Locale} from '@/i18n/routing';

/**
 * `/announcements` body: hero + CMS-driven notice feed. Reads on the server so
 * the whole list ships in the prerendered HTML (SSG); filtering/pagination are
 * client-side over that set.
 */
export default async function AnnouncementsList() {
  const locale = (await getLocale()) as Locale;
  const [items, categories] = await Promise.all([
    getAnnouncements(locale),
    getAnnouncementCategories(locale)
  ]);

  return (
    <>
      <AnnouncementsHero />
      <AnnouncementFeed items={items} categories={categories} />
    </>
  );
}
