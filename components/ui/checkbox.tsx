'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <span className="relative inline-flex">
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        'peer h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-md border border-[var(--border-strong)] bg-[var(--bg-elev)] transition',
        'checked:border-[var(--accent)] checked:bg-[var(--accent)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
    <svg
      viewBox="0 0 16 16"
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 h-4 w-4 stroke-white opacity-0 peer-checked:opacity-100"
    >
      <path d="M3 8.5l3 3 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" stroke="currentColor" />
    </svg>
  </span>
));
Checkbox.displayName = 'Checkbox';

export const Switch = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { checked: boolean; onCheckedChange: (v: boolean) => void }
>(({ checked, onCheckedChange, className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onCheckedChange(!checked)}
    className={cn(
      'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors',
      checked ? 'bg-[var(--accent)]' : 'bg-[var(--border-strong)]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
      className,
    )}
    {...props}
  >
    <span
      className={cn(
        'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition',
        checked ? 'translate-x-4' : 'translate-x-0.5',
      )}
    />
  </button>
));
Switch.displayName = 'Switch';
