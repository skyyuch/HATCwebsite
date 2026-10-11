/** On-demand revalidation tags for CMS-backed readers (SSG + revalidateTag). */
export const CACHE_TAGS = {
  siteSettings: 'site-settings',
  homeActivities: 'home-activities',
  faqs: 'faqs',
  academyArticles: 'academy-articles',
  instruments: 'instruments',
  accountBenefits: 'account-benefits',
  tradingPlatforms: 'trading-platforms',
  fundingMethods: 'funding-methods',
  testimonials: 'testimonials',
  homeMarketing: 'home-page',
  tradingMarketing: 'trading-page',
  aboutMarketing: 'about-page',
  productsMarketing: 'products-page',
  fundingMarketing: 'funding-page',
  platformsMarketing: 'platforms-page'
} as const;
