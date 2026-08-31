'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';

/**
 * Newsletter subscribe band (Figma 98:246) — HATC-ised. The Figma promises
 * "weekly, most-authoritative precious-metals AND forex analysis"; per the red
 * lines (gold/silver only, no superlative claims) the copy is softened and the
 * "forex" mention removed. There is no email backend yet, so the form does NOT
 * send anywhere and does NOT fake a success — on submit it shows an honest
 * "coming soon" notice. Owner follow-up: wire a real email provider.
 */
export default function AcademyNewsletter() {
  const t = useTranslations('academy.newsletter');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'soon' | 'invalid'>('idle');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    setStatus(valid ? 'soon' : 'invalid');
  };

  return (
    <section className="bg-[#faf6ee]">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-6 px-6 py-16 text-center sm:px-10 lg:px-[120px] lg:py-20">
        <div className="flex max-w-[800px] flex-col gap-3">
          <h2 className="font-sans text-[clamp(1.5rem,3vw,1.75rem)] font-black text-[#0c111d]">
            {t('title')}
          </h2>
          <p className="text-base leading-[1.5] text-[#344054]">{t('desc')}</p>
        </div>

        <form
          onSubmit={onSubmit}
          noValidate
          className="flex w-full max-w-[500px] flex-col items-stretch gap-3 sm:flex-row"
        >
          <label className="sr-only" htmlFor="academy-newsletter-email">
            {t('placeholder')}
          </label>
          <input
            id="academy-newsletter-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status !== 'idle') setStatus('idle');
            }}
            placeholder={t('placeholder')}
            className="h-12 flex-1 rounded-[6px] border border-[var(--fig-border-light)] bg-white px-4 text-sm text-[#0c111d] placeholder:text-[#667085] focus:border-[#1a3366] focus:outline-none"
          />
          <button
            type="submit"
            className="h-12 shrink-0 rounded-[6px] bg-[#1a3366] px-6 text-sm font-bold text-white transition-colors hover:bg-[#12264d]"
          >
            {t('submit')}
          </button>
        </form>

        {status !== 'idle' ? (
          <p
            role="status"
            className={[
              'text-sm',
              status === 'invalid' ? 'text-[#b42318]' : 'text-[#344054]'
            ].join(' ')}
          >
            {status === 'invalid' ? t('invalid') : t('soon')}
          </p>
        ) : null}
      </div>
    </section>
  );
}
