'use client';

import { TaskListView } from '@/components/tasks/task-list-view';
import { CalendarDays } from 'lucide-react';
import { addDays, startOfDay } from 'date-fns';

export default function UpcomingPage() {
  const now = new Date();
  const today = startOfDay(now);
  const limit = addDays(today, 30).getTime();

  return (
    <TaskListView
      icon={<CalendarDays className="h-5 w-5" />}
      title="Upcoming"
      subtitle="Next 30 days, in order."
      source={(all) =>
        all
          .filter((t) => {
            if (!t.dueAt) return false;
            const ts = new Date(t.dueAt).getTime();
            return ts >= today.getTime() && ts < limit;
          })
          .sort((a, b) => new Date(a.dueAt!).getTime() - new Date(b.dueAt!).getTime())
      }
      defaultGroup="due"
      showQuickAdd={false}
    />
  );
}
