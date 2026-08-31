import type {Metadata} from 'next';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {siteUrl, localeAlternates} from '@/lib/seo';
import TradingHero from '@/components/trading/TradingHero/TradingHero';
import TradingServices from '@/components/trading/TradingServices/TradingServices';
import AccountComparison from '@/components/trading/AccountComparison/AccountComparison';
import TradingTrust from '@/components/trading/TradingTrust/TradingTrust';
import PricingConditions from '@/components/trading/PricingConditions/PricingConditions';
import TradingFaq from '@/components/trading/TradingFaq/TradingFaq';
import TradingCta from '@/components/trading/TradingCta/TradingCta';

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'metadata.trading'});

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `${siteUrl}/${locale}/trading`,
      languages: localeAlternates('/trading')
    }
  };
}

export default async function TradingPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return (
    <>
      {/* Gold-trading overview ("概覽", owner 2026-08-10, Figma frame 44:4). This
          page uses the LIGHT navy/gold system (white body, Instrument Serif +
          Geist, --trd-* tokens) — a faithful reproduction of the Figma, distinct
          from the dark homepage/About/products. The global white Header + dark
          Footer frame it. Account/pricing tables are labelled sample data; FAQ
          operational claims were softened. See docs/HANDOFF.md 第十八輪. */}
      <TradingHero />
      <TradingServices />
      <AccountComparison />
      <TradingTrust />
      <PricingConditions />
      <TradingFaq />
      <TradingCta />
    </>
  );
}
