import Image from 'next/image';
import {cn} from '@/lib/utils';
import type {ImageAsset, PlatformVisual} from './platformVisuals';

/**
 * Deep-navy stage with a gold wash and faint geometry — the same treatment as
 * the homepage platform visual (owner 2026-10-11), minus the floating gold
 * solids that treatment used: those are on the avoid list in
 * docs/DESIGN_DIRECTION.md, so depth comes from gradients, thin outlines and
 * shadow instead.
 */
const PANEL_BACKDROP =
  'radial-gradient(85% 70% at 18% -5%, rgba(212,175,55,0.17), transparent 62%), ' +
  'radial-gradient(75% 70% at 105% 110%, rgba(26,51,102,0.62), transparent 62%), ' +
  'linear-gradient(158deg, #16203a 0%, #0b1120 58%, #070a14 100%)';

const GRID_LINES =
  'linear-gradient(rgba(212,175,55,0.5) 1px, transparent 1px), ' +
  'linear-gradient(90deg, rgba(212,175,55,0.5) 1px, transparent 1px)';

function PanelBackdrop() {
  return (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{backgroundImage: GRID_LINES, backgroundSize: '44px 44px'}}
      />
      <svg
        aria-hidden
        viewBox="0 0 400 400"
        fill="none"
        stroke="#d4af37"
        className="pointer-events-none absolute -right-20 -top-24 size-[300px] opacity-20"
      >
        <rect
          x="70"
          y="70"
          width="260"
          height="260"
          strokeWidth="1.5"
          transform="rotate(18 200 200)"
        />
        <rect
          x="128"
          y="128"
          width="144"
          height="144"
          strokeWidth="1"
          transform="rotate(-14 200 200)"
        />
      </svg>
      <svg
        aria-hidden
        viewBox="0 0 200 200"
        fill="none"
        stroke="#d4af37"
        className="pointer-events-none absolute -bottom-14 -left-12 size-[180px] opacity-[0.14]"
      >
        <rect
          x="40"
          y="40"
          width="120"
          height="120"
          strokeWidth="1.5"
          transform="rotate(24 100 100)"
        />
      </svg>
    </>
  );
}

/**
 * Phone frame for terminal captures.
 *
 * The capture is one whole phone screen, so the frame keeps its aspect ratio
 * and is sized from the panel's width — it deliberately runs past the bottom
 * edge of the panel. That keeps the device large enough to read while the
 * clipped bottom reads as an intentional product shot. Nothing is hidden by
 * the crop: the capture already stops above the terminal's buy/sell bar (see
 * platformVisuals.ts).
 */
function DeviceFrame({
  asset,
  alt,
  priority
}: {
  asset: ImageAsset;
  alt: string;
  priority?: boolean;
}) {
  return (
    <div className="absolute left-1/2 top-[7%] w-[70%] max-w-[340px] -translate-x-1/2 sm:w-[64%]">
      <div className="relative rounded-[32px] bg-[linear-gradient(165deg,#39414f_0%,#0b0f18_100%)] p-[6px] pt-[16px] shadow-[0_45px_90px_-28px_rgba(0,0,0,0.9)] ring-1 ring-white/15">
        <span
          aria-hidden
          className="absolute left-1/2 top-[7px] h-[4px] w-[46px] max-w-[26%] -translate-x-1/2 rounded-full bg-white/25"
        />
        <div
          className="relative overflow-hidden rounded-[26px] bg-white"
          style={{aspectRatio: `${asset.width} / ${asset.height}`}}
        >
          <Image
            src={asset.src}
            alt={alt}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 26vw, 60vw"
            className="object-cover object-top"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Shared presentation for every platform picture on the site. Pair it with
 * `resolvePlatformVisual` so the image precedence (CMS upload → real terminal
 * capture → official brand mark → branded fallback) stays identical across
 * `/platforms` and `/accounts`.
 *
 * `className` carries the surface's own height, radius and border.
 */
export default function PlatformVisualPanel({
  visual,
  label,
  alt,
  className,
  priority
}: {
  visual: PlatformVisual | null;
  /** Shown when there is no honest image for this platform. */
  label: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{background: PANEL_BACKDROP}}
    >
      <PanelBackdrop />

      {visual?.kind === 'screenshot' ? (
        <DeviceFrame asset={visual.asset} alt={alt} priority={priority} />
      ) : null}

      {visual?.kind === 'brand' ? (
        <div className="absolute inset-0 flex items-center justify-center p-10">
          <Image
            src={visual.asset.src}
            alt={alt}
            width={visual.asset.width}
            height={visual.asset.height}
            priority={priority}
            sizes="(min-width: 1024px) 30vw, 60vw"
            className="h-auto w-[66%] max-w-[300px]"
          />
        </div>
      ) : null}

      {visual?.kind === 'upload' ? (
        <Image
          src={visual.src}
          alt={alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="object-contain p-5"
        />
      ) : null}

      {visual ? null : (
        <div className="flex h-full items-center justify-center p-6">
          <span
            aria-hidden
            className="font-[family-name:var(--font-ticker)] text-2xl font-bold tracking-wide text-gold/90"
          >
            {label}
          </span>
        </div>
      )}
    </div>
  );
}
