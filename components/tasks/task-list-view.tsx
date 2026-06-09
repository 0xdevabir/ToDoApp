'use client';

import { useApp } from '@/lib/store';
import { TaskRow } from './task-row';
import { QuickAdd } from '@/components/shell/quick-add';
import { PageHeader } from '@/components/shell/page-header';
import { FilterBar } from './filter-bar';
import { Tabs } from '@/components/ui';
import { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { applyFilters } from '@/lib/filters';
import type { Task } from '@/lib/types';
import { EmptyState, Kbd } from '@/components/ui';
import { ListTodo } from 'lucide-react';
import { useTaskModal } from '@/components/shell/task-modal';

type Group = 'status' | 'priority' | 'due' | 'list' | 'none';

export function TaskListView({
  title,
  subtitle,
  icon,
  source,
  defaultListId,
  defaultGroup = 'status',
  showQuickAdd = true,
  showCompletedToggle = true,
  headerActions,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  source: (all: Task[]) => Task[];
  defaultListId?: string;
  defaultGroup?: Group;
  showQuickAdd?: boolean;
  showCompletedToggle?: boolean;
  headerActions?: React.ReactNode;
}) {
  const tasks = useApp((s) => s.tasks);
  const filters = useApp((s) => s.filters);
  const settings = useApp((s) => s.settings);
  const [group, setGroup] = useState<Group>(defaultGroup);
  const [hideDone, setHideDone] = useState(!settings.showCompletedTasks);
  const taskModal = useTaskModal();

  const filtered = useMemo(() => {
    const fromSource = source(tasks);
    return applyFilters(fromSource, filters).filter((t) => (hideDone ? t.status !== 'done' : true));
  }, [tasks, filters, source, hideDone]);

  const groups = useMemo(() => groupTasks(filtered, group), [filtered, group]);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={icon}
        title={title}
        subtitle={subtitle}
        actions={
          <>
            {headerActions}
            {showCompletedToggle && (
              <button
                onClick={() => setHideDone((v) => !v)}
                className="hidden h-8 items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-elev)] px-2.5 text-xs text-[var(--fg-muted)] hover:text-[var(--fg)] sm:inline-flex"
                title="Toggle completed"
              >
                {hideDone ? 'Show completed' : 'Hide completed'}
              </button>
            )}
          </>
        }
      />

      <FilterBar />

      {showQuickAdd && <QuickAdd defaultListId={defaultListId ?? 'inbox'} />}

      <div className="flex items-center justify-between">
        <div className="text-xs text-[var(--fg-muted)]">
          {filtered.length} task{filtered.length === 1 ? '' : 's'}
        </div>
        <Tabs
          size="sm"
          value={group}
          onChange={(v) => setGroup(v as Group)}
          options={[
            { value: 'status', label: 'Status' },
            { value: 'priority', label: 'Priority' },
            { value: 'due', label: 'Due' },
            { value: 'list', label: 'List' },
            { value: 'none', label: 'None' },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<ListTodo className="h-5 w-5" />}
          title="Nothing here yet"
          description="Press N or hit the button below to add a task. You can also press / to focus search and ⌘K for the command palette."
          action={
            <button
              onClick={() => taskModal.open(undefined, { listId: defaultListId })}
              className="mt-1 inline-flex h-9 items-center gap-2 rounded-lg bg-[var(--accent)] px-3 text-sm font-medium text-[var(--accent-fg)] shadow-sm hover:brightness-110"
            >
              New task <Kbd>N</Kbd>
            </button>
          }
        />
      ) : (
        <div className="space-y-5">
          {groups.map((g) => (
            <section key={g.key}>
              {group !== 'none' && (
                <h3 className="mb-1.5 flex items-center gap-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--fg-subtle)]">
                  {g.label}
                  <span className="text-[10px] font-normal text-[var(--fg-subtle)]">
                    {g.tasks.length}
                  </span>
                </h3>
              )}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elev)]/40 p-1.5">
                <AnimatePresence initial={false}>
                  {g.tasks.map((t) => (
                    <TaskRow key={t.id} task={t} showList={group !== 'list'} />
                  ))}
                </AnimatePresence>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function groupTasks(tasks: Task[], group: Group) {
  if (group === 'none') return [{ key: 'all', label: '', tasks }];
  if (group === 'status') {
    return [
      { key: 'todo', label: 'To Do', tasks: tasks.filter((t) => t.status === 'todo') },
      { key: 'in_progress', label: 'In Progress', tasks: tasks.filter((t) => t.status === 'in_progress') },
      { key: 'done', label: 'Done', tasks: tasks.filter((t) => t.status === 'done') },
    ].filter((g) => g.tasks.length > 0);
  }
  if (group === 'priority') {
    const order = ['urgent', 'high', 'medium', 'low'] as const;
    return order
      .map((p) => ({
        key: p,
        label: p.charAt(0).toUpperCase() + p.slice(1),
        tasks: tasks.filter((t) => t.priority === p),
      }))
      .filter((g) => g.tasks.length > 0);
  }
  if (group === 'due') {
    const buckets = [
      { key: 'overdue', label: 'Overdue', test: (d?: string) => d && new Date(d) < new Date() && !isToday(d) },
      { key: 'today', label: 'Today', test: (d?: string) => d && isToday(d) },
      { key: 'tomorrow', label: 'Tomorrow', test: (d?: string) => d && isTomorrow(d) },
      { key: 'this-week', label: 'This week', test: (d?: string) => d && !isToday(d) && !isTomorrow(d) && isThisWeek(d) },
      { key: 'later', label: 'Later', test: (d?: string) => d && !isThisWeek(d) },
      { key: 'no-date', label: 'No date', test: (d?: string) => !d },
    ];
    return buckets
      .map((b) => ({ key: b.key, label: b.label, tasks: tasks.filter((t) => b.test(t.dueAt)) }))
      .filter((g) => g.tasks.length > 0);
  }
  if (group === 'list') {
    const byList = new Map<string, Task[]>();
    for (const t of tasks) {
      const arr = byList.get(t.listId) ?? [];
      arr.push(t);
      byList.set(t.listId, arr);
    }
    return Array.from(byList.entries()).map(([listId, ts]) => ({
      key: listId,
      label: listId,
      tasks: ts,
    }));
  }
  return [{ key: 'all', label: '', tasks }];
}

function isToday(iso: string) {
  const d = new Date(iso);
  const n = new Date();
  return (
    d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate()
  );
}
function isTomorrow(iso: string) {
  const d = new Date(iso);
  const n = new Date();
  n.setDate(n.getDate() + 1);
  return (
    d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate()
  );
}
function isThisWeek(iso: string) {
  const d = new Date(iso);
  const n = new Date();
  const start = new Date(n);
  start.setDate(n.getDate() - n.getDay());
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return d >= start && d < end;
}
