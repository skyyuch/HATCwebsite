'use client';

import {useState} from 'react';
import {Check} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/utils';
import {buttonVariants} from '@/components/ui/button';
import type {TradingPlatform} from '@/lib/tradingPlatforms';
import PlatformVisualPanel from './PlatformVisualPanel';
import {visualNote, type PlatformVisual, type VisualNote} from './platformVisuals';

type Bullet = {title: string; desc: string};

/**
 * Interactive platform tabs (Figma 92:28 + 92:50). Selecting a tab swaps the
 * detail panel; the value-prop bullets are shared across platforms. `ctaHref`
 * is an operational open-account link resolved server-side (CMS), falling back
 * to /register.
 */
export default function PlatformTabsClient({
  platforms,
  visuals,
  bullets,
  notes,
  ctaLabel,
  ctaHref,
  ctaExternal
}: {
  platforms: TradingPlatform[];
  visuals: (PlatformVisual | null)[];
  bullets: Bullet[];
  notes: Record<Exclude<VisualNote, null>, string>;
  ctaLabel: string;
  ctaHref: string;
  ctaExternal: boolean;
}) {
  const [active, setActive] = useState(0);
  const current = platforms[active] ?? platforms[0];
  const visual = visuals[active] ?? null;

  if (!current) return null;

  const isPortrait = visual?.kind === 'phone';
  const noteKey = visualNote(visual);

  return (
    <div className="flex flex-col gap-12">
      <div
        role="tablist"
        aria-label={current.name}
        className="mx-auto flex max-w-full flex-wrap items-center justify-center gap-3"
      >
        {platforms.map((p, i) => {
          const selected = i === active;
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(i)}
              className={cn(
                'rounded-[8px] px-5 py-2.5 text-sm font-semibold transition-colors',
                selected
                  ? 'bg-gold text-[#070a14]'
                  : 'border border-[var(--fig-border-light)] bg-white text-[var(--fig-text-muted)] hover:text-[var(--fig-heading-dark)]'
              )}
            >
              {p.name}
            </button>
          );
        })}
      </div>

      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <PlatformVisualPanel
            key={current.id}
            visual={visual}
            label={current.panelLabel}
            alt={current.name}
            className={cn(
              'rounded-[16px] border border-[var(--fig-border)]',
              // A phone capture is portrait, so it needs a taller panel to stay
              // readable; browser and monitor frames are landscape.
              isPortrait ? 'h-[460px] sm:h-[620px]' : 'h-[360px] sm:h-[440px]'
            )}
          />
          {noteKey ? (
            <p className="text-xs leading-[1.6] text-[var(--fig-text-muted)]">
              {notes[noteKey]}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h3 className="font-sans text-[clamp(1.4rem,3vw,1.75rem)] font-extrabold leading-[1.2] text-[var(--fig-heading-dark)]">
              {current.tagline || current.name}
            </h3>
            {current.desc ? (
              <p className="text-sm leading-[1.6] text-[var(--fig-text-muted)]">
                {current.desc}
              </p>
            ) : null}
          </div>

          <ul className="flex flex-col gap-4">
            {bullets.map((b) => (
              <li key={b.title} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                  <Check className="size-3" />
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-[15px] font-bold text-[var(--fig-heading-dark)]">
                    {b.title}
                  </span>
                  <span className="text-sm leading-[1.55] text-[var(--fig-text-muted)]">
                    {b.desc}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <div>
            {ctaExternal ? (
              <a
                href={ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({variant: 'gold', size: 'fig'}))}
              >
                {ctaLabel}
              </a>
            ) : (
              <Link
                href={ctaHref}
                className={cn(buttonVariants({variant: 'gold', size: 'fig'}))}
              >
                {ctaLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
