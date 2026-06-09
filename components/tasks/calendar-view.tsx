'use client';

import { useApp } from '@/lib/store';
import { useMemo, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarDays, Plus } from 'lucide-react';
import { PageHeader } from '@/components/shell/page-header';
import { Button, EmptyState } from '@/components/ui';
import { applyFilters } from '@/lib/filters';
import { useTaskModal } from '@/components/shell/task-modal';
import { PRIORITY_META } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function CalendarView() {
  const tasks = useApp((s) => s.tasks);
  const filters = useApp((s) => s.filters);
  const setSettings = useApp((s) => s.setSettings);
  const settings = useApp((s) => s.settings);
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState<Date | null>(new Date());
  const taskModal = useTaskModal();

  const filtered = useMemo(() => applyFilters(tasks, filters), [tasks, filters]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: settings.weekStartsOn });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: settings.weekStartsOn });
    return eachDayOfInterval({ start, end });
  }, [cursor, settings.weekStartsOn]);

  const byDay = useMemo(() => {
    const map = new Map<string, typeof tasks>();
    for (const t of filtered) {
      if (!t.dueAt) continue;
      const key = format(new Date(t.dueAt), 'yyyy-MM-dd');
      const arr = map.get(key) ?? [];
      arr.push(t);
      map.set(key, arr);
    }
    return map;
  }, [filtered]);

  const dayNames = useMemo(() => {
    const base = settings.weekStartsOn === 0
      ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return base;
  }, [settings.weekStartsOn]);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={<CalendarDays className="h-5 w-5" />}
        title="Calendar"
        subtitle={format(cursor, 'MMMM yyyy')}
        actions={
          <>
            <div className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] p-0.5">
              <button
                onClick={() => setCursor((d) => subMonths(d, 1))}
                className="grid h-7 w-7 place-items-center rounded-md text-[var(--fg-muted)] hover:bg-[var(--bg-elev-2)] hover:text-[var(--fg)]"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setCursor(new Date());
                  setSelected(new Date());
                }}
                className="px-2 text-xs text-[var(--fg-muted)] hover:text-[var(--fg)]"
              >
                Today
              </button>
              <button
                onClick={() => setCursor((d) => addMonths(d, 1))}
                className="grid h-7 w-7 place-items-center rounded-md text-[var(--fg-muted)] hover:bg-[var(--bg-elev-2)] hover:text-[var(--fg)]"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <Button
              variant={settings.weekStartsOn === 1 ? 'soft' : 'secondary'}
              size="sm"
              onClick={() => setSettings({ weekStartsOn: settings.weekStartsOn === 0 ? 1 : 0 })}
            >
              Week: {settings.weekStartsOn === 0 ? 'Sun' : 'Mon'}
            </Button>
            <Button onClick={() => taskModal.open()}>
              <Plus className="h-4 w-4" /> New
            </Button>
          </>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elev)]">
        <div className="grid grid-cols-7 border-b border-[var(--border)] bg-[var(--bg-elev-2)]/50 text-[11px] font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
          {dayNames.map((d) => (
            <div key={d} className="px-3 py-2 text-center">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((d) => {
            const key = format(d, 'yyyy-MM-dd');
            const list = byDay.get(key) ?? [];
            const inMonth = isSameMonth(d, cursor);
            const isSel = selected ? isSameDay(d, selected) : false;
            return (
              <button
                key={key}
                onClick={() => setSelected(d)}
                className={cn(
                  'group relative flex min-h-[100px] flex-col gap-1 border-b border-r border-[var(--border)] p-1.5 text-left transition-colors',
                  inMonth ? 'bg-[var(--bg-elev)]' : 'bg-[var(--bg-elev-2)]/30 text-[var(--fg-subtle)]',
                  isSel && 'ring-2 ring-inset ring-[var(--accent)]',
                  !isSel && 'hover:bg-[var(--bg-elev-2)]',
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                      isToday(d) && 'bg-[var(--accent)] text-[var(--accent-fg)]',
                    )}
                  >
                    {format(d, 'd')}
                  </span>
                  {list.length > 0 && (
                    <span className="text-[10px] text-[var(--fg-muted)]">
                      {list.length}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-0.5 overflow-hidden">
                  {list.slice(0, 3).map((t) => (
                    <span
                      key={t.id}
                      className={cn(
                        'truncate rounded px-1 py-0.5 text-[10px] font-medium',
                        'bg-[var(--bg-elev-2)] text-[var(--fg)]',
                      )}
                      title={t.title}
                    >
                      <span
                        className={cn('mr-1 inline-block h-1.5 w-1.5 rounded-full align-middle', PRIORITY_META[t.priority].dot)}
                      />
                      {t.title}
                    </span>
                  ))}
                  {list.length > 3 && (
                    <span className="text-[10px] text-[var(--fg-muted)]">+{list.length - 3} more</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            key={selected.toISOString()}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elev)] p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold">
                  {format(selected, 'EEEE, MMM d')}
                </h3>
                <p className="text-xs text-[var(--fg-muted)]">
                  {(byDay.get(format(selected, 'yyyy-MM-dd')) ?? []).length} task(s)
                </p>
              </div>
              <Button
                size="sm"
                onClick={() =>
                  taskModal.open(undefined, {
                    listId: 'inbox',
                  })
                }
              >
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
            <DayTaskList day={selected} tasks={byDay.get(format(selected, 'yyyy-MM-dd')) ?? []} />
          </motion.div>
        )}
      </AnimatePresence>

      {filtered.length === 0 && (
        <EmptyState
          icon={<CalendarDays className="h-5 w-5" />}
          title="No tasks in this view"
          description="Add a task with a due date, or change your filters."
          action={
            <Button onClick={() => taskModal.open()}>
              <Plus className="h-4 w-4" /> New task
            </Button>
          }
        />
      )}
    </div>
  );
}

function DayTaskList({ day, tasks }: { day: Date; tasks: ReturnType<typeof useApp.getState>['tasks'] }) {
  const toggle = useApp((s) => s.toggleTask);
  const taskModal = useTaskModal();
  if (tasks.length === 0) {
    return <p className="text-sm text-[var(--fg-muted)]">No tasks on this day.</p>;
  }
  return (
    <ul className="divide-y divide-[var(--border)]">
      {tasks
        .sort((a, b) => new Date(a.dueAt!).getTime() - new Date(b.dueAt!).getTime())
        .map((t) => (
          <li
            key={t.id}
            className="flex items-center gap-2 py-2"
            onClick={() => taskModal.open(t.id)}
          >
            <input
              type="checkbox"
              checked={t.status === 'done'}
              onClick={(e) => e.stopPropagation()}
              onChange={() => toggle(t.id)}
              className="h-4 w-4 cursor-pointer accent-[var(--accent)]"
            />
            <span
              className={cn(
                'flex-1 text-sm',
                t.status === 'done' && 'line-through text-[var(--fg-muted)]',
              )}
            >
              {t.title}
            </span>
            <span className="text-[10px] text-[var(--fg-muted)]">
              {t.dueAt && isSameDay(new Date(t.dueAt), day)
                ? format(new Date(t.dueAt), 'h:mm a')
                : ''}
            </span>
          </li>
        ))}
    </ul>
  );
}
