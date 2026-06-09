'use client';

import { useEffect, useRef, useState } from 'react';
import { Modal } from '@/components/ui';
import { Kbd } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { useTaskModal } from './task-modal';

const groups: { title: string; items: { keys: string[]; label: string }[] }[] = [
  {
    title: 'Navigation',
    items: [
      { keys: ['1'], label: 'Go to Today' },
      { keys: ['2'], label: 'Go to Kanban' },
      { keys: ['3'], label: 'Go to Calendar' },
      { keys: ['4'], label: 'Go to Analytics' },
      { keys: ['G', 'T'], label: 'Today' },
      { keys: ['G', 'U'], label: 'Upcoming' },
      { keys: ['G', 'I'], label: 'Inbox' },
      { keys: ['G', 'A'], label: 'All tasks' },
      { keys: ['G', 'C'], label: 'Completed' },
      { keys: ['G', 'S'], label: 'Settings' },
    ],
  },
  {
    title: 'Actions',
    items: [
      { keys: ['N'], label: 'New task' },
      { keys: ['⌘', 'K'], label: 'Open command palette' },
      { keys: ['/'], label: 'Focus search' },
      { keys: ['?'], label: 'Open this help' },
    ],
  },
];

export function HelpButton() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const taskModal = useTaskModal();
  const pressed = useRef<{ g: boolean; t: number | null }>({ g: false, t: null });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inField =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);
      const mod = e.metaKey || e.ctrlKey;
      if (mod) return;
      if (inField) return;
      if (e.key === '?') {
        e.preventDefault();
        setOpen(true);
        return;
      }
      if (e.key === 'g' || e.key === 'G') {
        pressed.current.g = true;
        if (pressed.current.t) window.clearTimeout(pressed.current.t);
        pressed.current.t = window.setTimeout(() => (pressed.current.g = false), 700);
        return;
      }
      if (pressed.current.g) {
        if (e.key === 't') router.push('/today');
        if (e.key === 'u') router.push('/upcoming');
        if (e.key === 'i') router.push('/inbox');
        if (e.key === 'a') router.push('/all');
        if (e.key === 'c') router.push('/completed');
        if (e.key === 's') router.push('/settings');
        if (e.key === 'k') router.push('/kanban');
        if (e.key === 'l') router.push('/calendar');
        if (e.key === 'n') router.push('/analytics');
        pressed.current.g = false;
        return;
      }
      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        taskModal.open();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router, taskModal]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-40 grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] bg-[var(--bg-elev)] text-[var(--fg-muted)] shadow-[var(--shadow-sm)] hover:bg-[var(--bg-elev-2)] hover:text-[var(--fg)]"
        aria-label="Keyboard shortcuts"
        title="Shortcuts (press ?)"
      >
        ?
      </button>
      <Modal open={open} onOpenChange={setOpen} size="md" title="Keyboard shortcuts">
        <div className="space-y-5">
          {groups.map((g) => (
            <section key={g.title}>
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--fg-subtle)]">
                {g.title}
              </h3>
              <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)]">
                {g.items.map((it) => (
                  <li key={it.label} className="flex items-center justify-between px-3 py-2 text-sm">
                    <span className="text-[var(--fg)]">{it.label}</span>
                    <span className="flex items-center gap-1">
                      {it.keys.map((k, i) => (
                        <span key={i} className="inline-flex items-center gap-1">
                          <Kbd>{k}</Kbd>
                          {i < it.keys.length - 1 && <span className="text-[var(--fg-subtle)]">+</span>}
                        </span>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Modal>
    </>
  );
}
