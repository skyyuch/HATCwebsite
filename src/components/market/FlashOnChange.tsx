'use client';

import {useState} from 'react';
import {cn} from '@/lib/utils';

/**
 * Tints a price green or red for a moment whenever it moves.
 *
 * With the tick stream in place a quote can change more than once a second,
 * and a number that simply swaps digits reads as a glitch. The flash is the
 * standard institutional cue for direction, and it is the only thing that
 * tells the eye *which way* a price just went.
 *
 * `value` must be the numeric price, not its formatted string: formatting
 * rounds, so two different prices can render identically and the move would be
 * invisible. Pass `null` for sample data, which never moves.
 *
 * The animation restarts on every change by remounting the span (a CSS
 * animation does not replay while its class stays applied). Users who ask for
 * reduced motion get the plain number — see `globals.css`.
 */
type Flash = {direction: 'up' | 'down'; nonce: number};

export default function FlashOnChange({
  value,
  className,
  children
}: {
  value: number | null;
  className?: string;
  children: React.ReactNode;
}) {
  // Comparing against the previous render's value is React's documented way to
  // react to a changed prop without an effect: the adjustment happens during
  // render, so the flash is painted in the same frame as the new price.
  const [seen, setSeen] = useState<number | null>(value);
  const [flash, setFlash] = useState<Flash | null>(null);

  if (value !== seen) {
    if (value !== null && seen !== null) {
      const direction = value > seen ? 'up' : 'down';
      setFlash((previous) => ({direction, nonce: (previous?.nonce ?? 0) + 1}));
    }
    setSeen(value);
  }

  return (
    <span
      key={flash?.nonce ?? 0}
      className={cn(
        className,
        flash &&
          (flash.direction === 'up' ? 'price-flash-up' : 'price-flash-down')
      )}
    >
      {children}
    </span>
  );
}
