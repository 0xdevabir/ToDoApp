'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check, ChevronDown } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
  color?: string;
}

interface SelectProps {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function Select({ value, onChange, options, placeholder, className, size = 'md' }: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn('relative inline-flex', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'inline-flex w-full items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] text-sm text-[var(--fg)] shadow-[var(--shadow-sm)] transition-colors hover:bg-[var(--bg-elev-2)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
          size === 'sm' ? 'h-7 px-2 text-xs' : 'h-9 px-3',
        )}
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-2 truncate">
          {current?.icon}
          {current?.color && (
            <span className="h-2 w-2 rounded-full" style={{ background: current.color }} />
          )}
          <span className="truncate">{current?.label ?? placeholder ?? 'Select'}</span>
        </span>
        <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-full z-30 mt-1 max-h-72 w-max min-w-full overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] p-1 shadow-[var(--shadow-lg)] animate-[pop_0.14s_ease-out]"
        >
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors',
                  active ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'hover:bg-[var(--bg-elev-2)]',
                )}
              >
                {opt.icon}
                {opt.color && <span className="h-2 w-2 rounded-full" style={{ background: opt.color }} />}
                <span className="flex-1 truncate">{opt.label}</span>
                {active && <Check className="h-3.5 w-3.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
