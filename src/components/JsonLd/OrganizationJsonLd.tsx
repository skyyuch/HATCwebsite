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
    // What search engines use for the organisation logo. The wordmark, not the
    // square app icon — Google wants the logo itself, not a logo on a tile.
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/brand/hatc-logo.png`,
      width: 3065,
      height: 903
    },
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
