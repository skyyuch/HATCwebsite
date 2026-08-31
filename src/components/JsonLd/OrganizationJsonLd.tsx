import {company} from '@/content/company';
import {siteUrl} from '@/lib/seo';

/** Organization structured data. Facts sourced from docs/HATC_FACTS.md. */
export default function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.legalNameEn,
    legalName: company.legalNameZh,
    alternateName: company.legalNameZh,
    url: siteUrl,
    address: {
      '@type': 'PostalAddress',
      streetAddress: company.addressEn,
      addressLocality: 'Kowloon',
      addressRegion: 'Hong Kong',
      addressCountry: 'HK'
    },
    memberOf: {
      '@type': 'Organization',
      name: company.exchangeZh
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{__html: JSON.stringify(data)}}
    />
  );
}
