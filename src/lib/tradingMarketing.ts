import 'server-only';

import {unstable_cache} from 'next/cache';

import type {Locale} from '@/i18n/routing';
import {CACHE_TAGS} from '@/lib/cacheTags';
import {loadMessages, msgString, pickText} from '@/lib/copyPick';
import {getPayloadClient, hasDb} from '@/lib/payload';
import type {TradingPage as TradingPageDoc} from '@/payload-types';

export type TradingMarketing = {
  hero: {titleLine1: string; titleLine2: string; subtitle: string};
  services: {badge: string; heading: string; subtitle: string};
  accounts: {badge: string; heading: string; subtitle: string};
  pricing: {badge: string; heading: string; subtitle: string; cta: string};
  faq: {badge: string; heading: string; subtitle: string};
  cta: {heading: string; body: string};
};

async function fallbackTradingMarketing(
  locale: Locale
): Promise<TradingMarketing> {
  const m = await loadMessages(locale);
  return {
    hero: {
      titleLine1: msgString(m, 'trading.hero.titleLine1'),
      titleLine2: msgString(m, 'trading.hero.titleLine2'),
      subtitle: msgString(m, 'trading.hero.subtitle')
    },
    services: {
      badge: msgString(m, 'trading.services.badge'),
      heading: msgString(m, 'trading.services.heading'),
      subtitle: msgString(m, 'trading.services.subtitle')
    },
    accounts: {
      badge: msgString(m, 'trading.accounts.badge'),
      heading: msgString(m, 'trading.accounts.heading'),
      subtitle: msgString(m, 'trading.accounts.subtitle')
    },
    pricing: {
      badge: msgString(m, 'trading.pricing.badge'),
      heading: msgString(m, 'trading.pricing.heading'),
      subtitle: msgString(m, 'trading.pricing.subtitle'),
      cta: msgString(m, 'trading.pricing.cta')
    },
    faq: {
      badge: msgString(m, 'trading.faq.badge'),
      heading: msgString(m, 'trading.faq.heading'),
      subtitle: msgString(m, 'trading.faq.subtitle')
    },
    cta: {
      heading: msgString(m, 'trading.cta.heading'),
      body: msgString(m, 'trading.cta.body')
    }
  };
}

function mergeTrading(
  doc: TradingPageDoc,
  base: TradingMarketing
): TradingMarketing {
  return {
    hero: {
      titleLine1: pickText(doc.heroTitleLine1, base.hero.titleLine1),
      titleLine2: pickText(doc.heroTitleLine2, base.hero.titleLine2),
      subtitle: pickText(doc.heroSubtitle, base.hero.subtitle)
    },
    services: {
      badge: pickText(doc.servicesBadge, base.services.badge),
      heading: pickText(doc.servicesHeading, base.services.heading),
      subtitle: pickText(doc.servicesSubtitle, base.services.subtitle)
    },
    accounts: {
      badge: pickText(doc.accountsBadge, base.accounts.badge),
      heading: pickText(doc.accountsHeading, base.accounts.heading),
      subtitle: pickText(doc.accountsSubtitle, base.accounts.subtitle)
    },
    pricing: {
      badge: pickText(doc.pricingBadge, base.pricing.badge),
      heading: pickText(doc.pricingHeading, base.pricing.heading),
      subtitle: pickText(doc.pricingSubtitle, base.pricing.subtitle),
      cta: pickText(doc.pricingCta, base.pricing.cta)
    },
    faq: {
      badge: pickText(doc.faqBadge, base.faq.badge),
      heading: pickText(doc.faqHeading, base.faq.heading),
      subtitle: pickText(doc.faqSubtitle, base.faq.subtitle)
    },
    cta: {
      heading: pickText(doc.ctaHeading, base.cta.heading),
      body: pickText(doc.ctaBody, base.cta.body)
    }
  };
}

async function fetchTradingMarketing(
  locale: Locale
): Promise<TradingMarketing> {
  const base = await fallbackTradingMarketing(locale);
  try {
    const payload = await getPayloadClient();
    const doc = await payload.findGlobal({
      slug: 'trading-page',
      locale
    });
    return mergeTrading(doc, base);
  } catch {
    return base;
  }
}

const getTradingMarketingCached = unstable_cache(
  async (locale: Locale) => fetchTradingMarketing(locale),
  ['trading-page'],
  {tags: [CACHE_TAGS.tradingMarketing]}
);

/** /trading marketing copy: CMS overrides merged over i18n seeds. */
export async function getTradingMarketing(
  locale: Locale
): Promise<TradingMarketing> {
  if (!hasDb()) {
    return fallbackTradingMarketing(locale);
  }
  return getTradingMarketingCached(locale);
}
