import 'server-only';

import {unstable_cache} from 'next/cache';

import type {Locale} from '@/i18n/routing';
import {CACHE_TAGS} from '@/lib/cacheTags';
import {loadMessages, msgString, pickText} from '@/lib/copyPick';
import {getPayloadClient, hasDb} from '@/lib/payload';
import type {FundingPage as FundingPageDoc} from '@/payload-types';

/** Chrome for one funding direction (deposit / withdraw): intro + methods table. */
export type FundingSectionCopy = {
  introHeading: string;
  introBody: string;
  kicker: string;
  heading: string;
  note: string;
};

export type FundingMarketing = {
  hero: {
    titleLead: string;
    titleAccent: string;
    titleTail: string;
    subtitle: string;
  };
  deposit: FundingSectionCopy;
  withdraw: FundingSectionCopy;
  topics: {kicker: string; heading: string; subtitle: string};
  testimonials: {kicker: string; heading: string; subtitle: string};
  cta: {heading: string; body: string};
  /** CMS-uploaded background images; undefined = component uses a built-in placeholder. */
  images: {hero?: string; deposit?: string; withdraw?: string; cta?: string};
};

/** Extract a usable URL from a Payload upload field (populated object or empty). */
function mediaUrl(value: unknown): string | undefined {
  if (value && typeof value === 'object' && 'url' in value) {
    const url = (value as {url?: unknown}).url;
    if (typeof url === 'string' && url.trim()) return url;
  }
  return undefined;
}

async function fallbackFundingMarketing(
  locale: Locale
): Promise<FundingMarketing> {
  const m = await loadMessages(locale);
  return {
    hero: {
      titleLead: msgString(m, 'funding.hero.titleLead'),
      titleAccent: msgString(m, 'funding.hero.titleAccent'),
      titleTail: msgString(m, 'funding.hero.titleTail'),
      subtitle: msgString(m, 'funding.hero.subtitle')
    },
    deposit: {
      introHeading: msgString(m, 'funding.deposit.intro.heading'),
      introBody: msgString(m, 'funding.deposit.intro.body'),
      kicker: msgString(m, 'funding.deposit.kicker'),
      heading: msgString(m, 'funding.deposit.heading'),
      note: msgString(m, 'funding.deposit.note')
    },
    withdraw: {
      introHeading: msgString(m, 'funding.withdraw.intro.heading'),
      introBody: msgString(m, 'funding.withdraw.intro.body'),
      kicker: msgString(m, 'funding.withdraw.kicker'),
      heading: msgString(m, 'funding.withdraw.heading'),
      note: msgString(m, 'funding.withdraw.note')
    },
    topics: {
      kicker: msgString(m, 'funding.topics.kicker'),
      heading: msgString(m, 'funding.topics.heading'),
      subtitle: msgString(m, 'funding.topics.subtitle')
    },
    testimonials: {
      kicker: msgString(m, 'funding.testimonials.kicker'),
      heading: msgString(m, 'funding.testimonials.heading'),
      subtitle: msgString(m, 'funding.testimonials.subtitle')
    },
    cta: {
      heading: msgString(m, 'funding.cta.heading'),
      body: msgString(m, 'funding.cta.body')
    },
    images: {}
  };
}

function mergeFunding(
  doc: FundingPageDoc,
  base: FundingMarketing
): FundingMarketing {
  return {
    hero: {
      titleLead: pickText(doc.heroTitleLead, base.hero.titleLead),
      titleAccent: pickText(doc.heroTitleAccent, base.hero.titleAccent),
      titleTail: pickText(doc.heroTitleTail, base.hero.titleTail),
      subtitle: pickText(doc.heroSubtitle, base.hero.subtitle)
    },
    deposit: {
      introHeading: pickText(doc.depositIntroHeading, base.deposit.introHeading),
      introBody: pickText(doc.depositIntroBody, base.deposit.introBody),
      kicker: pickText(doc.depositMethodsKicker, base.deposit.kicker),
      heading: pickText(doc.depositMethodsHeading, base.deposit.heading),
      note: pickText(doc.depositMethodsNote, base.deposit.note)
    },
    withdraw: {
      introHeading: pickText(doc.withdrawIntroHeading, base.withdraw.introHeading),
      introBody: pickText(doc.withdrawIntroBody, base.withdraw.introBody),
      kicker: pickText(doc.withdrawMethodsKicker, base.withdraw.kicker),
      heading: pickText(doc.withdrawMethodsHeading, base.withdraw.heading),
      note: pickText(doc.withdrawMethodsNote, base.withdraw.note)
    },
    topics: {
      kicker: pickText(doc.topicsKicker, base.topics.kicker),
      heading: pickText(doc.topicsHeading, base.topics.heading),
      subtitle: pickText(doc.topicsSubtitle, base.topics.subtitle)
    },
    testimonials: {
      kicker: pickText(doc.testimonialsKicker, base.testimonials.kicker),
      heading: pickText(doc.testimonialsHeading, base.testimonials.heading),
      subtitle: pickText(doc.testimonialsSubtitle, base.testimonials.subtitle)
    },
    cta: {
      heading: pickText(doc.ctaHeading, base.cta.heading),
      body: pickText(doc.ctaBody, base.cta.body)
    },
    images: {
      hero: mediaUrl(doc.heroImage),
      deposit: mediaUrl(doc.depositImage),
      withdraw: mediaUrl(doc.withdrawImage),
      cta: mediaUrl(doc.ctaImage)
    }
  };
}

async function fetchFundingMarketing(
  locale: Locale
): Promise<FundingMarketing> {
  const base = await fallbackFundingMarketing(locale);
  try {
    const payload = await getPayloadClient();
    const doc = await payload.findGlobal({slug: 'funding-page', locale, depth: 1});
    return mergeFunding(doc, base);
  } catch {
    return base;
  }
}

const getFundingMarketingCached = unstable_cache(
  async (locale: Locale) => fetchFundingMarketing(locale),
  ['funding-page'],
  {tags: [CACHE_TAGS.fundingMarketing]}
);

/** /funding marketing copy only (section chrome). */
export async function getFundingMarketing(
  locale: Locale
): Promise<FundingMarketing> {
  if (!hasDb()) {
    return fallbackFundingMarketing(locale);
  }
  return getFundingMarketingCached(locale);
}
