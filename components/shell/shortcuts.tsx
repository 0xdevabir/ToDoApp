'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTaskModal } from './task-modal';

export function ShortcutsAndPalette({
  children,
}: {
  children: (api: { openPalette: () => void; openCreate: () => void }) => React.ReactNode;
}) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const taskModal = useTaskModal();
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inField =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);
      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
        return;
      }
      if (mod && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        taskModal.open();
        return;
      }
      if (e.key === '/' && !inField) {
        e.preventDefault();
        setPaletteOpen(true);
        return;
      }
      if (!mod && !inField) {
        if (e.key.toLowerCase() === 'n') {
          e.preventDefault();
          taskModal.open();
          return;
        }
        if (e.key === '1') {
          e.preventDefault();
          router.push('/today');
          return;
        }
        if (e.key === '2') {
          e.preventDefault();
          router.push('/kanban');
          return;
        }
        if (e.key === '3') {
          e.preventDefault();
          router.push('/calendar');
          return;
        }
        if (e.key === '4') {
          e.preventDefault();
          router.push('/analytics');
          return;
        }
        if (e.key === 'g' || e.key === 'G') {
          const onG = (ev: KeyboardEvent) => {
            if (ev.key === 't') router.push('/today');
            if (ev.key === 'u') router.push('/upcoming');
            if (ev.key === 'i') router.push('/inbox');
            if (ev.key === 'a') router.push('/all');
            if (ev.key === 'c') router.push('/completed');
            if (ev.key === 's') router.push('/settings');
            window.removeEventListener('keydown', onG);
          };
          window.addEventListener('keydown', onG, { once: true });
          setTimeout(() => window.removeEventListener('keydown', onG), 700);
          return;
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router, taskModal]);

  return (
    <>
      {children({ openPalette: () => setPaletteOpen(true), openCreate: () => taskModal.open() })}
      <PaletteBridge open={paletteOpen} onOpenChange={setPaletteOpen} onCreate={() => taskModal.open()} />
    </>
  );
}

import { CommandPalette } from './command-palette';

function PaletteBridge({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: () => void;
}) {
  return <CommandPalette open={open} onOpenChange={onOpenChange} onCreate={onCreate} />;
}
