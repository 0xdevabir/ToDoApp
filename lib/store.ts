'use client';

import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type {
  Task,
  List,
  Tag,
  Settings,
  PomodoroSession,
  Filters,
  TaskStatus,
  Priority,
  Recurrence,
  Subtask,
} from './types';
import { uid } from './utils';

const safeStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(name, value);
    } catch {
      /* quota or private mode */
    }
  },
  removeItem: (name) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(name);
    } catch {
      /* noop */
    }
  },
};

const defaultFilters: Filters = {
  query: '',
  priorities: [],
  tagIds: [],
  listIds: [],
  statuses: [],
  hasDue: 'any',
  sort: 'manual',
  dir: 'asc',
};

const defaultSettings: Settings = {
  theme: 'system',
  accent: 'amber',
  density: 'comfortable',
  defaultView: 'list',
  pomodoroFocusMin: 25,
  pomodoroBreakMin: 5,
  pomodoroLongBreakMin: 15,
  pomodoroLongEvery: 4,
  enableSounds: true,
  enableReducedMotion: false,
  showCompletedTasks: true,
  weekStartsOn: 1,
  firstDayOfUse: new Date().toISOString(),
};

function defaultLists(): List[] {
  const now = new Date().toISOString();
  return [
    { id: 'inbox', name: 'Inbox', emoji: '📥', color: '#5a6b78', createdAt: now },
    { id: 'personal', name: 'Personal', emoji: '🌿', color: '#6c8a5e', createdAt: now },
    { id: 'work', name: 'Work', emoji: '💼', color: '#b88534', createdAt: now },
  ];
}

function defaultTags(): Tag[] {
  return [
    { id: 't_urgent', name: 'urgent', color: '#a8412f' },
    { id: 't_focus', name: 'focus', color: '#7a4f6b' },
    { id: 't_quick', name: 'quick-win', color: '#6c8a5e' },
  ];
}

function seedTasks(): Task[] {
  const now = new Date();
  const at = (offsetDays: number, hour = 9) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offsetDays);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  };
  const make = (
    title: string,
    opts: Partial<Task> & { listId?: string; priority?: Priority; dueIn?: number },
  ): Task => {
    const listId = opts.listId ?? 'inbox';
    const id = uid('task');
    return {
      id,
      title,
      description: opts.description,
      status: opts.status ?? 'todo',
      priority: opts.priority ?? 'medium',
      listId,
      tagIds: opts.tagIds ?? [],
      subtasks: opts.subtasks ?? [],
      attachments: opts.attachments ?? [],
      dueAt: opts.dueIn !== undefined ? at(opts.dueIn) : undefined,
      reminderAt: undefined,
      recurrence: opts.recurrence ?? 'none',
      pomodorosPlanned: opts.pomodorosPlanned ?? 0,
      pomodorosDone: opts.pomodorosDone ?? 0,
      order: opts.order ?? 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: opts.status === 'done' ? new Date().toISOString() : undefined,
    };
  };
  return [
    make('Welcome to FlowDo ✨', {
      description:
        'Try pressing N to add a task, / to search, ⌘K for the command palette, and 1/2/3 to switch views.',
      listId: 'inbox',
      priority: 'high',
      status: 'todo',
      tagIds: ['t_focus'],
      subtasks: [
        { id: uid('sub'), title: 'Add your first real task', done: false },
        { id: uid('sub'), title: 'Try the Kanban view (press 2)', done: false },
        { id: uid('sub'), title: 'Start a Pomodoro from a task', done: false },
      ],
      pomodorosPlanned: 1,
    }),
    make('Plan the week', { listId: 'personal', priority: 'medium', dueIn: 0, tagIds: ['t_focus'] }),
    make('Reply to design feedback', {
      listId: 'work',
      priority: 'urgent',
      dueIn: -1,
      tagIds: ['t_urgent'],
    }),
    make('Read 20 pages', { listId: 'personal', priority: 'low', dueIn: 2, tagIds: ['t_quick'] }),
    make('Ship analytics dashboard', {
      listId: 'work',
      priority: 'high',
      dueIn: 3,
      tagIds: ['t_focus', 't_urgent'],
      pomodorosPlanned: 4,
    }),
    make('Tidy the kitchen', {
      listId: 'personal',
      priority: 'low',
      dueIn: 0,
      tagIds: ['t_quick'],
      subtasks: [
        { id: uid('sub'), title: 'Dishes', done: true },
        { id: uid('sub'), title: 'Wipe counters', done: false },
        { id: uid('sub'), title: 'Take out trash', done: false },
      ],
    }),
    make('Draft the launch announcement', {
      listId: 'work',
      priority: 'high',
      dueIn: 5,
      status: 'in_progress',
    }),
  ];
}

interface TaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  listId?: string;
  tagIds?: string[];
  subtasks?: Subtask[];
  dueAt?: string;
  reminderAt?: string;
  recurrence?: Recurrence;
  pomodorosPlanned?: number;
}

interface AppState {
  hydrated: boolean;
  tasks: Task[];
  lists: List[];
  tags: Tag[];
  sessions: PomodoroSession[];
  settings: Settings;
  filters: Filters;

