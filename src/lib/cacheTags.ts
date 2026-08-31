/** On-demand revalidation tags for CMS-backed readers (SSG + revalidateTag). */
export const CACHE_TAGS = {
  siteSettings: 'site-settings',
  homeActivities: 'home-activities',
  faqs: 'faqs',
  academyArticles: 'academy-articles',
  instruments: 'instruments',
  accountTiers: 'account-tiers',
  accountBenefits: 'account-benefits',
  accountSpreads: 'account-spreads',
  accountPlatforms: 'account-platforms',
  tradingPlatforms: 'trading-platforms',
  fundingMethods: 'funding-methods',
  testimonials: 'testimonials',
  homeMarketing: 'home-page',
  tradingMarketing: 'trading-page',
  aboutMarketing: 'about-page',
  productsMarketing: 'products-page',
  fundingMarketing: 'funding-page',
  platformsMarketing: 'platforms-page',
  sampleTradingConditions: 'sample-trading-conditions'
} as const;
