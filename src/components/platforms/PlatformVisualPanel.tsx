import Image from 'next/image';
import {cn} from '@/lib/utils';
import type {ImageAsset, PlatformVisual} from './platformVisuals';

const PANEL_BACKDROP =
  'radial-gradient(120% 120% at 30% 0%, rgba(212,175,55,0.18), transparent 55%), linear-gradient(150deg, #111625 0%, #070a14 100%)';

/**
 * Device bezel for terminal captures. The frame takes its proportions from the
 * screenshot itself rather than forcing a stock phone aspect, so nothing is
 * cropped — the captures are already trimmed above the buy/sell bar and must
 * stay readable end to end.
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
    <div className="flex h-full items-center justify-center p-6">
      {/*
        The frame is sized from the capture's own aspect ratio rather than a
        stock phone ratio, so nothing is cropped: these screenshots are already
        trimmed above the terminal's buy/sell bar and have to stay readable end
        to end.
      */}
      <div
        className="relative h-full max-w-full"
        style={{aspectRatio: `${asset.width} / ${asset.height}`}}
      >
        <div className="absolute inset-0 rounded-[30px] bg-[linear-gradient(160deg,#2b3142_0%,#0d111c_100%)] p-[7px] pt-[16px] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.75)] ring-1 ring-white/10">
          <span
            aria-hidden
            className="absolute left-1/2 top-[6px] h-[4px] w-[42px] max-w-[30%] -translate-x-1/2 rounded-full bg-white/25"
          />
          <div className="relative h-full w-full overflow-hidden rounded-[23px] bg-white">
            <Image
              src={asset.src}
              alt={alt}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 30vw, 60vw"
              className="object-contain"
            />
          </div>
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
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(212,175,55,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.4) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {visual?.kind === 'screenshot' ? (
        <DeviceFrame asset={visual.asset} alt={alt} priority={priority} />
      ) : null}

      {visual?.kind === 'brand' ? (
        <div className="flex h-full items-center justify-center p-8">
          <Image
            src={visual.asset.src}
            alt={alt}
            width={visual.asset.width}
            height={visual.asset.height}
            priority={priority}
            sizes="(min-width: 1024px) 30vw, 60vw"
            className="h-auto w-[62%] max-w-[320px]"
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
