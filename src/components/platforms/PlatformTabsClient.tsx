'use client';

import {useState} from 'react';
import Image from 'next/image';
import {Check} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/utils';
import {buttonVariants} from '@/components/ui/button';
import type {TradingPlatform} from '@/lib/tradingPlatforms';

type Bullet = {title: string; desc: string};

/**
 * One resolved panel image, chosen server-side in PlatformTypes.
 * - `upload`    — owner-uploaded via the CMS, shown without a caption.
 * - `screenshot`— a real capture of HATC's own terminal; captioned to say the
 *                 quotes in it are a point in time, never labelled「示意」.
 * - `mockup`    — the Figma template's generic device render, always「示意」.
 */
export type PlatformVisual = {
  src: string;
  kind: 'upload' | 'screenshot' | 'mockup';
};

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
  visualNote,
  screenshotNote,
  ctaLabel,
  ctaHref,
  ctaExternal
}: {
  platforms: TradingPlatform[];
  visuals: PlatformVisual[];
  bullets: Bullet[];
  visualNote: string;
  screenshotNote: string;
  ctaLabel: string;
  ctaHref: string;
  ctaExternal: boolean;
}) {
  const [active, setActive] = useState(0);
  const current = platforms[active] ?? platforms[0];
  const visual = visuals[active] ?? visuals[0];

  if (!current || !visual) return null;

  const isPortrait = visual.kind === 'screenshot';

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
          <div
            className={cn(
              'relative flex items-center justify-center overflow-hidden rounded-[16px] border border-[var(--fig-border)]',
              // Terminal captures are phone-shaped, so they need a taller frame
              // to stay readable; the device mockups are landscape renders.
              isPortrait
                ? 'h-[460px] sm:h-[620px]'
                : 'h-[360px] sm:h-[440px]'
            )}
            style={{
              background:
                'radial-gradient(120% 120% at 30% 0%, rgba(212,175,55,0.18), transparent 55%), linear-gradient(150deg, #111625 0%, #070a14 100%)'
            }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(212,175,55,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.4) 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }}
            />
            <Image
              key={visual.src}
              src={visual.src}
              alt={visual.kind === 'mockup' ? '' : current.name}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-contain p-4"
            />
            {visual.kind === 'mockup' ? (
              <span className="absolute bottom-4 left-1/2 max-w-[90%] -translate-x-1/2 rounded-full bg-black/45 px-3 py-1 text-center text-[11px] text-white/75 backdrop-blur-sm">
                {visualNote}
              </span>
            ) : null}
          </div>
          {visual.kind === 'screenshot' ? (
            <p className="text-xs leading-[1.6] text-[var(--fig-text-muted)]">
              {screenshotNote}
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
