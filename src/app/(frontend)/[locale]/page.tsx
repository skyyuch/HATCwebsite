import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import {getTranslations} from 'next-intl/server';
import {siteUrl, localeAlternates} from '@/lib/seo';
import Hero from '@/components/home/Hero/Hero';
import TrustStrip from '@/components/home/TrustStrip/TrustStrip';
import Services from '@/components/home/Services/Services';
import MT5Showcase from '@/components/home/MT5Showcase/MT5Showcase';
import WhyHATC from '@/components/home/WhyHATC/WhyHATC';
import Academy from '@/components/home/Academy/Academy';
import LatestNews from '@/components/home/LatestNews/LatestNews';
import CompanyStory from '@/components/home/CompanyStory/CompanyStory';
import ClientSupport from '@/components/home/ClientSupport/ClientSupport';
import FinalCta from '@/components/home/FinalCta/FinalCta';

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'metadata.home'});

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: localeAlternates()
    }
  };
}

export default async function HomePage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return (
    <>
      {/* Figma-led homepage rebuild (owner 2026-08-10) — 100% restoration of
          Figma frame 4:4. Dark trading-desk theme with light sections
          interleaved. Section order matches docs/FIGMA_HOMEPAGE_SPEC.md §2.
          The FinalCta band + global Footer close the page. */}
      <Hero />
      <TrustStrip />
      <Services />
      <MT5Showcase />
      <WhyHATC />
      <Academy />
      {/* CMS Phase 2: news/activities teaser (not in Figma 4:4; light band). */}
      <LatestNews />
      <CompanyStory />
      <ClientSupport />
      <FinalCta />
    </>
  );
}
