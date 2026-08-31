import 'server-only';

import {unstable_cache} from 'next/cache';

import type {Locale} from '@/i18n/routing';
import {CACHE_TAGS} from '@/lib/cacheTags';
import {loadMessages, msgString, pickText} from '@/lib/copyPick';
import {getPayloadClient, hasDb} from '@/lib/payload';
import type {HomePage as HomePageDoc} from '@/payload-types';

export type HomeMarketing = {
  hero: {
    badge: string;
    titleLine1: string;
    titleBrand: string;
    titleTail: string;
    subtitle: string;
    ctaPrimary: string;
  };
  services: {
    kicker: string;
    heading: string;
    subheading: string;
    body: string;
    cta: string;
  };
  mt5: {
    kicker: string;
    heading: string;
    subheading: string;
    body: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  why: {kicker: string; heading: string};
  academy: {kicker: string; heading: string};
  story: {kicker: string; heading: string; body: string; cta: string};
  support: {kicker: string; heading: string; cta: string};
  finalCta: {
    heading: string;
    body: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
};

async function fallbackHomeMarketing(locale: Locale): Promise<HomeMarketing> {
  const m = await loadMessages(locale);
  return {
    hero: {
      badge: msgString(m, 'home.heroV2.badge'),
      titleLine1: msgString(m, 'home.heroV2.titleLine1'),
      titleBrand: msgString(m, 'home.heroV2.titleBrand'),
      titleTail: msgString(m, 'home.heroV2.titleTail'),
      subtitle: msgString(m, 'home.heroV2.subtitle'),
      ctaPrimary: msgString(m, 'home.heroV2.ctaPrimary')
    },
    services: {
      kicker: msgString(m, 'home.goldServices.kicker'),
      heading: msgString(m, 'home.goldServices.heading'),
      subheading: msgString(m, 'home.goldServices.subheading'),
      body: msgString(m, 'home.goldServices.body'),
      cta: msgString(m, 'home.goldServices.cta')
    },
    mt5: {
      kicker: msgString(m, 'home.mt5.kicker'),
      heading: msgString(m, 'home.mt5.heading'),
      subheading: msgString(m, 'home.mt5.subheading'),
      body: msgString(m, 'home.mt5.body'),
      ctaPrimary: msgString(m, 'home.mt5.ctaPrimary'),
      ctaSecondary: msgString(m, 'home.mt5.ctaSecondary')
    },
    why: {
      kicker: msgString(m, 'home.whyV2.kicker'),
      heading: msgString(m, 'home.whyV2.heading')
    },
    academy: {
      kicker: msgString(m, 'home.goldAcademy.kicker'),
      heading: msgString(m, 'home.goldAcademy.heading')
    },
    story: {
      kicker: msgString(m, 'home.story.kicker'),
      heading: msgString(m, 'home.story.heading'),
      body: msgString(m, 'home.story.body'),
      cta: msgString(m, 'home.story.cta')
    },
    support: {
      kicker: msgString(m, 'home.support.kicker'),
      heading: msgString(m, 'home.support.heading'),
      cta: msgString(m, 'home.support.cta')
    },
    finalCta: {
      heading: msgString(m, 'home.finalCta.heading'),
      body: msgString(m, 'home.finalCta.body'),
      ctaPrimary: msgString(m, 'home.finalCta.ctaPrimary'),
      ctaSecondary: msgString(m, 'home.finalCta.ctaSecondary')
    }
  };
}

function mergeHome(doc: HomePageDoc, base: HomeMarketing): HomeMarketing {
  return {
    hero: {
      badge: pickText(doc.heroBadge, base.hero.badge),
      titleLine1: pickText(doc.heroTitleLine1, base.hero.titleLine1),
      titleBrand: pickText(doc.heroTitleBrand, base.hero.titleBrand),
      titleTail: pickText(doc.heroTitleTail, base.hero.titleTail),
      subtitle: pickText(doc.heroSubtitle, base.hero.subtitle),
      ctaPrimary: pickText(doc.heroCtaPrimary, base.hero.ctaPrimary)
    },
    services: {
      kicker: pickText(doc.servicesKicker, base.services.kicker),
      heading: pickText(doc.servicesHeading, base.services.heading),
      subheading: pickText(doc.servicesSubheading, base.services.subheading),
      body: pickText(doc.servicesBody, base.services.body),
      cta: pickText(doc.servicesCta, base.services.cta)
    },
    mt5: {
      kicker: pickText(doc.mt5Kicker, base.mt5.kicker),
      heading: pickText(doc.mt5Heading, base.mt5.heading),
      subheading: pickText(doc.mt5Subheading, base.mt5.subheading),
      body: pickText(doc.mt5Body, base.mt5.body),
      ctaPrimary: pickText(doc.mt5CtaPrimary, base.mt5.ctaPrimary),
      ctaSecondary: pickText(doc.mt5CtaSecondary, base.mt5.ctaSecondary)
    },
    why: {
      kicker: pickText(doc.whyKicker, base.why.kicker),
      heading: pickText(doc.whyHeading, base.why.heading)
    },
    academy: {
      kicker: pickText(doc.academyKicker, base.academy.kicker),
      heading: pickText(doc.academyHeading, base.academy.heading)
    },
    story: {
      kicker: pickText(doc.storyKicker, base.story.kicker),
      heading: pickText(doc.storyHeading, base.story.heading),
      body: pickText(doc.storyBody, base.story.body),
      cta: pickText(doc.storyCta, base.story.cta)
    },
    support: {
      kicker: pickText(doc.supportKicker, base.support.kicker),
      heading: pickText(doc.supportHeading, base.support.heading),
      cta: pickText(doc.supportCta, base.support.cta)
    },
    finalCta: {
      heading: pickText(doc.finalHeading, base.finalCta.heading),
      body: pickText(doc.finalBody, base.finalCta.body),
      ctaPrimary: pickText(doc.finalCtaPrimary, base.finalCta.ctaPrimary),
      ctaSecondary: pickText(doc.finalCtaSecondary, base.finalCta.ctaSecondary)
    }
  };
}

async function fetchHomeMarketing(locale: Locale): Promise<HomeMarketing> {
  const base = await fallbackHomeMarketing(locale);
  try {
    const payload = await getPayloadClient();
    const doc = await payload.findGlobal({
      slug: 'home-page',
      locale
    });
    return mergeHome(doc, base);
  } catch {
    return base;
  }
}

const getHomeMarketingCached = unstable_cache(
  async (locale: Locale) => fetchHomeMarketing(locale),
  ['home-page'],
  {tags: [CACHE_TAGS.homeMarketing]}
);

/** Homepage marketing copy: CMS overrides merged over i18n seeds. */
export async function getHomeMarketing(locale: Locale): Promise<HomeMarketing> {
  if (!hasDb()) {
    return fallbackHomeMarketing(locale);
  }
  return getHomeMarketingCached(locale);
}
