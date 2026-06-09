'use client';

import { useApp } from '@/lib/store';
import { Select, Button } from '@/components/ui';
import { PRIORITY_META } from '@/lib/constants';
import { Filter, X, ArrowDownAZ, ArrowUpAZ, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Priority, TaskStatus } from '@/lib/types';
import { STATUS_META } from '@/lib/constants';

const dueOptions = [
  { value: 'any', label: 'Any' },
  { value: 'with', label: 'With date' },
  { value: 'without', label: 'No date' },
  { value: 'today', label: 'Today' },
  { value: 'overdue', label: 'Overdue' },
];

const sortOptions = [
  { value: 'manual', label: 'Manual' },
  { value: 'priority', label: 'Priority' },
  { value: 'dueAt', label: 'Due date' },
  { value: 'createdAt', label: 'Created' },
  { value: 'title', label: 'Title' },
  { value: 'status', label: 'Status' },
];

export function FilterBar() {
  const filters = useApp((s) => s.filters);
  const setFilters = useApp((s) => s.setFilters);
  const resetFilters = useApp((s) => s.resetFilters);

  const activeCount =
    filters.priorities.length +
    filters.tagIds.length +
    filters.listIds.length +
    filters.statuses.length +
    (filters.hasDue !== 'any' ? 1 : 0) +
    (filters.sort !== 'manual' ? 1 : 0);

  const togglePriority = (p: Priority) =>
    setFilters({
      priorities: filters.priorities.includes(p)
        ? filters.priorities.filter((x) => x !== p)
        : [...filters.priorities, p],
    });
  const toggleStatus = (s: TaskStatus) =>
    setFilters({
      statuses: filters.statuses.includes(s)
        ? filters.statuses.filter((x) => x !== s)
        : [...filters.statuses, s],
    });

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <div className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-2 py-1 text-xs text-[var(--fg-muted)]">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        <span>Filters</span>
        {activeCount > 0 && (
          <span className="ml-0.5 rounded bg-[var(--accent-soft)] px-1.5 text-[var(--accent)]">{activeCount}</span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1">
        {(Object.keys(PRIORITY_META) as Priority[]).map((p) => {
          const active = filters.priorities.includes(p);
          return (
            <button
              key={p}
              onClick={() => togglePriority(p)}
              className={cn(
                'inline-flex h-7 items-center gap-1.5 rounded-md border px-2 text-xs transition-colors',
                active
                  ? 'border-transparent text-white'
                  : 'border-[var(--border)] bg-[var(--bg-elev)] text-[var(--fg-muted)] hover:text-[var(--fg)]',
              )}
              style={active ? { background: 'var(--accent)' } : undefined}
            >
              <span
                className={cn('h-1.5 w-1.5 rounded-full', active ? 'bg-white' : PRIORITY_META[p].dot)}
              />
              {PRIORITY_META[p].label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-1">
        {(Object.keys(STATUS_META) as TaskStatus[]).map((s) => {
          const active = filters.statuses.includes(s);
          return (
            <button
              key={s}
              onClick={() => toggleStatus(s)}
              className={cn(
                'inline-flex h-7 items-center gap-1.5 rounded-md border px-2 text-xs transition-colors',
                active
                  ? 'border-transparent bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'border-[var(--border)] bg-[var(--bg-elev)] text-[var(--fg-muted)] hover:text-[var(--fg)]',
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', STATUS_META[s].color)} />
              {STATUS_META[s].label}
            </button>
          );
        })}
      </div>

      <Select
        size="sm"
        value={filters.hasDue}
        onChange={(v) => setFilters({ hasDue: v as typeof filters.hasDue })}
        options={dueOptions}
      />

      <Select
        size="sm"
        value={filters.sort}
        onChange={(v) => setFilters({ sort: v as typeof filters.sort })}
        options={sortOptions}
      />

      <button
        onClick={() => setFilters({ dir: filters.dir === 'asc' ? 'desc' : 'asc' })}
        className="inline-flex h-7 items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--bg-elev)] px-2 text-xs text-[var(--fg-muted)] hover:text-[var(--fg)]"
        aria-label="Toggle sort direction"
        title={`Sort ${filters.dir === 'asc' ? 'ascending' : 'descending'}`}
      >
        {filters.dir === 'asc' ? <ArrowDownAZ className="h-3.5 w-3.5" /> : <ArrowUpAZ className="h-3.5 w-3.5" />}
        {filters.dir.toUpperCase()}
      </button>

      {activeCount > 0 && (
        <Button size="xs" variant="ghost" onClick={resetFilters}>
          <X className="h-3 w-3" /> Clear
        </Button>
      )}
    </div>
  );
}
