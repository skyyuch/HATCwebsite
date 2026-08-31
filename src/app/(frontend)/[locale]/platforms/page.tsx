import type {Metadata} from 'next';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {siteUrl, localeAlternates} from '@/lib/seo';
import PlatformsHero from '@/components/platforms/PlatformsHero';
import PlatformTypes from '@/components/platforms/PlatformTypes';
import PlatformFaq from '@/components/platforms/PlatformFaq';
import PlatformDisclaimer from '@/components/platforms/PlatformDisclaimer';

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'metadata.platforms'});

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `${siteUrl}/${locale}/platforms`,
      languages: localeAlternates('/platforms')
    }
  };
}

/**
 * Trading platforms page (Figma 89:4), rebuilt on the shared dark/gold system
 * (the Figma orange accent maps to HATC gold). Platform lineup is trimmed to the
 * owner-confirmed MT5 + HATC app + HATC web trader; product/feature claims are
 * converged to gold/silver and softened (no forex/oil/indices/1000+/copy-trading).
 * The global white Header + dark Footer frame the page (the Figma's own
 * nav/footer are dropped). Platform visuals are branded gradient placeholders —
 * the owner supplies real device screenshots later.
 */
export default async function PlatformsPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return (
    <>
      <PlatformsHero />
      <PlatformTypes />
      <PlatformFaq />
      <PlatformDisclaimer />
    </>
  );
}
