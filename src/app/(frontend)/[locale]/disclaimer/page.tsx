import {getTranslations, setRequestLocale} from 'next-intl/server';
import ComingSoon from '@/components/ComingSoon/ComingSoon';

// Footer legal link stub (免責聲明). Awaiting owner-supplied legal copy.
export default async function DisclaimerPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home.footerV2');
  return <ComingSoon title={t('disclaimer')} />;
}
