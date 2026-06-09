import { format, isToday, isTomorrow, isYesterday, isPast, startOfDay, addDays } from 'date-fns';
import type { Task, Filters } from './types';
import { PRIORITY_META } from './constants';

export function formatDue(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const time = format(d, 'h:mm a');
  if (isToday(d)) return `Today, ${time}`;
  if (isTomorrow(d)) return `Tomorrow, ${time}`;
  if (isYesterday(d)) return `Yesterday, ${time}`;
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return sameYear ? format(d, 'MMM d, h:mm a') : format(d, 'MMM d yyyy, h:mm a');
}

export function formatDateShort(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return format(d, 'MMM d');
}

export function isOverdue(iso?: string): boolean {
  if (!iso) return false;
  return isPast(new Date(iso)) && !isToday(new Date(iso));
}

export function startOfDayIso(d = new Date()): string {
  return startOfDay(d).toISOString();
}

export function addDaysIso(iso: string, days: number): string {
  return addDays(new Date(iso), days).toISOString();
}

export function applyFilters(tasks: Task[], f: Filters): Task[] {
  let out = tasks;
  const q = f.query.trim().toLowerCase();
  if (q) {
    out = out.filter((t) => {
      if (t.title.toLowerCase().includes(q)) return true;
      if (t.description?.toLowerCase().includes(q)) return true;
      if (t.subtasks.some((s) => s.title.toLowerCase().includes(q))) return true;
      return false;
    });
  }
  if (f.priorities.length) out = out.filter((t) => f.priorities.includes(t.priority));
  if (f.tagIds.length) out = out.filter((t) => t.tagIds.some((id) => f.tagIds.includes(id)));
  if (f.listIds.length) out = out.filter((t) => f.listIds.includes(t.listId));
  if (f.statuses.length) out = out.filter((t) => f.statuses.includes(t.status));

  const now = new Date();
  const todayStart = startOfDay(now).getTime();
  const tomorrowStart = startOfDay(addDays(now, 1)).getTime();
  if (f.hasDue !== 'any') {
    out = out.filter((t) => {
      const ts = t.dueAt ? new Date(t.dueAt).getTime() : null;
      if (f.hasDue === 'with') return ts !== null;
      if (f.hasDue === 'without') return ts === null;
      if (f.hasDue === 'overdue') return ts !== null && ts < todayStart;
      if (f.hasDue === 'today')
        return ts !== null && ts >= todayStart && ts < tomorrowStart;
      return true;
    });
  }

  const dir = f.dir === 'asc' ? 1 : -1;
  out = [...out].sort((a, b) => {
    switch (f.sort) {
      case 'priority':
        return (PRIORITY_META[a.priority].weight - PRIORITY_META[b.priority].weight) * dir;
      case 'dueAt': {
        const av = a.dueAt ? new Date(a.dueAt).getTime() : Infinity;
        const bv = b.dueAt ? new Date(b.dueAt).getTime() : Infinity;
        return (av - bv) * dir;
      }
      case 'createdAt':
        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
      case 'title':
        return a.title.localeCompare(b.title) * dir;
      case 'status': {
        const order = { todo: 0, in_progress: 1, done: 2 } as const;
        return (order[a.status] - order[b.status]) * dir;
      }
      default:
        return (a.order - b.order) * dir;
    }
  });
  return out;
}

export function isCompletedOn(task: Task, day: Date): boolean {
  if (!task.completedAt) return false;
  const a = startOfDay(new Date(task.completedAt)).getTime();
  const b = startOfDay(day).getTime();
  return a === b;
}

export function progress(task: Task): number {
  if (task.subtasks.length === 0) return task.status === 'done' ? 1 : 0;
  const done = task.subtasks.filter((s) => s.done).length;
  return done / task.subtasks.length;
}
