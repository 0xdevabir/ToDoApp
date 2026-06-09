import type { Priority, TaskStatus, AccentColor } from './types';

export const PRIORITY_META: Record<
  Priority,
  { label: string; weight: number; dot: string }
> = {
  low: {
    label: 'Low',
    weight: 1,
    dot: '#8a9aa0',
  },
  medium: {
    label: 'Medium',
    weight: 2,
    dot: '#b88534',
  },
  high: {
    label: 'High',
    weight: 3,
    dot: '#c2733a',
  },
  urgent: {
    label: 'Urgent',
    weight: 4,
    dot: '#a8412f',
  },
};

export const STATUS_META: Record<TaskStatus, { label: string; color: string }> = {
  todo: { label: 'To Do', color: '#8a8a90' },
  in_progress: { label: 'In Progress', color: '#b88534' },
  done: { label: 'Done', color: '#6c8a5e' },
};

export const ACCENT_HEX: Record<AccentColor, string> = {
  amber: '#b88534',
  sand: '#a8916a',
  sage: '#6c8a5e',
  plum: '#7a4f6b',
  ink: '#3b3a40',
  slate: '#5a6b78',
};

export const ACCENT_LABELS: Record<AccentColor, string> = {
  amber: 'Amber',
  sand: 'Sand',
  sage: 'Sage',
  plum: 'Plum',
  ink: 'Ink',
  slate: 'Slate',
};

// Desaturated, editorial tag palette (works on both light and dark)
export const TAG_PALETTE = [
  '#a8412f', // brick
  '#c2733a', // rust
  '#b88534', // amber
  '#8a8a5e', // olive
  '#6c8a5e', // sage
  '#4a6b80', // teal-blue
  '#5a6b78', // slate
  '#7a4f6b', // plum
  '#8a6b8e', // mauve
  '#6c6a64', // graphite
];

// Lists use the same restrained palette
export const LIST_PALETTE = [
  '#b88534',
  '#7a4f6b',
  '#6c8a5e',
  '#a8412f',
  '#4a6b80',
  '#5a6b78',
  '#c2733a',
  '#6c6a64',
];
