'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export function Tooltip({
  children,
  label,
  side = 'top',
  className,
}: {
  children: React.ReactElement;
  label: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLSpanElement>(null);

  return (
    <span
      ref={ref}
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className={cn(
            'pointer-events-none absolute z-50 whitespace-nowrap rounded-md border border-[var(--border)] bg-[var(--bg-elev)] px-2 py-1 text-xs font-medium text-[var(--fg)] shadow-[var(--shadow-md)] animate-[fade-in_0.1s_ease-out]',
            side === 'top' && 'bottom-full left-1/2 mb-1.5 -translate-x-1/2',
            side === 'bottom' && 'left-1/2 top-full mt-1.5 -translate-x-1/2',
            side === 'left' && 'right-full top-1/2 mr-1.5 -translate-y-1/2',
            side === 'right' && 'left-full top-1/2 ml-1.5 -translate-y-1/2',
          )}
        >
          {label}
        </span>
      )}
    </span>
  );
}
