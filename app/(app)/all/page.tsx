'use client';

import { TaskListView } from '@/components/tasks/task-list-view';
import { ListTodo } from 'lucide-react';

export default function AllPage() {
  return (
    <TaskListView
      icon={<ListTodo className="h-5 w-5" />}
      title="All tasks"
      subtitle="Everything in one place."
      source={(all) => all}
      defaultGroup="list"
    />
  );
}
