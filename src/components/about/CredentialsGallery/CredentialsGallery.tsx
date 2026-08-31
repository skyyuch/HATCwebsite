import {getLocale, getTranslations} from 'next-intl/server';
import SectionTitle from '@/components/home/SectionTitle';
import {getAboutMarketing} from '@/lib/aboutMarketing';
import type {Locale} from '@/i18n/routing';
import CredentialsGalleryGrid from './CredentialsGalleryGrid';

/**
 * credentials-gallery — real assets; section chrome from CMS with i18n fallback.
 */
export default async function CredentialsGallery() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('about.gallery');
  const copy = (await getAboutMarketing(locale)).gallery;
  const common = await getTranslations('common');

  return (
    <section className="bg-[var(--fig-ink)]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-12 px-6 py-20 sm:px-10 lg:px-[120px] lg:py-24">
        <SectionTitle kicker={copy.kicker} heading={copy.heading} tone="dark" />

        <CredentialsGalleryGrid
          license={{
            src: '/certificates/member-2025.jpg',
            alt: t('alt.license'),
            label: t('licenseLabel'),
            fit: 'contain'
          }}
          office={{
            src: '/office/office2.jpg',
            alt: t('alt.office'),
            label: t('officeLabel'),
            fit: 'cover'
          }}
          honor={{
            src: '/certificates/award2.jpg',
            alt: t('alt.honor'),
            label: t('honorLabel'),
            fit: 'contain'
          }}
          document={{
            src: '/certificates/participant-2026.jpg',
            alt: t('alt.document'),
            label: t('documentLabel'),
            fit: 'contain'
          }}
          customs={{
            src: '/certificates/cert-dpms.jpg',
            alt: t('alt.customs'),
            label: t('customsLabel'),
            fit: 'contain'
          }}
          zoomHint={t('zoomHint')}
          closeLabel={common('close')}
        />

        <p className="text-[13px] text-[var(--fig-text-dim)]">{t('note')}</p>
      </div>
    </section>
  );
}
