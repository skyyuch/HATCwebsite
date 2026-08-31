import 'server-only';

import {unstable_cache} from 'next/cache';

import type {Locale} from '@/i18n/routing';
import {CACHE_TAGS} from '@/lib/cacheTags';
import {loadMessages, msgString, pickText} from '@/lib/copyPick';
import {getPayloadClient, hasDb} from '@/lib/payload';
import type {ProductsPage as ProductsPageDoc} from '@/payload-types';

export type ProductsMarketing = {
  hero: {
    titleLead: string;
    titleAccent: string;
    titleTail: string;
    subtitle: string;
  };
  list: {kicker: string; heading: string; subheading: string};
  conditions: {kicker: string; heading: string};
  credibility: {kicker: string; heading: string};
  cta: {heading: string; body: string};
};

async function fallbackProductsMarketing(
  locale: Locale
): Promise<ProductsMarketing> {
  const m = await loadMessages(locale);
  return {
    hero: {
      titleLead: msgString(m, 'products.hero.titleLead'),
      titleAccent: msgString(m, 'products.hero.titleAccent'),
      titleTail: msgString(m, 'products.hero.titleTail'),
      subtitle: msgString(m, 'products.hero.subtitle')
    },
    list: {
      kicker: msgString(m, 'products.list.kicker'),
      heading: msgString(m, 'products.list.heading'),
      subheading: msgString(m, 'products.list.subheading')
    },
    conditions: {
      kicker: msgString(m, 'products.conditions.kicker'),
      heading: msgString(m, 'products.conditions.heading')
    },
    credibility: {
      kicker: msgString(m, 'products.credibility.kicker'),
      heading: msgString(m, 'products.credibility.heading')
    },
    cta: {
      heading: msgString(m, 'products.cta.heading'),
      body: msgString(m, 'products.cta.body')
    }
  };
}

function mergeProducts(
  doc: ProductsPageDoc,
  base: ProductsMarketing
): ProductsMarketing {
  return {
    hero: {
      titleLead: pickText(doc.heroTitleLead, base.hero.titleLead),
      titleAccent: pickText(doc.heroTitleAccent, base.hero.titleAccent),
      titleTail: pickText(doc.heroTitleTail, base.hero.titleTail),
      subtitle: pickText(doc.heroSubtitle, base.hero.subtitle)
    },
    list: {
      kicker: pickText(doc.listKicker, base.list.kicker),
      heading: pickText(doc.listHeading, base.list.heading),
      subheading: pickText(doc.listSubheading, base.list.subheading)
    },
    conditions: {
      kicker: pickText(doc.conditionsKicker, base.conditions.kicker),
      heading: pickText(doc.conditionsHeading, base.conditions.heading)
    },
    credibility: {
      kicker: pickText(doc.credibilityKicker, base.credibility.kicker),
      heading: pickText(doc.credibilityHeading, base.credibility.heading)
    },
    cta: {
      heading: pickText(doc.ctaHeading, base.cta.heading),
      body: pickText(doc.ctaBody, base.cta.body)
    }
  };
}

async function fetchProductsMarketing(
  locale: Locale
): Promise<ProductsMarketing> {
  const base = await fallbackProductsMarketing(locale);
  try {
    const payload = await getPayloadClient();
    const doc = await payload.findGlobal({
      slug: 'products-page',
      locale
    });
    return mergeProducts(doc, base);
  } catch {
    return base;
  }
}

const getProductsMarketingCached = unstable_cache(
  async (locale: Locale) => fetchProductsMarketing(locale),
  ['products-page'],
  {tags: [CACHE_TAGS.productsMarketing]}
);

/**
 * /products marketing copy only. Approved spreads/leverage stay in
 * `tradingConditions.ts` — never merged from CMS.
 */
export async function getProductsMarketing(
  locale: Locale
): Promise<ProductsMarketing> {
  if (!hasDb()) {
    return fallbackProductsMarketing(locale);
  }
  return getProductsMarketingCached(locale);
}
