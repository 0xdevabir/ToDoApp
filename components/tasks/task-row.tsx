'use client';

import { useApp } from '@/lib/store';
import type { Task } from '@/lib/types';
import { Checkbox, Badge, Progress, PriorityDot } from '@/components/ui';
import { Calendar, Repeat, Tag as TagIcon, Timer, MessageSquare, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDue, isOverdue, progress } from '@/lib/filters';
import { motion } from 'framer-motion';
import { useTaskModal } from '@/components/shell/task-modal';
import { Tooltip } from '@/components/ui';
import { useState } from 'react';

export function TaskRow({
  task,
  showList = true,
  dragHandle,
}: {
  task: Task;
  showList?: boolean;
  dragHandle?: React.ReactNode;
}) {
  const lists = useApp((s) => s.lists);
  const tags = useApp((s) => s.tags);
  const toggleTask = useApp((s) => s.toggleTask);
  const taskModal = useTaskModal();
  const [hovered, setHovered] = useState(false);

  const list = lists.find((l) => l.id === task.listId);
  const p = progress(task);
  const overdue = isOverdue(task.dueAt) && task.status !== 'done';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.18 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'group relative flex items-start gap-2.5 rounded-xl border border-transparent px-2.5 py-2 transition-all',
        'hover:border-[var(--border)] hover:bg-[var(--bg-elev)]',
        task.status === 'done' && 'opacity-60',
      )}
    >
      {dragHandle}

      <div className="pt-0.5">
        <Checkbox
          checked={task.status === 'done'}
          onChange={() => toggleTask(task.id)}
          aria-label={task.status === 'done' ? 'Mark as not done' : 'Mark as done'}
        />
      </div>

      <button
        onClick={() => taskModal.open(task.id)}
        className="min-w-0 flex-1 text-left"
      >
        <div className="flex items-center gap-2">
          <PriorityDot priority={task.priority} />
          <span
            className={cn(
              'truncate text-sm font-medium text-[var(--fg)]',
              task.status === 'done' && 'line-through text-[var(--fg-muted)]',
            )}
          >
            {task.title}
          </span>
          {task.recurrence !== 'none' && (
            <Repeat className="h-3.5 w-3.5 text-[var(--fg-subtle)]" />
          )}
          {task.pomodorosPlanned > 0 && (
            <Tooltip label={`${task.pomodorosDone}/${task.pomodorosPlanned} pomodoros`}>
              <span className="inline-flex items-center gap-0.5 rounded bg-[var(--bg-elev-2)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--fg-muted)]">
                <Timer className="h-3 w-3" />
                {task.pomodorosDone}/{task.pomodorosPlanned}
              </span>
            </Tooltip>
          )}
        </div>

        {task.description && (
          <p className="mt-0.5 line-clamp-1 text-xs text-[var(--fg-muted)]">
            {task.description}
          </p>
        )}

        {task.subtasks.length > 0 && (
          <div className="mt-1.5 flex items-center gap-2">
            <Progress value={p} className="max-w-[120px]" />
            <span className="text-[11px] text-[var(--fg-muted)]">
              {task.subtasks.filter((s) => s.done).length}/{task.subtasks.length}
            </span>
          </div>
        )}

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--fg-muted)]">
          {showList && list && (
            <span className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--bg-elev)] px-1.5 py-0.5">
              <span className="h-1.5 w-1.5 rounded-sm" style={{ background: list.color }} />
              {list.emoji} {list.name}
            </span>
          )}
          {task.dueAt && (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5',
                overdue
                  ? 'border-[var(--danger)]/40 bg-[var(--danger)]/10 text-[var(--danger)]'
                  : 'border-[var(--border)] bg-[var(--bg-elev)]',
              )}
            >
              <Calendar className="h-3 w-3" />
              {formatDue(task.dueAt)}
            </span>
          )}
          {task.tagIds.map((id) => {
            const tag = tags.find((t) => t.id === id);
            if (!tag) return null;
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--bg-elev)] px-1.5 py-0.5"
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: tag.color }} />
                {tag.name}
              </span>
            );
          })}
        </div>
      </button>

      <div
        className={cn(
          'flex shrink-0 items-center gap-1 transition-opacity',
          hovered ? 'opacity-100' : 'opacity-0',
        )}
      >
        <Tooltip label="Open">
          <button
            onClick={() => taskModal.open(task.id)}
            className="grid h-7 w-7 place-items-center rounded-md text-[var(--fg-muted)] hover:bg-[var(--bg-elev-2)] hover:text-[var(--fg)]"
            aria-label="Open"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </Tooltip>
      </div>
    </motion.div>
  );
}
