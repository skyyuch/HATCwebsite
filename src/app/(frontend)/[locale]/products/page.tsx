import type {Metadata} from 'next';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {siteUrl, localeAlternates} from '@/lib/seo';
import ProductsHero from '@/components/products/ProductsHero/ProductsHero';
import ProductList from '@/components/products/ProductList/ProductList';
import TradingConditions from '@/components/products/TradingConditions/TradingConditions';
import ProductsCredibility from '@/components/products/ProductsCredibility/ProductsCredibility';
import ProductsCta from '@/components/products/ProductsCta/ProductsCta';

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'metadata.products'});

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `${siteUrl}/${locale}/products`,
      languages: localeAlternates('/products')
    }
  };
}

export default async function ProductsPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return (
    <>
      {/* Products / CFD page (owner 待辦5, 2026-08-10): dark/gold shared design
          system (no dedicated Figma). Presents the APPROVED spread/leverage
          facts (docs/HATC_FACTS.md) — gold & silver only, platinum excluded.
          Header/Footer are the global dark versions from [locale]/layout.tsx. */}
      <ProductsHero />
      <ProductList />
      <TradingConditions />
      <ProductsCredibility />
      <ProductsCta />
    </>
  );
}