  // hydration
  _setHydrated: () => void;
  // filters
  setFilters: (patch: Partial<Filters>) => void;
  resetFilters: () => void;
  // settings
  setSettings: (patch: Partial<Settings>) => void;
  // lists
  addList: (data: Omit<List, 'id' | 'createdAt'>) => List;
  updateList: (id: string, patch: Partial<List>) => void;
  removeList: (id: string) => void;
  // tags
  addTag: (data: Omit<Tag, 'id'>) => Tag;
  updateTag: (id: string, patch: Partial<Tag>) => void;
  removeTag: (id: string) => void;
  // tasks
  addTask: (data: TaskInput) => Task;
  updateTask: (id: string, patch: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  reorderTasks: (ids: string[]) => void;
  setStatus: (id: string, status: TaskStatus) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  incrementPomodoro: (id: string) => void;
  // sessions
  addSession: (s: PomodoroSession) => void;
  // data
  importData: (payload: Partial<Pick<AppState, 'tasks' | 'lists' | 'tags' | 'settings' | 'sessions'>>) => void;
  resetAll: () => void;
  // selectors helpers
  getTask: (id: string) => Task | undefined;
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      tasks: seedTasks(),
      lists: defaultLists(),
      tags: defaultTags(),
      sessions: [],
      settings: defaultSettings,
      filters: defaultFilters,

      _setHydrated: () => set({ hydrated: true }),

      setFilters: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),
      resetFilters: () => set({ filters: defaultFilters }),

      setSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      addList: (data) => {
        const list: List = { id: uid('list'), createdAt: new Date().toISOString(), ...data };
        set((s) => ({ lists: [...s.lists, list] }));
        return list;
      },
      updateList: (id, patch) =>
        set((s) => ({ lists: s.lists.map((l) => (l.id === id ? { ...l, ...patch } : l)) })),
      removeList: (id) =>
        set((s) => ({
          lists: s.lists.filter((l) => l.id !== id),
          tasks: s.tasks.map((t) => (t.listId === id ? { ...t, listId: 'inbox' } : t)),
        })),

      addTag: (data) => {
        const tag: Tag = { id: uid('tag'), ...data };
        set((s) => ({ tags: [...s.tags, tag] }));
        return tag;
      },
      updateTag: (id, patch) =>
        set((s) => ({ tags: s.tags.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      removeTag: (id) =>
        set((s) => ({
          tags: s.tags.filter((t) => t.id !== id),
          tasks: s.tasks.map((t) => ({ ...t, tagIds: t.tagIds.filter((x) => x !== id) })),
        })),

      addTask: (data) => {
        const order = get().tasks.length;
        const task: Task = {
          id: uid('task'),
          title: data.title.trim() || 'Untitled',
          description: data.description,
          status: data.status ?? 'todo',
          priority: data.priority ?? 'medium',
          listId: data.listId ?? 'inbox',
          tagIds: data.tagIds ?? [],
          subtasks: data.subtasks ?? [],
          attachments: [],
          dueAt: data.dueAt,
          reminderAt: data.reminderAt,
          recurrence: data.recurrence ?? 'none',
          pomodorosPlanned: data.pomodorosPlanned ?? 0,
          pomodorosDone: 0,
          order,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({ tasks: [task, ...s.tasks] }));
        return task;
      },

      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  ...patch,
                  updatedAt: new Date().toISOString(),
                  completedAt:
                    patch.status === 'done'
                      ? t.completedAt ?? new Date().toISOString()
                      : patch.status
                        ? undefined
                        : t.completedAt,
                }
              : t,
          ),
        })),

      toggleTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) => {
            if (t.id !== id) return t;
            const done = t.status === 'done';
            const status: TaskStatus = done ? 'todo' : 'done';
            return {
              ...t,
              status,
              updatedAt: new Date().toISOString(),
              completedAt: done ? undefined : new Date().toISOString(),
            };
          }),
        })),

      removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      reorderTasks: (ids) =>
        set((s) => {
          const map = new Map(s.tasks.map((t) => [t.id, t]));
          const reordered: Task[] = [];
          ids.forEach((id, idx) => {
            const t = map.get(id);
            if (t) {
              reordered.push({ ...t, order: idx });
              map.delete(id);
            }
          });
          return { tasks: [...reordered, ...Array.from(map.values())] };
        }),

      setStatus: (id, status) => get().updateTask(id, { status }),

      toggleSubtask: (taskId, subtaskId) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  updatedAt: new Date().toISOString(),
                  subtasks: t.subtasks.map((st) =>
                    st.id === subtaskId ? { ...st, done: !st.done } : st,
                  ),
                }
              : t,
          ),
        })),

      incrementPomodoro: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? { ...t, pomodorosDone: t.pomodorosDone + 1, updatedAt: new Date().toISOString() }
              : t,
          ),
        })),

      addSession: (session) => set((s) => ({ sessions: [session, ...s.sessions].slice(0, 500) })),

      importData: (payload) =>
        set((s) => ({
          tasks: payload.tasks ?? s.tasks,
          lists: payload.lists ?? s.lists,
          tags: payload.tags ?? s.tags,
          settings: { ...s.settings, ...(payload.settings ?? {}) },
          sessions: payload.sessions ?? s.sessions,
        })),

      resetAll: () =>
        set({
          tasks: [],
          lists: defaultLists(),
          tags: defaultTags(),
          sessions: [],
          settings: { ...defaultSettings, firstDayOfUse: new Date().toISOString() },
          filters: defaultFilters,
        }),

      getTask: (id) => get().tasks.find((t) => t.id === id),
    }),
    {
      name: 'flowdo:v1',
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({
        tasks: s.tasks,
        lists: s.lists,
        tags: s.tags,
        sessions: s.sessions,
        settings: s.settings,
      }),
      onRehydrateStorage: () => (state) => {
        state?._setHydrated();
      },
    },
  ),
);

// Ensure stable id generator w/o bundler quirks:
export const newId = () => (typeof nanoid === 'function' ? nanoid(10) : uid());
