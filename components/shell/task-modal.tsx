'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useApp } from '@/lib/store';
import { Modal } from '@/components/ui';
import { Input, Textarea, Select, Button, Checkbox, Badge } from '@/components/ui';
import { PRIORITY_META, STATUS_META } from '@/lib/constants';
import type {
  Priority,
  Recurrence,
  Subtask,
  Task,
  TaskStatus,
} from '@/lib/types';
import {
  Calendar,
  CheckSquare,
  Flag,
  ListIcon,
  Plus,
  Repeat,
  Tag as TagIcon,
  Trash2,
  X,
  AlignLeft,
  Timer,
  Paperclip,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui';
import { cn } from '@/lib/utils';
import { isOverdue, formatDue } from '@/lib/filters';
import { uid } from '@/lib/utils';

interface Ctx {
  open: (taskId?: string, defaults?: { listId?: string; status?: TaskStatus }) => void;
  close: () => void;
  isOpen: boolean;
}
const TaskModalCtx = createContext<Ctx | null>(null);
export const useTaskModal = () => {
  const c = useContext(TaskModalCtx);
  if (!c) throw new Error('useTaskModal must be used inside <TaskModalProvider>');
  return c;
};

export function TaskModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [initialListId, setInitialListId] = useState<string | undefined>();
  const [initialStatus, setInitialStatus] = useState<TaskStatus | undefined>();

  const value = useMemo<Ctx>(
    () => ({
      open: (id, defaults) => {
        setTaskId(id ?? null);
        setInitialListId(defaults?.listId);
        setInitialStatus(defaults?.status);
        setOpen(true);
      },
      close: () => setOpen(false),
      isOpen: open,
    }),
    [open],
  );

  return (
    <TaskModalCtx.Provider value={value}>
      {children}
      <TaskModal
        open={open}
        onOpenChange={setOpen}
        taskId={taskId}
        initialListId={initialListId}
        initialStatus={initialStatus}
      />
    </TaskModalCtx.Provider>
  );
}

