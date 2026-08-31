import 'server-only';

import {unstable_cache} from 'next/cache';

import {CACHE_TAGS} from '@/lib/cacheTags';
import {getPayloadClient, hasDb} from '@/lib/payload';

/**
 * Operational links (customer service / contact) MUST be configurable, never
 * hard-coded (see .cursor/rules/hatc-website.mdc).
 *
 * Source of truth: the Payload `SiteSettings` global. When the database is not
 * configured, we fall back to environment variables so local/preview builds work.
 */
export type SiteSettings = {
  whatsapp?: string;
  phone?: string;
  email?: string;
  liveChatUrl?: string;
};

function envFallback(): SiteSettings {
  return {
    whatsapp: process.env.NEXT_PUBLIC_CONTACT_WHATSAPP || undefined,
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || undefined,
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || undefined,
    liveChatUrl: process.env.NEXT_PUBLIC_CONTACT_LIVECHAT || undefined
  };
}

async function fetchSiteSettingsFromDb(): Promise<SiteSettings> {
  try {
    const payload = await getPayloadClient();
    const settings = await payload.findGlobal({slug: 'site-settings'});

    return {
      whatsapp: (settings?.whatsapp as string) || undefined,
      phone: (settings?.phone as string) || undefined,
      email: (settings?.email as string) || undefined,
      liveChatUrl: (settings?.liveChatUrl as string) || undefined
    };
  } catch {
    return envFallback();
  }
}

const getSiteSettingsCached = unstable_cache(
  fetchSiteSettingsFromDb,
  ['site-settings'],
  {tags: [CACHE_TAGS.siteSettings]}
);

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!hasDb()) {
    return envFallback();
  }

  return getSiteSettingsCached();
}

/** Resolve the best available contact URL, or null if none configured. */
export function primaryContactHref(s: SiteSettings): string | null {
  if (s.liveChatUrl) return s.liveChatUrl;
  if (s.whatsapp) return `https://wa.me/${s.whatsapp.replace(/[^0-9]/g, '')}`;
  if (s.email) return `mailto:${s.email}`;
  if (s.phone) return `tel:${s.phone}`;
  return null;
}
