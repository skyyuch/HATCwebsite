import * as React from 'react';
import {Slot} from '@radix-ui/react-slot';
import {cva, type VariantProps} from 'class-variance-authority';
import {cn} from '@/lib/utils';

// Buttons use a 6px radius across the shared design system (owner 2026-08-10,
// Figma-led) — no longer pill. The `gold` variant is the Figma primary CTA.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[6px] text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-brand-deep',
        accent: 'bg-accent text-accent-foreground hover:opacity-90',
        outline:
          'border border-input bg-transparent text-foreground hover:bg-muted',
        ghost: 'text-foreground hover:bg-muted',
        light: 'bg-white text-primary hover:bg-white/90',
        // Figma primary CTA: solid gold with near-black text.
        gold: 'bg-gold text-[#070a14] hover:bg-[#e0bd4a]',
        // Figma secondary CTA on dark/imagery: 1.5px translucent white frame.
        onDark:
          'border-[1.5px] border-white/30 bg-transparent text-white hover:bg-white/10'
      },
      size: {
        default: 'h-11 px-6 py-2',
        sm: 'h-9 px-4',
        lg: 'h-12 px-8 text-base',
        // Figma CTA metrics: px24 py12.
        fig: 'h-[46px] px-6 py-3 text-[15px]'
      }
    },
    defaultVariants: {variant: 'default', size: 'default'}
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {asChild?: boolean}) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp className={cn(buttonVariants({variant, size, className}))} {...props} />
  );
}

export {Button, buttonVariants};
