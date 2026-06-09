'use client';

import { useEffect, useState } from 'react';
import { useTaskModal } from './task-modal';

export function ShortcutsAndPalette({
  children,
}: {
  children: (api: { openPalette: () => void; openCreate: () => void }) => React.ReactNode;
}) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const taskModal = useTaskModal();

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
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [taskModal]);

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
