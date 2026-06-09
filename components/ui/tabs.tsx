'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export function Tabs({
  value,
  onChange,
  options,
  size = 'md',
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: React.ReactNode; icon?: React.ReactNode }[];
  size?: 'sm' | 'md';
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center gap-0.5 rounded-xl border border-[var(--border)] bg-[var(--bg-elev)] p-0.5 shadow-[var(--shadow-sm)]',
        className,
      )}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg font-medium transition-colors',
              size === 'sm' ? 'h-7 px-2.5 text-xs' : 'h-8 px-3 text-sm',
              active
                ? 'bg-[var(--bg-elev-2)] text-[var(--fg)] shadow-sm'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg)]',
            )}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
