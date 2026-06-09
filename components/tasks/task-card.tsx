'use client';

import type { Task } from '@/lib/types';
import { useApp } from '@/lib/store';
import { Badge, Progress } from '@/components/ui';
import { Calendar, Repeat, Tag as TagIcon, Timer, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDue, isOverdue, progress } from '@/lib/filters';
import { PRIORITY_META } from '@/lib/constants';
import { motion } from 'framer-motion';
import { useTaskModal } from '../shell/task-modal';

export function TaskCard({
  task,
  dragHandleProps,
  isDragging,
}: {
  task: Task;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  isDragging?: boolean;
}) {
  const tags = useApp((s) => s.tags);
  const lists = useApp((s) => s.lists);
  const taskModal = useTaskModal();
  const list = lists.find((l) => l.id === task.listId);
  const p = progress(task);
  const overdue = isOverdue(task.dueAt) && task.status !== 'done';
  const pMeta = PRIORITY_META[task.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.16 }}
      className={cn(
        'group relative cursor-grab rounded-xl border border-[var(--border)] bg-[var(--bg-elev)] p-3 shadow-[var(--shadow-sm)] transition-all hover:shadow-[var(--shadow-md)]',
        isDragging && 'shadow-[var(--shadow-lg)] ring-2 ring-[var(--ring)]',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          {...dragHandleProps}
          className="absolute left-1 top-1/2 -translate-y-1/2 rounded p-1 text-[var(--fg-subtle)] opacity-0 transition-opacity group-hover:opacity-100"
          aria-label="Drag"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <div className="min-w-0 flex-1 pl-4">
          <div className="flex items-center gap-1.5">
            <span className={cn('h-2 w-2 rounded-full', pMeta.dot)} aria-hidden />
            <h3
              onClick={() => taskModal.open(task.id)}
              className={cn(
                'cursor-pointer truncate text-sm font-medium text-[var(--fg)]',
                task.status === 'done' && 'line-through text-[var(--fg-muted)]',
              )}
            >
              {task.title}
            </h3>
          </div>

          {task.description && (
            <p className="mt-0.5 line-clamp-2 text-xs text-[var(--fg-muted)]">{task.description}</p>
          )}

          {task.subtasks.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <Progress value={p} className="flex-1" />
              <span className="text-[10px] text-[var(--fg-muted)]">
                {task.subtasks.filter((s) => s.done).length}/{task.subtasks.length}
              </span>
            </div>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--fg-muted)]">
            {list && (
              <span className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--bg-elev-2)] px-1.5 py-0.5">
                <span className="h-1.5 w-1.5 rounded-sm" style={{ background: list.color }} />
                {list.name}
              </span>
            )}
            {task.dueAt && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5',
                  overdue
                    ? 'border-[var(--danger)]/40 bg-[var(--danger)]/10 text-[var(--danger)]'
                    : 'border-[var(--border)] bg-[var(--bg-elev-2)]',
                )}
              >
                <Calendar className="h-3 w-3" />
                {formatDue(task.dueAt)}
              </span>
            )}
            {task.recurrence !== 'none' && (
              <span className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--bg-elev-2)] px-1.5 py-0.5">
                <Repeat className="h-3 w-3" />
                {task.recurrence}
              </span>
            )}
            {task.pomodorosPlanned > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--bg-elev-2)] px-1.5 py-0.5">
                <Timer className="h-3 w-3" />
                {task.pomodorosDone}/{task.pomodorosPlanned}
              </span>
            )}
            {task.tagIds.slice(0, 3).map((id) => {
              const tag = tags.find((t) => t.id === id);
              if (!tag) return null;
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--bg-elev-2)] px-1.5 py-0.5"
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: tag.color }} />
                  {tag.name}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
