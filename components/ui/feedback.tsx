'use client';

import { cn } from '@/lib/utils';
import { PRIORITY_META } from '@/lib/constants';
import type { Priority } from '@/lib/types';

export function Progress({ value, className }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-elev-2)]', className)}
    >
      <div
        className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function PriorityDot({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('inline-block h-2 w-2 shrink-0 rounded-full', PRIORITY_META[priority].dot, className)}
    />
  );
}
