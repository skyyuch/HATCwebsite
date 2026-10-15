import {getTranslations} from 'next-intl/server';
import PageHeroBand from '@/components/common/PageHeroBand';

/**
 * Gold Academy page hero (Figma 98:33) — HATC-ised. The band itself (and why it
 * drops the Figma template's orange gradient, floating 3D coins and glow) now
 * lives in the shared `PageHeroBand`.
 */
export default async function AcademyHero() {
  const t = await getTranslations('academy');

  return (
    <PageHeroBand
      breadcrumbLabel={t('breadcrumb')}
      badge={t('hero.badge')}
      title={t('hero.title')}
      subtitle={t('hero.subtitle')}
    />
  );
}
