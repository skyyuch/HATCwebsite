import {getTranslations, setRequestLocale} from 'next-intl/server';
import ComingSoon from '@/components/ComingSoon/ComingSoon';

export default async function AccountPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('common');
  return <ComingSoon title={t('userCenter')} />;
}
