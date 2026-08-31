import {routing} from '@/i18n/routing';

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
).replace(/\/$/, '');

/** hreflang alternates for a given path (path starts with '/', or ''). */
export function localeAlternates(path = ''): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = `${siteUrl}/${locale}${path}`;
  }
  languages['x-default'] = `${siteUrl}/${routing.defaultLocale}${path}`;
  return languages;
}
