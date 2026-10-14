import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {
  getAcademyArticleBySlug,
  getAcademyArticleSlugs
} from '@/lib/academyArticles';
import {siteUrl, localeAlternates, SHARE_CARD} from '@/lib/seo';
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
  const brand = await getTranslations({locale, namespace: 'common'});

  if (!article) {
    return {
      title: t('title'),
      description: t('description')
    };
  }

  const description = article.excerpt || t('description');
  const path = `/academy/${article.slug}`;
  const image = article.coverUrl
    ? {url: article.coverUrl, alt: article.coverAlt || article.title}
    : {...SHARE_CARD, alt: brand('brandFull')};

  return {
    title: article.title,
    description,
    alternates: {
      canonical: `${siteUrl}/${locale}${path}`,
      languages: localeAlternates(path)
    },
    // Own cover when the article has one, brand card otherwise. Both
    // `openGraph` and `twitter` have to be given the image: declaring one of
    // them replaces the layout's version of that object only, which is how
    // articles ended up advertising their cover to Facebook and the brand card
    // to X.
    openGraph: {
      title: article.title,
      description,
      type: 'article',
      url: `${siteUrl}/${locale}${path}`,
      images: [image]
    },
    twitter: {card: 'summary_large_image', images: [image]}
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
