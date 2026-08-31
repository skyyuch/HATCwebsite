import * as React from 'react';
import {cva, type VariantProps} from 'class-variance-authority';
import {cn} from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium tracking-wide',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary',
        accent: 'bg-accent/12 text-accent',
        onDark: 'bg-white/10 text-white/90'
      }
    },
    defaultVariants: {variant: 'default'}
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({variant}), className)} {...props} />
  );
}

export {Badge, badgeVariants};
