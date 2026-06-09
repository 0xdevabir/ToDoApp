import type { Priority, TaskStatus, AccentColor } from './types';

export const PRIORITY_META: Record<
  Priority,
  { label: string; weight: number; ring: string; chip: string; dot: string }
> = {
  low: {
    label: 'Low',
    weight: 1,
    ring: 'ring-sky-500/40',
    chip: 'bg-sky-500/10 text-sky-600 dark:text-sky-300',
    dot: 'bg-sky-500',
  },
  medium: {
    label: 'Medium',
    weight: 2,
    ring: 'ring-amber-500/40',
    chip: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  high: {
    label: 'High',
    weight: 3,
    ring: 'ring-orange-500/40',
    chip: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
    dot: 'bg-orange-500',
  },
  urgent: {
    label: 'Urgent',
    weight: 4,
    ring: 'ring-rose-500/50',
    chip: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
    dot: 'bg-rose-500',
  },
};

export const STATUS_META: Record<TaskStatus, { label: string; color: string }> = {
  todo: { label: 'To Do', color: 'bg-zinc-500' },
  in_progress: { label: 'In Progress', color: 'bg-blue-500' },
  done: { label: 'Done', color: 'bg-emerald-500' },
};

export const ACCENT_HEX: Record<AccentColor, string> = {
  indigo: '#6366f1',
  violet: '#8b5cf6',
  pink: '#ec4899',
  rose: '#f43f5e',
  amber: '#f59e0b',
  emerald: '#10b981',
  cyan: '#06b6d4',
  sky: '#0ea5e9',
};

export const ACCENT_LABELS: Record<AccentColor, string> = {
  indigo: 'Indigo',
  violet: 'Violet',
  pink: 'Pink',
  rose: 'Rose',
  amber: 'Amber',
  emerald: 'Emerald',
  cyan: 'Cyan',
  sky: 'Sky',
};

export const TAG_PALETTE = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#84cc16',
  '#10b981',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#64748b',
];

export const LIST_PALETTE = [
  '#6366f1',
  '#ec4899',
  '#10b981',
  '#f59e0b',
  '#06b6d4',
  '#8b5cf6',
  '#ef4444',
  '#64748b',
];
