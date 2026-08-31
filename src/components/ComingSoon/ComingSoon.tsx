import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import styles from './ComingSoon.module.css';

export default async function ComingSoon({title}: {title: string}) {
  const t = await getTranslations('common');
  return (
    <section className={`container ${styles.wrap}`}>
      <p className={styles.tag}>{t('comingSoon')}</p>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.note}>{t('comingSoonNote')}</p>
      <Link href="/" className={styles.back}>
        {t('brand')}
      </Link>
    </section>
  );
}
