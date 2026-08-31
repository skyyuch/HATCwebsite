import {getTranslations} from 'next-intl/server';

/**
 * Risk-disclaimer strip (Figma 89:164). Converged to true/generic wording
 * (leverage risk + third-party payment rule); no fabricated claims.
 */
export default async function PlatformDisclaimer() {
  const t = await getTranslations('platforms');

  return (
    <section className="bg-[var(--fig-ink)]">
      <div className="mx-auto max-w-[1440px] px-6 py-8 sm:px-10 lg:px-[120px]">
        <p className="text-xs leading-[1.7] text-[var(--fig-text-dim)]">
          {t('disclaimer')}
        </p>
      </div>
    </section>
  );
}
