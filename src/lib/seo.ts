import {routing} from '@/i18n/routing';

/**
 * Treat an empty/whitespace value as "not set" — `??` alone would let
 * `NEXT_PUBLIC_SITE_URL=` through as `''` and `new URL('')` in the locale
 * layout then fails every prerender with an opaque `ERR_INVALID_URL`.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000'
).replace(/\/$/, '');

/**
 * Whether search engines may index this deployment. Build-time only: canonical
 * URLs, `robots.txt` and the per-page robots meta tag are all baked into the
 * static output, so a non-production environment has to be built with
 * `SITE_INDEXABLE=false` (set for local and UAT in `config/env/*.env`).
 *
 * Defaults to indexable so an unconfigured build behaves exactly as before.
 */
export const siteIndexable = process.env.SITE_INDEXABLE !== 'false';

/** hreflang alternates for a given path (path starts with '/', or ''). */
export function localeAlternates(path = ''): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = `${siteUrl}/${locale}${path}`;
  }
  languages['x-default'] = `${siteUrl}/${routing.defaultLocale}${path}`;
  return languages;
}
