import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';

export default async function NotFound() {
  const t = await getTranslations('notFound');
  return (
    <section className="container" style={{paddingBlock: 'var(--space-24)'}}>
      <h1>{t('title')}</h1>
      <p style={{marginTop: 'var(--space-4)', color: 'var(--color-ink-soft)'}}>
        {t('description')}
      </p>
      <p style={{marginTop: 'var(--space-6)'}}>
        <Link href="/" style={{color: 'var(--color-gold-deep)'}}>
          {t('back')}
        </Link>
      </p>
    </section>
  );
}
