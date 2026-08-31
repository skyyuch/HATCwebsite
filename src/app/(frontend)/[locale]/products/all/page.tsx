import type {Metadata} from 'next';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {siteUrl, localeAlternates} from '@/lib/seo';
import AllInstrumentsHero from '@/components/products/AllInstruments/AllInstrumentsHero';
import AllInstrumentsTable from '@/components/products/AllInstruments/AllInstrumentsTable';
import ProductsCta from '@/components/products/ProductsCta/ProductsCta';

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'metadata.productsAll'});

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `${siteUrl}/${locale}/products/all`,
      languages: localeAlternates('/products/all')
    }
  };
}

/**
 * All tradeable products (Vantage-style instrument table). Rows are CMS-editable
 * via the `instruments` collection with an i18n SAMPLE fallback — table figures
 * stay clearly labelled「示意數據」; approved figures live on `/products`.
 * Shares the /products dark/gold system (dark hero + light table + CTA band).
 */
export default async function AllProductsPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return (
    <>
      <AllInstrumentsHero />
      <AllInstrumentsTable />
      <ProductsCta />
    </>
  );
}
