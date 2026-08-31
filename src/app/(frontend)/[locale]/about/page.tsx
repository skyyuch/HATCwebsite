import type {Metadata} from 'next';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {siteUrl, localeAlternates} from '@/lib/seo';
import AboutHero from '@/components/about/AboutHero/AboutHero';
import CompanyIdentity from '@/components/about/CompanyIdentity/CompanyIdentity';
import Credentials from '@/components/about/Credentials/Credentials';
import Principles from '@/components/about/Principles/Principles';
import Timeline from '@/components/about/Timeline/Timeline';
import HongKongConnection from '@/components/about/HongKongConnection/HongKongConnection';
import CredentialsGallery from '@/components/about/CredentialsGallery/CredentialsGallery';
import AboutCta from '@/components/about/AboutCta/AboutCta';

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'metadata.about'});

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `${siteUrl}/${locale}/about`,
      languages: localeAlternates('/about')
    }
  };
}

export default async function AboutPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return (
    <>
      {/* Figma-led dark About page (owner 2026-08-10), matching frame 12:4.
          Section order per docs/FIGMA_ABOUT_SPEC.md §5. Header/Footer are the
          global dark versions injected by [locale]/layout.tsx. */}
      <AboutHero />
      <CompanyIdentity />
      <Credentials />
      <Principles />
      <Timeline />
      <HongKongConnection />
      <CredentialsGallery />
      <AboutCta />
    </>
  );
}
