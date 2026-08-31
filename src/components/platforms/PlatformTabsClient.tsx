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
 * Interactive platform tabs (Figma 92:28 + 92:50). Selecting a tab swaps the
 * detail panel; the value-prop bullets are shared across platforms. Device
 * visuals use the Figma template mockups as development placeholders (owner:
 * 「圖先用 Figma 的」) — app-style tabs show the phone mockup, others show the
 * multi-device render. These are generic charts renders (示意), NOT real HATC
 * platform screenshots, and are asset-replaceable later. `ctaHref` is an
 * operational open-account link resolved server-side (CMS), falling back to
 * /register.
 */
export default function PlatformTabsClient({
  platforms,
  bullets,
  visualNote,
  ctaLabel,
  ctaHref,
  ctaExternal
}: {
  platforms: TradingPlatform[];
  bullets: Bullet[];
  visualNote: string;
  ctaLabel: string;
  ctaHref: string;
  ctaExternal: boolean;
}) {
  const [active, setActive] = useState(0);
  const current = platforms[active] ?? platforms[0];

  if (!current) return null;

  const isApp = /app|應用|应用/i.test(
    `${current.panelLabel} ${current.name}`
  );
  const fallbackSrc = isApp
    ? '/figma/platforms/detail-phone.png'
    : '/figma/platforms/hero-devices.png';
  // Prefer the CMS-uploaded per-platform screenshot; else the Figma sample mockup.
  const visualSrc = current.visual ?? fallbackSrc;
  const isSample = !current.visual;

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
        <div
          className="relative flex h-[360px] items-center justify-center overflow-hidden rounded-[16px] border border-[var(--fig-border)] sm:h-[440px]"
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
            key={visualSrc}
            src={visualSrc}
            alt={isSample ? '' : current.name}
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-contain p-4"
          />
          {isSample ? (
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/45 px-3 py-1 text-[11px] text-white/75 backdrop-blur-sm">
              {visualNote}
            </span>
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
