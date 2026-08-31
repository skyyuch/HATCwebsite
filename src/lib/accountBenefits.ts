import 'server-only';

import {unstable_cache} from 'next/cache';

import type {Locale} from '@/i18n/routing';
import {CACHE_TAGS} from '@/lib/cacheTags';
import {getPayloadClient, hasDb} from '@/lib/payload';

export const BENEFIT_ICONS = ['percent', 'zap', 'creditCard', 'monitor'] as const;
export type BenefitIcon = (typeof BENEFIT_ICONS)[number];

export type AccountBenefit = {
  id: string;
  title: string;
  desc: string;
  icon: BenefitIcon;
  order: number;
};

const FALLBACK_ICONS: BenefitIcon[] = ['percent', 'zap', 'creditCard', 'monitor'];

function toIcon(value: unknown, index: number): BenefitIcon {
  return BENEFIT_ICONS.includes(value as BenefitIcon)
    ? (value as BenefitIcon)
    : FALLBACK_ICONS[index % FALLBACK_ICONS.length];
}

/**
 * i18n seed fallback (`accounts.benefits.items`). Icons are assigned by position
 * to match the original Figma order (percent / zap / card / monitor).
 */
async function getAccountBenefitsFallback(
  locale: Locale
): Promise<AccountBenefit[]> {
  const messages = (await import(`../messages/${locale}.json`)).default as {
    accounts?: {benefits?: {items?: {title?: string; desc?: string}[]}};
  };

  const rows = messages.accounts?.benefits?.items ?? [];

  return rows
    .filter((row) => row.title)
    .map((row, index) => ({
      id: `seed-${index}`,
      title: row.title ?? '',
      desc: row.desc ?? '',
      icon: FALLBACK_ICONS[index % FALLBACK_ICONS.length],
      order: index
    }));
}

async function fetchAccountBenefitsFromDb(
  locale: Locale
): Promise<AccountBenefit[]> {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: 'account-benefits',
      locale,
      where: {enabled: {equals: true}},
      sort: 'order',
      limit: 50
    });

    if (res.docs.length === 0) {
      return getAccountBenefitsFallback(locale);
    }

    return res.docs.map((doc, index) => ({
      id: String(doc.id),
      title: (doc.title as string) || '',
      desc: (doc.desc as string) || '',
      icon: toIcon(doc.icon, index),
      order: (doc.order as number) ?? 0
    }));
  } catch {
    return getAccountBenefitsFallback(locale);
  }
}

const getAccountBenefitsCached = unstable_cache(
  async (locale: Locale) => fetchAccountBenefitsFromDb(locale),
  ['account-benefits'],
  {tags: [CACHE_TAGS.accountBenefits]}
);

/**
 * Core benefit cards for `/accounts`. DB when configured; otherwise the i18n
 * seed. Empty CMS list also falls back to the seed.
 */
export async function getAccountBenefits(
  locale: Locale
): Promise<AccountBenefit[]> {
  if (!hasDb()) {
    return getAccountBenefitsFallback(locale);
  }
  return getAccountBenefitsCached(locale);
}
