'use client';

import { useApp } from '@/lib/store';
import { Modal } from '@/components/ui';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, Hash, Inbox, Calendar, Layout as LayoutIcon, BarChart3, Settings, Sparkles, Plus } from 'lucide-react';
import { Input } from '@/components/ui';
import { cn } from '@/lib/utils';

export function CommandPalette({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: () => void;
}) {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const tasks = useApp((s) => s.tasks);
  const lists = useApp((s) => s.lists);
  const tags = useApp((s) => s.tags);
  const setSettings = useApp((s) => s.setSettings);
  const setFilters = useApp((s) => s.setFilters);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
    }
  }, [open]);

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = (s: string) => !q || s.toLowerCase().includes(q);
    const nav = [
      { kind: 'nav' as const, label: 'Go to Today', icon: <Sparkles className="h-4 w-4" />, run: () => router.push('/today') },
      { kind: 'nav' as const, label: 'Go to Upcoming', icon: <Calendar className="h-4 w-4" />, run: () => router.push('/upcoming') },
      { kind: 'nav' as const, label: 'Go to Inbox', icon: <Inbox className="h-4 w-4" />, run: () => router.push('/inbox') },
      { kind: 'nav' as const, label: 'Go to All Tasks', icon: <Hash className="h-4 w-4" />, run: () => router.push('/all') },
      { kind: 'nav' as const, label: 'Go to Kanban', icon: <LayoutIcon className="h-4 w-4" />, run: () => router.push('/kanban') },
      { kind: 'nav' as const, label: 'Go to Calendar', icon: <Calendar className="h-4 w-4" />, run: () => router.push('/calendar') },
      { kind: 'nav' as const, label: 'Go to Analytics', icon: <BarChart3 className="h-4 w-4" />, run: () => router.push('/analytics') },
      { kind: 'nav' as const, label: 'Go to Settings', icon: <Settings className="h-4 w-4" />, run: () => router.push('/settings') },
      { kind: 'action' as const, label: 'New task', icon: <Plus className="h-4 w-4" />, run: () => onCreate() },
      { kind: 'action' as const, label: 'Toggle theme (cycle)', icon: <Sparkles className="h-4 w-4" />, run: () => setSettings({ theme: 'dark' }) },
      { kind: 'action' as const, label: 'Clear all filters', icon: <Search className="h-4 w-4" />, run: () => setFilters({ query: '', priorities: [], tagIds: [], listIds: [], statuses: [], hasDue: 'any' }) },
    ].filter((n) => matches(n.label));

    const listMatches = lists
      .filter((l) => matches(l.name))
      .map((l) => ({
        kind: 'list' as const,
        label: `${l.emoji} ${l.name}`,
        icon: <span className="h-2.5 w-2.5 rounded-sm" style={{ background: l.color }} />,
        run: () => router.push(`/list/${l.id}`),
      }));

    const tagMatches = tags
      .filter((t) => matches(t.name))
      .map((t) => ({
        kind: 'tag' as const,
        label: `#${t.name}`,
        icon: <span className="h-2.5 w-2.5 rounded-full" style={{ background: t.color }} />,
        run: () => router.push(`/tag/${t.id}`),
      }));

    const taskMatches = tasks
      .filter((t) => t.status !== 'done' && matches(t.title))
      .slice(0, 8)
      .map((t) => ({
        kind: 'task' as const,
        label: t.title,
        icon: <Search className="h-4 w-4" />,
        run: () => router.push(`/inbox?focus=${t.id}`),
      }));

    return { nav, listMatches, tagMatches, taskMatches, flat: [...nav, ...listMatches, ...tagMatches, ...taskMatches] };
  }, [query, tasks, lists, tags, router, setSettings, setFilters, onCreate]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  const runAt = (i: number) => {
    const item = sections.flat[i];
    if (!item) return;
    item.run();
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      hideClose
      title={null}
    >
      <div className="-m-5">
        <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
          <Search className="h-4 w-4 text-[var(--fg-subtle)]" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActive((a) => Math.min(sections.flat.length - 1, a + 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActive((a) => Math.max(0, a - 1));
              } else if (e.key === 'Enter') {
                e.preventDefault();
                runAt(active);
              }
            }}
            placeholder="Type a command, search tasks, lists, or tags…"
            className="w-full bg-transparent text-sm text-[var(--fg)] outline-none placeholder:text-[var(--fg-subtle)]"
          />
          <kbd className="rounded border border-[var(--border)] bg-[var(--bg-elev-2)] px-1.5 text-[10px] text-[var(--fg-muted)]">ESC</kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-1">
          {sections.flat.length === 0 && (
            <div className="px-3 py-10 text-center text-sm text-[var(--fg-muted)]">No results</div>
          )}
          {sections.flat.map((item, i) => (
            <button
              key={i}
              onMouseEnter={() => setActive(i)}
              onClick={() => runAt(i)}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors',
                active === i ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--fg)] hover:bg-[var(--bg-elev-2)]',
              )}
            >
              {item.icon}
              <span className="flex-1 truncate">{item.label}</span>
              <ArrowRight className="h-3.5 w-3.5 text-[var(--fg-subtle)]" />
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
