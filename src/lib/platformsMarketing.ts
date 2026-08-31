import 'server-only';

import {unstable_cache} from 'next/cache';

import {CACHE_TAGS} from '@/lib/cacheTags';
import {getPayloadClient, hasDb} from '@/lib/payload';

export type PlatformsMarketing = {
  /** CMS-uploaded hero device image; undefined = component uses the Figma sample mockup. */
  heroImage?: string;
};

/** Extract a usable URL from a Payload upload field (populated object or empty). */
function mediaUrl(value: unknown): string | undefined {
  if (value && typeof value === 'object' && 'url' in value) {
    const url = (value as {url?: unknown}).url;
    if (typeof url === 'string' && url.trim()) return url;
  }
  return undefined;
}

async function fetchPlatformsMarketing(): Promise<PlatformsMarketing> {
  try {
    const payload = await getPayloadClient();
    const doc = await payload.findGlobal({slug: 'platforms-page', depth: 1});
    return {heroImage: mediaUrl((doc as {heroImage?: unknown}).heroImage)};
  } catch {
    return {};
  }
}

const getPlatformsMarketingCached = unstable_cache(
  async () => fetchPlatformsMarketing(),
  ['platforms-page'],
  {tags: [CACHE_TAGS.platformsMarketing]}
);

/**
 * /platforms page assets (hero image override). DB when configured; otherwise
 * empty so the component uses the built-in Figma sample mockup. Locale-agnostic
 * (the image is not localized).
 */
export async function getPlatformsMarketing(): Promise<PlatformsMarketing> {
  if (!hasDb()) {
    return {};
  }
  return getPlatformsMarketingCached();
}
