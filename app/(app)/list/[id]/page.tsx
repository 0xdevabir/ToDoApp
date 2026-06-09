'use client';

import { useParams } from 'next/navigation';
import { useApp } from '@/lib/store';
import { TaskListView } from '@/components/tasks/task-list-view';
import { EmptyState } from '@/components/ui';

export default function ListPage() {
  const params = useParams<{ id: string }>();
  const list = useApp((s) => s.lists.find((l) => l.id === params.id));

  if (!list) {
    return (
      <EmptyState
        title="List not found"
        description="It may have been deleted. Try another list from the sidebar."
      />
    );
  }

  return (
    <TaskListView
      icon={<span className="text-base">{list.emoji}</span>}
      title={list.name}
      subtitle={`${list.emoji} list`}
      source={(all) => all.filter((t) => t.listId === list.id)}
      defaultListId={list.id}
      defaultGroup="status"
    />
  );
}
