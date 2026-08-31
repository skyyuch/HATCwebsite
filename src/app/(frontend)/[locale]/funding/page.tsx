import type {Metadata} from 'next';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {siteUrl, localeAlternates} from '@/lib/seo';
import FundingHero from '@/components/funding/FundingHero';
import FundingIntro from '@/components/funding/FundingIntro';
import FundingMethods from '@/components/funding/FundingMethods';
import SupportTopics from '@/components/funding/SupportTopics';
import Testimonials from '@/components/funding/Testimonials';
import FundingCta from '@/components/funding/FundingCta';

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'metadata.funding'});

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `${siteUrl}/${locale}/funding`,
      languages: localeAlternates('/funding')
    }
  };
}

/**
 * Deposits & withdrawals page — integrates Figma's two split frames (deposit
 * 75:5 + withdrawal 75:189) into one `/funding` page, rebuilt on the shared
 * dark/gold system (the Figma orange accent is mapped to HATC gold). One hero →
 * deposit intro + deposit channel table → withdrawal intro + withdrawal channel
 * table → shared support topics / testimonials / CTA. Channels, times and fees
 * are SAMPLE「示意數據」(CMS `funding-methods`, routed by `type`), NOT approved
 * facts or guarantees; testimonials come only from the CMS (`testimonials`) with
 * no fabricated seed (section hidden when empty). The global white Header + dark
 * Footer frame the page (the Figma's own nav/footer are dropped).
 */
export default async function FundingPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return (
    <>
      <FundingHero />
      <FundingIntro variant="deposit" />
      <FundingMethods variant="deposit" />
      <FundingIntro variant="withdraw" />
      <FundingMethods variant="withdraw" />
      <SupportTopics />
      <Testimonials />
      <FundingCta />
    </>
  );
}
