import 'server-only';

import type {Locale} from '@/i18n/routing';

/** CMS string wins when non-empty after trim; otherwise i18n fallback. */
export function pickText(cms: unknown, fallback: string): string {
  if (typeof cms === 'string') {
    const trimmed = cms.trim();
    if (trimmed) return trimmed;
  }
  return fallback;
}

type Json = Record<string, unknown>;

export async function loadMessages(locale: Locale): Promise<Json> {
  const mod = await import(`../messages/${locale}.json`);
  return mod.default as Json;
}

export function nestGet(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Json)) {
      return (acc as Json)[key];
    }
    return undefined;
  }, obj);
}

export function msgString(messages: Json, path: string): string {
  const value = nestGet(messages, path);
  return typeof value === 'string' ? value : '';
}
