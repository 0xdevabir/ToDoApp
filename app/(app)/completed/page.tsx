'use client';

import { TaskListView } from '@/components/tasks/task-list-view';
import { CheckCircle2 } from 'lucide-react';

export default function CompletedPage() {
  return (
    <TaskListView
      icon={<CheckCircle2 className="h-5 w-5" />}
      title="Completed"
      subtitle="Recently finished."
      source={(all) => all.filter((t) => t.status === 'done')}
      defaultGroup="list"
      showQuickAdd={false}
    />
  );
}
