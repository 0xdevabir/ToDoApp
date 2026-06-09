'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export function Badge({
  className,
  children,
  style,
}: React.HTMLAttributes<HTMLSpanElement> & { style?: React.CSSProperties }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-5',
        className,
      )}
      style={style}
    >
      {children}
    </span>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--bg-elev-2)] px-1.5 text-[10px] font-medium text-[var(--fg-muted)] shadow-sm">
      {children}
    </kbd>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-elev)]/50 px-6 py-12 text-center animate-[fade-in_0.2s_ease-out]">
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-[var(--fg)]">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm text-[var(--fg-muted)]">{description}</p>
      )}
      {action}
    </div>
  );
}
