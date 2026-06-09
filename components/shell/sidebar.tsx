'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarDays,
  CheckCircle2,
  Inbox,
  Layout as LayoutIcon,
  ListTodo,
  Tag as TagIcon,
  Settings,
  BarChart3,
  Sparkles,
  Plus,
  Hash,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { useState } from 'react';
import { Button, Input, Modal, Tooltip } from '@/components/ui';
import { LIST_PALETTE, TAG_PALETTE } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { href: '/today', label: 'Today', icon: Sparkles },
  { href: '/upcoming', label: 'Upcoming', icon: CalendarDays },
  { href: '/inbox', label: 'Inbox', icon: Inbox },
  { href: '/all', label: 'All Tasks', icon: ListTodo },
  { href: '/completed', label: 'Completed', icon: CheckCircle2 },
];

const viewItems = [
  { href: '/kanban', label: 'Kanban', icon: LayoutIcon },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export function Sidebar({ onCreate }: { onCreate: () => void }) {
  const pathname = usePathname();
  const lists = useApp((s) => s.lists);
  const tags = useApp((s) => s.tags);
  const tasks = useApp((s) => s.tasks);
  const addList = useApp((s) => s.addList);
  const removeList = useApp((s) => s.removeList);
  const addTag = useApp((s) => s.addTag);
  const removeTag = useApp((s) => s.removeTag);
  const [editingList, setEditingList] = useState<string | null>(null);
  const [addingList, setAddingList] = useState(false);
  const [newList, setNewList] = useState({ name: '', color: LIST_PALETTE[0], emoji: '📌' });
  const [addingTag, setAddingTag] = useState(false);
  const [newTag, setNewTag] = useState({ name: '', color: TAG_PALETTE[0] });

  const counts = (listId: string) => tasks.filter((t) => t.listId === listId && t.status !== 'done').length;

  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--bg-elev)]/40 p-3 lg:flex">
      <Link href="/today" className="mb-2 flex items-center gap-2 rounded-lg px-2 py-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] shadow-sm">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-[var(--fg)]">FlowDo</div>
          <div className="text-[11px] text-[var(--fg-muted)]">Stay in flow.</div>
        </div>
      </Link>

      <div className="px-1.5">
        <Button onClick={onCreate} className="w-full" size="md">
          <Plus className="h-4 w-4" /> New task
          <span className="ml-auto"><kbd className="rounded border border-white/20 bg-white/10 px-1 text-[10px]">N</kbd></span>
        </Button>
      </div>

      <div className="mt-4 px-1.5">
        <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--fg-subtle)]">
          Smart
        </div>
        <nav className="flex flex-col gap-0.5">
          {navItems.map((it) => {
            const active = pathname === it.href;
            return (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  'group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors',
                  active
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'text-[var(--fg-muted)] hover:bg-[var(--bg-elev-2)] hover:text-[var(--fg)]',
                )}
              >
                <it.icon className="h-4 w-4" />
                <span className="flex-1">{it.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-3 px-1.5">
        <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--fg-subtle)]">
          Views
        </div>
        <nav className="flex flex-col gap-0.5">
          {viewItems.map((it) => {
            const active = pathname === it.href;
            return (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  'group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors',
                  active
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'text-[var(--fg-muted)] hover:bg-[var(--bg-elev-2)] hover:text-[var(--fg)]',
                )}
              >
                <it.icon className="h-4 w-4" />
                <span className="flex-1">{it.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-3 flex-1 overflow-y-auto px-1.5">
        <div className="flex items-center justify-between px-2 pb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--fg-subtle)]">
            Lists
          </span>
          <button
            onClick={() => setAddingList(true)}
            className="rounded p-1 text-[var(--fg-subtle)] hover:bg-[var(--bg-elev-2)] hover:text-[var(--fg)]"
            aria-label="Add list"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <nav className="flex flex-col gap-0.5">
          {lists.map((l) => {
            const active = pathname === `/list/${l.id}`;
            return (
              <div key={l.id} className="group relative">
                <Link
                  href={`/list/${l.id}`}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors',
                    active
                      ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                      : 'text-[var(--fg-muted)] hover:bg-[var(--bg-elev-2)] hover:text-[var(--fg)]',
                  )}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ background: l.color }}
                    aria-hidden
                  />
                  <span className="flex-1 truncate">{l.emoji} {l.name}</span>
                  <span className="text-[11px] text-[var(--fg-subtle)]">{counts(l.id)}</span>
                </Link>
                {l.id !== 'inbox' && (
                  <button
                    onClick={() => {
                      if (confirm(`Delete list "${l.name}"? Tasks will move to Inbox.`)) removeList(l.id);
                    }}
                    className="absolute right-1 top-1/2 hidden -translate-y-1/2 rounded p-1 text-[var(--fg-subtle)] hover:bg-[var(--bg-elev-2)] hover:text-[var(--danger)] group-hover:flex"
                    aria-label="Delete list"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </nav>

        <div className="mt-4 flex items-center justify-between px-2 pb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--fg-subtle)]">
            Tags
          </span>
          <button
            onClick={() => setAddingTag(true)}
            className="rounded p-1 text-[var(--fg-subtle)] hover:bg-[var(--bg-elev-2)] hover:text-[var(--fg)]"
            aria-label="Add tag"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 px-1.5">
          {tags.map((t) => (
            <Link
              key={t.id}
              href={`/tag/${t.id}`}
              className="group inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--bg-elev)] px-2 py-0.5 text-[11px] font-medium text-[var(--fg-muted)] transition-colors hover:bg-[var(--bg-elev-2)] hover:text-[var(--fg)]"
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: t.color }} />
              {t.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-2 border-t border-[var(--border)] pt-2">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors',
            pathname === '/settings'
              ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
              : 'text-[var(--fg-muted)] hover:bg-[var(--bg-elev-2)] hover:text-[var(--fg)]',
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>

      <Modal
        open={addingList}
        onOpenChange={setAddingList}
        title="New list"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddingList(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (!newList.name.trim()) return;
                addList({ name: newList.name.trim(), emoji: newList.emoji || '📌', color: newList.color });
                setNewList({ name: '', color: LIST_PALETTE[0], emoji: '📌' });
                setAddingList(false);
              }}
            >
              Create
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            placeholder="List name"
            value={newList.name}
            onChange={(e) => setNewList((s) => ({ ...s, name: e.target.value }))}
            autoFocus
          />
          <Input
            placeholder="Emoji (optional)"
            value={newList.emoji}
            onChange={(e) => setNewList((s) => ({ ...s, emoji: e.target.value }))}
          />
          <div className="flex flex-wrap gap-2">
            {LIST_PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setNewList((s) => ({ ...s, color: c }))}
                className={cn(
                  'h-6 w-6 rounded-full border-2 transition',
                  newList.color === c ? 'border-[var(--fg)]' : 'border-transparent',
                )}
                style={{ background: c }}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </div>
      </Modal>

      <Modal
        open={addingTag}
        onOpenChange={setAddingTag}
        title="New tag"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddingTag(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (!newTag.name.trim()) return;
                addTag({ name: newTag.name.trim().toLowerCase(), color: newTag.color });
                setNewTag({ name: '', color: TAG_PALETTE[0] });
                setAddingTag(false);
              }}
            >
              Create
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            placeholder="Tag name"
            value={newTag.name}
            onChange={(e) => setNewTag((s) => ({ ...s, name: e.target.value }))}
            autoFocus
          />
          <div className="flex flex-wrap gap-2">
            {TAG_PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setNewTag((s) => ({ ...s, color: c }))}
                className={cn(
                  'h-6 w-6 rounded-full border-2 transition',
                  newTag.color === c ? 'border-[var(--fg)]' : 'border-transparent',
                )}
                style={{ background: c }}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </div>
      </Modal>
    </aside>
  );
}
