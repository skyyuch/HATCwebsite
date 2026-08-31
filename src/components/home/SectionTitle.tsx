import {cn} from '@/lib/utils';

/**
 * Centered section title used across the Figma homepage sections:
 * a gold uppercase kicker above a large heading. `tone` switches the heading
 * colour for light vs dark sections.
 */
export default function SectionTitle({
  kicker,
  heading,
  tone = 'light',
  className
}: {
  kicker: string;
  heading: string;
  tone?: 'light' | 'dark';
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center gap-3 text-center', className)}>
      <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-gold">
        {kicker}
      </span>
      <h2
        className={cn(
          'font-sans text-[clamp(1.8rem,4vw,2.25rem)] font-extrabold leading-[1.15]',
          tone === 'dark' ? 'text-white' : 'text-[var(--fig-heading-dark)]'
        )}
      >
        {heading}
      </h2>
    </div>
  );
}
