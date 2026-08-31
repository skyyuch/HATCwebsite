import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {
  getAcademyArticleBySlug,
  getAcademyArticleSlugs
} from '@/lib/academyArticles';
import {siteUrl, localeAlternates} from '@/lib/seo';
import type {Locale} from '@/i18n/routing';
import AcademyArticleView from '@/components/academy/AcademyArticleView';

export async function generateStaticParams() {
  const slugs = await getAcademyArticleSlugs();
  return slugs.map((slug) => ({slug}));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string; slug: string}>;
}): Promise<Metadata> {
  const {locale, slug} = await params;
  const article = await getAcademyArticleBySlug(locale as Locale, slug);
  const t = await getTranslations({locale, namespace: 'metadata.academy'});

  if (!article) {
    return {
      title: t('title'),
      description: t('description')
    };
  }

  const description = article.excerpt || t('description');
  const path = `/academy/${article.slug}`;

  return {
    title: article.title,
    description,
    alternates: {
      canonical: `${siteUrl}/${locale}${path}`,
      languages: localeAlternates(path)
    },
    openGraph: {
      title: article.title,
      description,
      type: 'article',
      ...(article.coverUrl ? {images: [{url: article.coverUrl}]} : {})
    }
  };
}

export default async function AcademyArticlePage({
  params
}: {
  params: Promise<{locale: string; slug: string}>;
}) {
  const {locale, slug} = await params;
  setRequestLocale(locale);

  const article = await getAcademyArticleBySlug(locale as Locale, slug);
  if (!article) {
    notFound();
  }

  return <AcademyArticleView article={article} locale={locale} />;
}
