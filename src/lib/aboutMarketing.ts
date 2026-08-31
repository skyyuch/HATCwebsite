import 'server-only';

import {unstable_cache} from 'next/cache';

import type {Locale} from '@/i18n/routing';
import {CACHE_TAGS} from '@/lib/cacheTags';
import {loadMessages, msgString, pickText} from '@/lib/copyPick';
import {getPayloadClient, hasDb} from '@/lib/payload';
import type {AboutPage as AboutPageDoc} from '@/payload-types';

export type AboutMarketing = {
  hero: {titleLead: string; subtitle: string};
  identity: {kicker: string; heading: string};
  credentials: {kicker: string; heading: string};
  principles: {kicker: string; heading: string};
  timeline: {kicker: string; heading: string};
  hongkong: {
    kicker: string;
    headingLead: string;
    headingAccent: string;
    body: string;
  };
  gallery: {kicker: string; heading: string};
  cta: {heading: string; body: string; ctaSecondary: string};
};

async function fallbackAboutMarketing(locale: Locale): Promise<AboutMarketing> {
  const m = await loadMessages(locale);
  return {
    hero: {
      titleLead: msgString(m, 'about.hero.titleLead'),
      subtitle: msgString(m, 'about.hero.subtitle')
    },
    identity: {
      kicker: msgString(m, 'about.identity.kicker'),
      heading: msgString(m, 'about.identity.heading')
    },
    credentials: {
      kicker: msgString(m, 'about.credentials.kicker'),
      heading: msgString(m, 'about.credentials.heading')
    },
    principles: {
      kicker: msgString(m, 'about.principles.kicker'),
      heading: msgString(m, 'about.principles.heading')
    },
    timeline: {
      kicker: msgString(m, 'about.timeline.kicker'),
      heading: msgString(m, 'about.timeline.heading')
    },
    hongkong: {
      kicker: msgString(m, 'about.hongkong.kicker'),
      headingLead: msgString(m, 'about.hongkong.headingLead'),
      headingAccent: msgString(m, 'about.hongkong.headingAccent'),
      body: msgString(m, 'about.hongkong.body')
    },
    gallery: {
      kicker: msgString(m, 'about.gallery.kicker'),
      heading: msgString(m, 'about.gallery.heading')
    },
    cta: {
      heading: msgString(m, 'about.cta.heading'),
      body: msgString(m, 'about.cta.body'),
      ctaSecondary: msgString(m, 'about.cta.ctaSecondary')
    }
  };
}

function mergeAbout(doc: AboutPageDoc, base: AboutMarketing): AboutMarketing {
  return {
    hero: {
      titleLead: pickText(doc.heroTitleLead, base.hero.titleLead),
      subtitle: pickText(doc.heroSubtitle, base.hero.subtitle)
    },
    identity: {
      kicker: pickText(doc.identityKicker, base.identity.kicker),
      heading: pickText(doc.identityHeading, base.identity.heading)
    },
    credentials: {
      kicker: pickText(doc.credentialsKicker, base.credentials.kicker),
      heading: pickText(doc.credentialsHeading, base.credentials.heading)
    },
    principles: {
      kicker: pickText(doc.principlesKicker, base.principles.kicker),
      heading: pickText(doc.principlesHeading, base.principles.heading)
    },
    timeline: {
      kicker: pickText(doc.timelineKicker, base.timeline.kicker),
      heading: pickText(doc.timelineHeading, base.timeline.heading)
    },
    hongkong: {
      kicker: pickText(doc.hongkongKicker, base.hongkong.kicker),
      headingLead: pickText(doc.hongkongHeadingLead, base.hongkong.headingLead),
      headingAccent: pickText(
        doc.hongkongHeadingAccent,
        base.hongkong.headingAccent
      ),
      body: pickText(doc.hongkongBody, base.hongkong.body)
    },
    gallery: {
      kicker: pickText(doc.galleryKicker, base.gallery.kicker),
      heading: pickText(doc.galleryHeading, base.gallery.heading)
    },
    cta: {
      heading: pickText(doc.ctaHeading, base.cta.heading),
      body: pickText(doc.ctaBody, base.cta.body),
      ctaSecondary: pickText(doc.ctaSecondary, base.cta.ctaSecondary)
    }
  };
}

async function fetchAboutMarketing(locale: Locale): Promise<AboutMarketing> {
  const base = await fallbackAboutMarketing(locale);
  try {
    const payload = await getPayloadClient();
    const doc = await payload.findGlobal({
      slug: 'about-page',
      locale
    });
    return mergeAbout(doc, base);
  } catch {
    return base;
  }
}

const getAboutMarketingCached = unstable_cache(
  async (locale: Locale) => fetchAboutMarketing(locale),
  ['about-page'],
  {tags: [CACHE_TAGS.aboutMarketing]}
);

/** /about marketing copy: CMS overrides merged over i18n seeds. */
export async function getAboutMarketing(
  locale: Locale
): Promise<AboutMarketing> {
  if (!hasDb()) {
    return fallbackAboutMarketing(locale);
  }
  return getAboutMarketingCached(locale);
}
