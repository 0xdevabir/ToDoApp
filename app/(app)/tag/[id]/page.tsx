'use client';

import { useParams } from 'next/navigation';
import { useApp } from '@/lib/store';
import { TaskListView } from '@/components/tasks/task-list-view';
import { EmptyState } from '@/components/ui';
import { Tag as TagIcon } from 'lucide-react';

export default function TagPage() {
  const params = useParams<{ id: string }>();
  const tag = useApp((s) => s.tags.find((t) => t.id === params.id));

  if (!tag) {
    return (
      <EmptyState
        title="Tag not found"
        description="The tag may have been removed. Try another from the sidebar."
      />
    );
  }

  return (
    <TaskListView
      icon={<span className="h-3 w-3 rounded-full" style={{ background: tag.color }} />}
      title={`#${tag.name}`}
      subtitle="Tasks with this tag."
      source={(all) => all.filter((t) => t.tagIds.includes(tag.id))}
      defaultGroup="status"
    />
  );
}