function TaskModal({
  open,
  onOpenChange,
  taskId,
  initialListId,
  initialStatus,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  taskId: string | null;
  initialListId?: string;
  initialStatus?: TaskStatus;
}) {
  const tasks = useApp((s) => s.tasks);
  const lists = useApp((s) => s.lists);
  const tags = useApp((s) => s.tags);
  const addTask = useApp((s) => s.addTask);
  const updateTask = useApp((s) => s.updateTask);
  const removeTask = useApp((s) => s.removeTask);
  const toggleSubtask = useApp((s) => s.toggleSubtask);
  const incrementPomodoro = useApp((s) => s.incrementPomodoro);

  const existing = taskId ? tasks.find((t) => t.id === taskId) : null;
  const isNew = !existing;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [listId, setListId] = useState<string>('inbox');
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [dueAt, setDueAt] = useState<string>('');
  const [recurrence, setRecurrence] = useState<Recurrence>('none');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [pomodorosPlanned, setPomodorosPlanned] = useState(0);
  const [newSub, setNewSub] = useState('');

  useEffect(() => {
    if (!open) return;
    if (existing) {
      setTitle(existing.title);
      setDescription(existing.description ?? '');
      setPriority(existing.priority);
      setStatus(existing.status);
      setListId(existing.listId);
      setTagIds(existing.tagIds);
      setDueAt(existing.dueAt ? toLocalInput(existing.dueAt) : '');
      setRecurrence(existing.recurrence);
      setSubtasks(existing.subtasks);
      setPomodorosPlanned(existing.pomodorosPlanned);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setStatus(initialStatus ?? 'todo');
      setListId(initialListId ?? 'inbox');
      setTagIds([]);
      setDueAt('');
      setRecurrence('none');
      setSubtasks([]);
      setPomodorosPlanned(0);
    }
    setNewSub('');
  }, [open, existing, initialListId, initialStatus]);

  const dirty =
    isNew ||
    !existing ||
    title !== existing.title ||
    description !== (existing.description ?? '') ||
    priority !== existing.priority ||
    status !== existing.status ||
    listId !== existing.listId ||
    JSON.stringify(tagIds) !== JSON.stringify(existing.tagIds) ||
    (existing.dueAt ? toLocalInput(existing.dueAt) : '') !== dueAt ||
    recurrence !== existing.recurrence ||
    JSON.stringify(subtasks) !== JSON.stringify(existing.subtasks) ||
    pomodorosPlanned !== existing.pomodorosPlanned;

  const save = () => {
    if (!title.trim()) return;
    if (isNew) {
      addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        status,
        listId,
        tagIds,
        dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
        recurrence,
        subtasks,
        pomodorosPlanned,
      });
    } else if (existing) {
      updateTask(existing.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        status,
        listId,
        tagIds,
        dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
        recurrence,
        subtasks,
        pomodorosPlanned,
      });
    }
    onOpenChange(false);
  };

  const toggleTag = (id: string) =>
    setTagIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const addSub = () => {
    const v = newSub.trim();
    if (!v) return;
    setSubtasks((s) => [...s, { id: uid('sub'), title: v, done: false }]);
    setNewSub('');
  };

  const removeSub = (id: string) => setSubtasks((s) => s.filter((x) => x.id !== id));

  const subtaskProgress = subtasks.length
    ? subtasks.filter((s) => s.done).length / subtasks.length
    : status === 'done'
      ? 1
      : 0;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title={
        <div className="flex w-full items-center gap-2">
          <span className="text-base font-semibold">{isNew ? 'New task' : 'Edit task'}</span>
          {!isNew && existing?.status === 'done' && (
            <Badge className="!bg-[color:color-mix(in_oklab,var(--success)_18%,transparent)] !text-[color:var(--success)]">Done</Badge>
          )}
        </div>
      }
      footer={
        <>
          {!isNew && existing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm('Delete this task?')) {
                  removeTask(existing.id);
                  onOpenChange(false);
                }
              }}
            >
              <Trash2 className="h-4 w-4 text-[var(--danger)]" /> Delete
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!title.trim()}>
            {isNew ? 'Create' : 'Save'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          autoFocus
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              save();
            }
          }}
          className="border-transparent bg-transparent text-lg font-medium shadow-none focus-visible:border-[var(--border)] focus-visible:bg-[var(--bg-elev)]"
        />

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Field label="Status" icon={<CheckSquare className="h-3.5 w-3.5" />}>
            <Select
              size="sm"
              value={status}
              onChange={(v) => setStatus(v as TaskStatus)}
              options={(Object.keys(STATUS_META) as TaskStatus[]).map((s) => ({
                value: s,
                label: STATUS_META[s].label,
                icon: <span className={cn('h-2 w-2 rounded-full', STATUS_META[s].color)} />,
              }))}
            />
          </Field>
          <Field label="Priority" icon={<Flag className="h-3.5 w-3.5" />}>
            <Select
              size="sm"
              value={priority}
              onChange={(v) => setPriority(v as Priority)}
              options={(Object.keys(PRIORITY_META) as Priority[]).map((p) => ({
                value: p,
                label: PRIORITY_META[p].label,
                icon: <span className={cn('h-2 w-2 rounded-full', PRIORITY_META[p].dot)} />,
              }))}
            />
          </Field>
          <Field label="List" icon={<ListIcon className="h-3.5 w-3.5" />}>
            <Select
              size="sm"
              value={listId}
              onChange={setListId}
              options={lists.map((l) => ({
                value: l.id,
                label: `${l.emoji} ${l.name}`,
                color: l.color,
              }))}
            />
          </Field>
          <Field label="Repeat" icon={<Repeat className="h-3.5 w-3.5" />}>
            <Select
              size="sm"
              value={recurrence}
              onChange={(v) => setRecurrence(v as Recurrence)}
              options={[
                { value: 'none', label: 'Never' },
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
              ]}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Field label="Due" icon={<Calendar className="h-3.5 w-3.5" />} className="sm:col-span-1">
            <input
              type="datetime-local"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className="h-8 w-full rounded-md border border-[var(--border)] bg-[var(--bg-elev)] px-2 text-sm text-[var(--fg)]"
            />
            {existing?.dueAt && (
              <span
                className={cn(
                  'mt-1 text-[11px]',
                  isOverdue(existing.dueAt) && existing.status !== 'done'
                    ? 'text-[var(--danger)]'
                    : 'text-[var(--fg-muted)]',
                )}
              >
                {formatDue(existing.dueAt)}
              </span>
            )}
          </Field>
          <Field label="Pomodoros planned" icon={<Timer className="h-3.5 w-3.5" />}>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPomodorosPlanned((p) => Math.max(0, p - 1))}
                className="h-7 w-7 rounded-md border border-[var(--border)] bg-[var(--bg-elev)] hover:bg-[var(--bg-elev-2)]"
              >
                −
              </button>
              <div className="w-10 text-center text-sm font-medium">{pomodorosPlanned}</div>
              <button
                onClick={() => setPomodorosPlanned((p) => Math.min(20, p + 1))}
                className="h-7 w-7 rounded-md border border-[var(--border)] bg-[var(--bg-elev)] hover:bg-[var(--bg-elev-2)]"
              >
                +
              </button>
              {!isNew && existing && (
                <button
                  onClick={() => incrementPomodoro(existing.id)}
                  className="ml-2 rounded-md border border-[var(--border)] bg-[var(--bg-elev)] px-2 py-1 text-xs text-[var(--fg-muted)] hover:text-[var(--fg)]"
                  title="Log a completed pomodoro"
                >
                  +1 done ({existing.pomodorosDone})
                </button>
              )}
            </div>
          </Field>
        </div>

        <div>
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-[var(--fg-subtle)]">
            <AlignLeft className="h-3 w-3" /> Description
          </div>
          <Textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more context…"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-[var(--fg-subtle)]">
            <TagIcon className="h-3 w-3" /> Tags
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => {
              const active = tagIds.includes(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => toggleTag(t.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors',
                    active
                      ? 'border-transparent text-white'
                      : 'border-[var(--border)] bg-[var(--bg-elev)] text-[var(--fg-muted)] hover:text-[var(--fg)]',
                  )}
                  style={active ? { background: t.color } : undefined}
                >
                  <span
                    className={cn('h-1.5 w-1.5 rounded-full', active ? 'bg-white' : '')}
                    style={active ? undefined : { background: t.color }}
                  />
                  {t.name}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-[var(--fg-subtle)]">
              <CheckSquare className="h-3 w-3" /> Subtasks ({subtasks.filter((s) => s.done).length}/{subtasks.length})
            </div>
            <span className="text-[11px] text-[var(--fg-muted)]">{Math.round(subtaskProgress * 100)}%</span>
          </div>
          <Progress value={subtaskProgress} className="mb-2" />
          <div className="space-y-1.5">
            <AnimatePresence>
              {subtasks.map((s) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 6 }}
                  className="group flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--bg-elev)] px-2 py-1.5"
                >
                  <Checkbox
                    checked={s.done}
                    onChange={() => {
                      const next = subtasks.map((x) =>
                        x.id === s.id ? { ...x, done: !x.done } : x,
                      );
                      setSubtasks(next);
                      if (!isNew && existing) {
                        toggleSubtask(existing.id, s.id);
                      }
                    }}
                  />
                  <span
                    className={cn(
                      'flex-1 text-sm',
                      s.done && 'text-[var(--fg-muted)] line-through',
                    )}
                  >
                    {s.title}
                  </span>
                  <button
                    onClick={() => removeSub(s.id)}
                    className="hidden rounded p-1 text-[var(--fg-subtle)] hover:bg-[var(--bg-elev-2)] hover:text-[var(--danger)] group-hover:inline-flex"
                    aria-label="Remove subtask"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Add a subtask and press Enter"
                value={newSub}
                onChange={(e) => setNewSub(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSub();
                  }
                }}
                className="h-8"
              />
              <Button size="sm" variant="secondary" onClick={addSub}>
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Field({
  label,
  icon,
  children,
  className,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn('flex flex-col gap-1 text-xs', className)}>
      <span className="flex items-center gap-1 text-[var(--fg-subtle)]">{icon} {label}</span>
      {children}
    </label>
  );
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 16);
}
