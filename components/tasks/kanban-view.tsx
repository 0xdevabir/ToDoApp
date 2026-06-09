'use client';

import { useApp } from '@/lib/store';
import { TaskCard } from './task-card';
import { applyFilters } from '@/lib/filters';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/shell/page-header';
import { Layout as LayoutIcon, Plus } from 'lucide-react';
import { Button, EmptyState } from '@/components/ui';
import { useTaskModal } from '@/components/shell/task-modal';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { STATUS_META } from '@/lib/constants';
import type { Task, TaskStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

const columns: { id: TaskStatus; label: string }[] = [
  { id: 'todo', label: STATUS_META.todo.label },
  { id: 'in_progress', label: STATUS_META.in_progress.label },
  { id: 'done', label: STATUS_META.done.label },
];

export function KanbanView() {
  const tasks = useApp((s) => s.tasks);
  const filters = useApp((s) => s.filters);
  const updateTask = useApp((s) => s.updateTask);
  const taskModal = useTaskModal();
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const filtered = useMemo(() => applyFilters(tasks, filters), [tasks, filters]);

  const byStatus = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], done: [] };
    for (const t of filtered) map[t.status].push(t);
    return map;
  }, [filtered]);

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    const sourceStatus = (active.data.current as { status?: TaskStatus } | undefined)?.status;
    const isColumn = (over.data.current as { type?: string } | undefined)?.type === 'column';
    const overStatus = isColumn
      ? (overId as TaskStatus)
      : (over.data.current as { status?: TaskStatus } | undefined)?.status;
    if (!sourceStatus || !overStatus) return;
    if (isColumn) {
      if (sourceStatus !== overStatus) {
        updateTask(activeId, { status: overStatus });
      }
      return;
    }
    if (sourceStatus === overStatus) {
      const arr = byStatus[sourceStatus].map((t) => t.id);
      const oldIdx = arr.indexOf(activeId);
      const newIdx = arr.indexOf(overId);
      if (oldIdx === -1 || newIdx === -1) return;
      const newOrder = arrayMove(arr, oldIdx, newIdx);
      newOrder.forEach((id, idx) => {
        const t = tasks.find((x) => x.id === id);
        if (t && t.order !== idx) updateTask(id, { order: idx });
      });
    } else {
      updateTask(activeId, { status: overStatus });
    }
  };

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  return (
    <div className="space-y-5">
      <PageHeader
        icon={<LayoutIcon className="h-5 w-5" />}
        title="Kanban"
        subtitle="Drag tasks between columns. Click a card to edit."
        actions={
          <Button onClick={() => taskModal.open()}>
            <Plus className="h-4 w-4" /> New task
          </Button>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<LayoutIcon className="h-5 w-5" />}
          title="Nothing on the board"
          description="Add a task or clear your filters to see tasks here."
          action={
            <Button onClick={() => taskModal.open()}>
              <Plus className="h-4 w-4" /> New task
            </Button>
          }
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          <div className="grid gap-3 md:grid-cols-3">
            {columns.map((col) => (
              <KanbanColumn
                key={col.id}
                id={col.id}
                label={col.label}
                tasks={byStatus[col.id]}
                onAdd={() => taskModal.open(undefined, { status: col.id })}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}

function KanbanColumn({
  id,
  label,
  tasks,
  onAdd,
}: {
  id: TaskStatus;
  label: string;
  tasks: Task[];
  onAdd: () => void;
}) {
  const { setNodeRef, isOver } = useSortable({
    id,
    data: { type: 'column', status: id },
    disabled: true,
  });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex h-full min-h-[60vh] flex-col rounded-2xl border border-[var(--border)] bg-[var(--bg-elev)]/40 p-2 transition-colors',
        isOver && 'bg-[var(--accent-soft)]',
      )}
    >
      <div className="mb-2 flex items-center justify-between px-1.5">
        <div className="flex items-center gap-2">
          <span className={cn('h-2 w-2 rounded-full', STATUS_META[id].color)} />
          <h3 className="text-sm font-semibold text-[var(--fg)]">{label}</h3>
          <span className="text-[11px] text-[var(--fg-muted)]">{tasks.length}</span>
        </div>
        <button
          onClick={onAdd}
          className="rounded p-1 text-[var(--fg-muted)] hover:bg-[var(--bg-elev-2)] hover:text-[var(--fg)]"
          aria-label="Add task to column"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-2 overflow-y-auto p-0.5">
          {tasks.map((t) => (
            <SortableCard key={t.id} task={t} />
          ))}
          {tasks.length === 0 && (
            <button
              onClick={onAdd}
              className="grid h-20 w-full place-items-center rounded-xl border border-dashed border-[var(--border)] text-xs text-[var(--fg-subtle)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <span className="inline-flex items-center gap-1">
                <Plus className="h-3.5 w-3.5" /> Add
              </span>
            </button>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

function SortableCard({ task }: { task: Task }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { status: task.status },
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} isDragging={isDragging} />
    </div>
  );
}
