'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const button = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--accent)] text-[var(--accent-fg)] hover:brightness-110 shadow-[var(--shadow-sm)]',
        secondary:
          'bg-[var(--bg-elev-2)] text-[var(--fg)] hover:bg-[var(--border)] border border-[var(--border)]',
        ghost: 'text-[var(--fg)] hover:bg-[var(--bg-elev-2)]',
        outline:
          'border border-[var(--border)] text-[var(--fg)] hover:bg-[var(--bg-elev-2)]',
        danger:
          'bg-[var(--danger)] text-white hover:brightness-110 shadow-[var(--shadow-sm)]',
        soft: 'bg-[var(--accent-soft)] text-[var(--accent)] hover:brightness-110',
      },
      size: {
        xs: 'h-7 px-2 text-xs',
        sm: 'h-8 px-3',
        md: 'h-9 px-4',
        lg: 'h-10 px-5 text-base',
        icon: 'h-9 w-9 p-0',
        iconSm: 'h-7 w-7 p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => (
    <button ref={ref} type={type} className={cn(button({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = 'Button';
