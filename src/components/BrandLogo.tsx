import Image from 'next/image';
import {cn} from '@/lib/utils';

// Intrinsic dimensions of public/brand/hatc-logo.png (navy wordmark, transparent PNG).
const LOGO_W = 3065;
const LOGO_H = 903;
const RATIO = LOGO_W / LOGO_H;

/**
 * Brand logo (the real HATC wordmark from the original project). The mark is a
 * navy glyph on a transparent background. On dark surfaces (e.g. the footer) it
 * sits on a white rounded "chip" (mirrors the LP header treatment) to stay
 * legible; on light surfaces (the white Figma header) pass `chip={false}` to
 * render the bare wordmark. `height` is the rendered glyph height in px; width
 * is derived from the intrinsic ratio.
 */
export default function BrandLogo({
  height = 26,
  alt = 'HATC',
  priority = false,
  chip = true,
  className
}: {
  height?: number;
  alt?: string;
  priority?: boolean;
  chip?: boolean;
  className?: string;
}) {
  const width = Math.round(height * RATIO);

  return (
    <span
      className={cn(
        'inline-flex items-center',
        chip &&
          'rounded-[10px] bg-white px-3 py-1.5 shadow-[0_4px_12px_-6px_rgba(0,0,0,0.5)] ring-1 ring-[rgba(9,57,95,0.08)]',
        className
      )}
    >
      <Image
        src="/brand/hatc-logo.png"
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes={`${width}px`}
        className="block h-auto w-auto"
        style={{height, width}}
      />
    </span>
  );
}
