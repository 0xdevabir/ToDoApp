export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  listId: string;
  tagIds: string[];
  subtasks: Subtask[];
  attachments: Attachment[];
  dueAt?: string;
  reminderAt?: string;
  recurrence: Recurrence;
  pomodorosPlanned: number;
  pomodorosDone: number;
  order: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  focusDate?: string;
}

export interface List {
  id: string;
  name: string;
  emoji: string;
  color: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export type AccentColor =
  | 'indigo'
  | 'violet'
  | 'pink'
  | 'rose'
  | 'amber'
  | 'emerald'
  | 'cyan'
  | 'sky';

export type Density = 'comfortable' | 'compact';

export type ViewMode = 'list' | 'kanban' | 'calendar' | 'analytics';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface PomodoroSession {
  id: string;
  taskId?: string;
  startedAt: string;
  endedAt: string;
  durationSec: number;
  completed: boolean;
}

export interface Settings {
  theme: ThemeMode;
  accent: AccentColor;
  density: Density;
  defaultView: ViewMode;
  pomodoroFocusMin: number;
  pomodoroBreakMin: number;
  pomodoroLongBreakMin: number;
  pomodoroLongEvery: number;
  enableSounds: boolean;
  enableReducedMotion: boolean;
  showCompletedTasks: boolean;
  weekStartsOn: 0 | 1;
  firstDayOfUse: string;
}

export interface Filters {
  query: string;
  priorities: Priority[];
  tagIds: string[];
  listIds: string[];
  statuses: TaskStatus[];
  hasDue: 'any' | 'with' | 'without' | 'overdue' | 'today';
  sort: 'manual' | 'priority' | 'dueAt' | 'createdAt' | 'title' | 'status';
  dir: 'asc' | 'desc';
}

export interface ExportPayload {
  version: 1;
  exportedAt: string;
  tasks: Task[];
  lists: List[];
  tags: Tag[];
  settings: Settings;
  sessions: PomodoroSession[];
}
