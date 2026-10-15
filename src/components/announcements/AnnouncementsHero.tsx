import {getTranslations} from 'next-intl/server';
import PageHeroBand from '@/components/common/PageHeroBand';

/**
 * `/announcements` hero — the shared `PageHeroBand` introduced for `/academy`,
 * so the content surfaces read as one system. `tight` keeps the band shorter
 * than the academy one, as in the original.
 */
export default async function AnnouncementsHero() {
  const t = await getTranslations('announcements');

  return (
    <PageHeroBand
      breadcrumbLabel={t('breadcrumb')}
      badge={t('hero.badge')}
      title={t('hero.title')}
      subtitle={t('hero.subtitle')}
      density="tight"
    />
  );
}
