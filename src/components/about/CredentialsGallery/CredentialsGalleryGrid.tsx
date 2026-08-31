'use client';

import {useCallback, useEffect, useState} from 'react';
import Image from 'next/image';
import {cn} from '@/lib/utils';

export type GalleryItem = {
  src: string;
  alt: string;
  label: string;
  fit: 'cover' | 'contain';
};

type Props = {
  license: GalleryItem;
  office: GalleryItem;
  honor: GalleryItem;
  document: GalleryItem;
  customs: GalleryItem;
  zoomHint: string;
  closeLabel: string;
};

function ZoomIcon({className}: {className?: string}) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

function GalleryFigure({
  item,
  className,
  priority = false,
  zoomHint,
  onOpen
}: {
  item: GalleryItem;
  className?: string;
  priority?: boolean;
  zoomHint: string;
  onOpen: (item: GalleryItem) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      aria-label={`${item.label} — ${zoomHint}`}
      className={cn(
        'group relative block w-full overflow-hidden rounded-lg border border-[var(--fig-border)] bg-[var(--fig-surface)] text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70',
        className
      )}
    >
      <Image
        src={item.src}
        alt={item.alt}
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        priority={priority}
        className={cn(
          'transition-transform duration-500 group-hover:scale-[1.03]',
          item.fit === 'contain' ? 'object-contain p-3' : 'object-cover'
        )}
      />
      <span className="pointer-events-none absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-[rgba(7,10,20,0.55)] text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100 group-focus-visible:opacity-100">
        <ZoomIcon />
      </span>
      <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(7,10,20,0.92)] to-transparent px-4 py-3 text-[13px] font-semibold text-white">
        {item.label}
      </span>
    </button>
  );
}

export default function CredentialsGalleryGrid({
  license,
  office,
  honor,
  document: doc,
  customs,
  zoomHint,
  closeLabel
}: Props) {
  const [active, setActive] = useState<GalleryItem | null>(null);

  const close = useCallback(() => setActive(null), []);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [active, close]);

  return (
    <>
      {/* Figma 12:138 credentials-grid: large left + two stacked right. */}
      <div className="grid gap-6 lg:grid-cols-12">
        <GalleryFigure
          item={license}
          zoomHint={zoomHint}
          onOpen={setActive}
          priority
          className="h-[320px] sm:h-[420px] lg:col-span-8 lg:h-[420px]"
        />
        <div className="grid gap-6 lg:col-span-4">
          <GalleryFigure
            item={office}
            zoomHint={zoomHint}
            onOpen={setActive}
            className="h-[198px]"
          />
          <GalleryFigure
            item={honor}
            zoomHint={zoomHint}
            onOpen={setActive}
            className="h-[198px]"
          />
        </div>
      </div>

      {/* Figma 16:12 wide frame: participant cert + DPMS. */}
      <div className="grid gap-6 sm:grid-cols-2">
        <GalleryFigure
          item={doc}
          zoomHint={zoomHint}
          onOpen={setActive}
          className="h-[240px] sm:h-[280px]"
        />
        <GalleryFigure
          item={customs}
          zoomHint={zoomHint}
          onOpen={setActive}
          className="h-[240px] sm:h-[280px]"
        />
      </div>

      {active ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.label}
          onClick={close}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(4,6,12,0.88)] p-4 backdrop-blur-sm sm:p-8"
        >
          <button
            type="button"
            onClick={close}
            aria-label={closeLabel}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-[rgba(7,10,20,0.6)] text-white transition hover:bg-[rgba(7,10,20,0.85)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <figure
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-full max-w-[1100px] flex-col items-center gap-4"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.src}
              alt={active.alt}
              className="max-h-[82vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
            />
            <figcaption className="text-center text-sm font-semibold text-white">
              {active.label}
            </figcaption>
          </figure>
        </div>
      ) : null}
    </>
  );
}
