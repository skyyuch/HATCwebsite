'use client';

import {useLocale, useTranslations} from 'next-intl';
import {useParams} from 'next/navigation';
import {useTransition} from 'react';
import {usePathname, useRouter} from '@/i18n/navigation';
import {routing} from '@/i18n/routing';
import styles from './LocaleSwitcher.module.css';

export default function LocaleSwitcher() {
  const t = useTranslations('locale');
  const tc = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  function onChange(next: string) {
    startTransition(() => {
      // @ts-expect-error -- params are passed through for dynamic segments
      router.replace({pathname, params}, {locale: next});
    });
  }

  return (
    <label className={styles.wrap}>
      <span className={styles.srOnly}>{tc('language')}</span>
      <select
        className={styles.select}
        value={locale}
        disabled={isPending}
        onChange={(e) => onChange(e.target.value)}
      >
        {routing.locales.map((l) => (
          <option key={l} value={l}>
            {t(l)}
          </option>
        ))}
      </select>
    </label>
  );
}
