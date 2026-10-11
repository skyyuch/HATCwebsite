import Image from 'next/image';
import {Lock} from 'lucide-react';
import {cn} from '@/lib/utils';
import {
  WEB_TERMINAL_HOST,
  type ImageAsset,
  type PlatformVisual
} from './platformVisuals';

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

const BEZEL = 'bg-[linear-gradient(165deg,#39414f_0%,#0b0f18_100%)]';
const DEVICE_SHADOW = 'shadow-[0_45px_90px_-28px_rgba(0,0,0,0.9)]';

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
 * Screen inside a frame. The capture keeps its own aspect ratio — a percentage
 * height would collapse to `auto` inside an auto-height flex item, which is how
 * an 860px-wide capture once overflowed its card.
 */
function Screen({
  asset,
  alt,
  priority,
  sizes,
  className
}: {
  asset: ImageAsset;
  alt: string;
  priority?: boolean;
  sizes: string;
  className?: string;
}) {
  return (
    <div
      className={cn('relative overflow-hidden bg-white', className)}
      style={{aspectRatio: `${asset.width} / ${asset.height}`}}
    >
      <Image
        src={asset.src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover object-top"
      />
    </div>
  );
}

/**
 * Phone frame for the app captures. Sized from the panel width and allowed to
 * run past the panel's bottom edge: that keeps the screen large enough to read
 * and nothing is hidden by the crop, because the capture already stops above
 * the terminal's buy/sell bar (see platformVisuals.ts).
 */
function PhoneFrame({
  asset,
  alt,
  priority,
  className,
  sizes = '(min-width: 1024px) 26vw, 60vw'
}: {
  asset: ImageAsset;
  alt: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  return (
    <div className={className}>
      <div
        className={cn(
          'relative rounded-[32px] p-[6px] pt-[16px] ring-1 ring-white/15',
          BEZEL,
          DEVICE_SHADOW
        )}
      >
        <span
          aria-hidden
          className="absolute left-1/2 top-[7px] h-[4px] w-[46px] max-w-[26%] -translate-x-1/2 rounded-full bg-white/25"
        />
        <Screen
          asset={asset}
          alt={alt}
          priority={priority}
          sizes={sizes}
          className="rounded-[26px]"
        />
      </div>
    </div>
  );
}

/**
 * Browser window for the web-terminal captures. The chrome is our own markup —
 * the capture carries none, so the host that was captured can never leak. The
 * address pill shows HATC's production web-terminal host.
 */
function BrowserFrame({
  asset,
  alt,
  priority,
  className,
  sizes = '(min-width: 1024px) 34vw, 85vw'
}: {
  asset: ImageAsset;
  alt: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  return (
    <div className={className}>
      <div
        className={cn(
          'overflow-hidden rounded-[12px] ring-1 ring-white/15',
          BEZEL,
          DEVICE_SHADOW
        )}
      >
        <div className="flex items-center gap-2 px-3 py-2">
          <span aria-hidden className="flex gap-1.5">
            <span className="size-[7px] rounded-full bg-white/25" />
            <span className="size-[7px] rounded-full bg-white/25" />
            <span className="size-[7px] rounded-full bg-white/25" />
          </span>
          <span className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full bg-black/35 px-2.5 py-1">
            <Lock aria-hidden className="size-2.5 shrink-0 text-white/45" />
            <span className="truncate text-[9px] tracking-wide text-white/55">
              {WEB_TERMINAL_HOST}
            </span>
          </span>
        </div>
        <Screen asset={asset} alt={alt} priority={priority} sizes={sizes} />
      </div>
    </div>
  );
}

/**
 * Monitor frame for a platform vendor's own screen (MetaTrader 5). That capture
 * already contains the application's own window chrome, so the frame stays a
 * plain bezel instead of adding a second title bar.
 */
function MonitorFrame({
  asset,
  alt,
  priority
}: {
  asset: ImageAsset;
  alt: string;
  priority?: boolean;
}) {
  return (
    <div className="absolute left-1/2 top-1/2 w-[86%] max-w-[560px] -translate-x-1/2 -translate-y-1/2">
      <div
        className={cn(
          'overflow-hidden rounded-[10px] p-[5px] ring-1 ring-white/15',
          BEZEL,
          DEVICE_SHADOW
        )}
      >
        <Screen
          asset={asset}
          alt={alt}
          priority={priority}
          sizes="(min-width: 1024px) 34vw, 85vw"
          className="rounded-[6px]"
        />
      </div>
      <span
        aria-hidden
        className="mx-auto mt-1 block h-[5px] w-[18%] rounded-b-[3px] bg-white/15"
      />
    </div>
  );
}

/**
 * Shared presentation for every platform picture on the site. Pair it with
 * `resolvePlatformVisual` (image precedence) and `visualNote` (which caption to
 * print) so `/platforms` and `/accounts` stay identical.
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

      {visual?.kind === 'phone' ? (
        <PhoneFrame
          asset={visual.asset}
          alt={alt}
          priority={priority}
          className="absolute left-1/2 top-[7%] w-[70%] max-w-[340px] -translate-x-1/2 sm:w-[64%]"
        />
      ) : null}

      {visual?.kind === 'browser' ? (
        <BrowserFrame
          asset={visual.asset}
          alt={alt}
          priority={priority}
          className="absolute left-1/2 top-1/2 w-[92%] max-w-[560px] -translate-x-1/2 -translate-y-1/2 sm:w-[88%]"
        />
      ) : null}

      {/* Hero: the web terminal with the app overlapping it. */}
      {visual?.kind === 'combo' ? (
        <>
          <BrowserFrame
            asset={visual.desktop}
            alt={alt}
            priority={priority}
            className="absolute left-[2%] top-[8%] w-[78%] max-w-[520px]"
            sizes="(min-width: 1024px) 32vw, 78vw"
          />
          <PhoneFrame
            asset={visual.phone}
            alt={alt}
            priority={priority}
            className="absolute bottom-[-16%] right-[3%] w-[31%] max-w-[168px]"
            sizes="(min-width: 1024px) 12vw, 30vw"
          />
        </>
      ) : null}

      {visual?.kind === 'vendor' ? (
        <MonitorFrame asset={visual.asset} alt={alt} priority={priority} />
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
