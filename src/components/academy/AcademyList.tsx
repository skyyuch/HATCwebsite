import {getLocale, getTranslations} from 'next-intl/server';
import {getAcademyArticles} from '@/lib/academyArticles';
import type {Locale} from '@/i18n/routing';
import AcademyHero from './AcademyHero';
import AcademyExplorer from './AcademyExplorer';
import AcademyNewsletter from './AcademyNewsletter';

/**
 * `/academy` page (Figma 98:4, HATC-ised). Server component: fetches the full
 * article set (CMS `academy-articles`; no DB / empty → i18n seeds a1–a3) and
 * the canonical filter categories, then composes hero → interactive explorer
 * (filter/sort/pagination) → newsletter. SSG-safe. Neutral education only.
 */
export default async function AcademyList() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('academy');
  const articles = await getAcademyArticles(locale);
  const categories = t.raw('categories') as string[];

  return (
    <>
      <AcademyHero />
      <AcademyExplorer articles={articles} categories={categories} />
      <AcademyNewsletter />
    </>
  );
}
