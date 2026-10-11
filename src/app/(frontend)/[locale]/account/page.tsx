import {getTranslations, setRequestLocale} from 'next-intl/server';
import ComingSoon from '@/components/ComingSoon/ComingSoon';

// Deliberately unlinked and absent from the sitemap since 第五十七輪: the header
// login link now resolves from Site settings → 會員登入連結 and stays hidden
// until the owner supplies a real destination, so nothing should point here.

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
