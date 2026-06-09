'use client';

import { TaskListView } from '@/components/tasks/task-list-view';
import { Inbox } from 'lucide-react';

export default function InboxPage() {
  return (
    <TaskListView
      icon={<Inbox className="h-5 w-5" />}
      title="Inbox"
      subtitle="Quick capture, sort later."
      source={(all) => all.filter((t) => t.listId === 'inbox')}
      defaultListId="inbox"
    />
  );
}
