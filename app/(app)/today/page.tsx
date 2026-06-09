'use client';

import { TaskListView } from '@/components/tasks/task-list-view';
import { Sparkles } from 'lucide-react';
import { addDays, isToday, isTomorrow, startOfDay } from 'date-fns';

export default function TodayPage() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const tomorrowStart = startOfDay(addDays(now, 1));

  return (
    <TaskListView
      icon={<Sparkles className="h-5 w-5" />}
      title="Today"
      subtitle="What matters right now."
      source={(all) =>
        all.filter((t) => {
          if (!t.dueAt) return false;
          const d = new Date(t.dueAt);
          if (isToday(d)) return true;
          if (t.status === 'in_progress') return d < tomorrowStart;
          return false;
        })
      }
      defaultGroup="priority"
    />
  );
}
