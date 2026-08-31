import type {Metadata} from 'next';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {siteUrl, localeAlternates} from '@/lib/seo';
import AccountsHero from '@/components/accounts/AccountsHero';
import AccountTiers from '@/components/accounts/AccountTiers';
import AccountBenefits from '@/components/accounts/AccountBenefits';
import AccountSpreads from '@/components/accounts/AccountSpreads';
import AccountPlatforms from '@/components/accounts/AccountPlatforms';
import AccountSteps from '@/components/accounts/AccountSteps';
import AccountFaq from '@/components/accounts/AccountFaq';
import AccountsCta from '@/components/accounts/AccountsCta';

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'metadata.accounts'});

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `${siteUrl}/${locale}/accounts`,
      languages: localeAlternates('/accounts')
    }
  };
}

/**
 * Trading accounts page (Figma 62:4), rebuilt on the shared dark/gold system
 * (the Figma blue accent is mapped to HATC gold). Account tiers, spreads and
 * platform copy are SAMPLE「示意數據」and NOT approved facts (owner 2026-08-20);
 * products are trimmed to the approved gold/silver only. The global white
 * Header + dark Footer frame the page (the Figma's own nav/footer are dropped).
 */
export default async function AccountsPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return (
    <>
      <AccountsHero />
      <AccountTiers />
      <AccountBenefits />
      <AccountSpreads />
      <AccountPlatforms />
      <AccountSteps />
      <AccountFaq />
      <AccountsCta />
    </>
  );
}
