'use client';

import { useApp } from '@/lib/store';
import { ACCENT_LABELS } from '@/lib/constants';
import type { AccentColor, ThemeMode } from '@/lib/types';
import { Sun, Moon, Laptop2, Search, Plus, Command } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button, Input, Tooltip } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function Topbar({
  onCreate,
  onOpenPalette,
}: {
  onCreate: () => void;
  onOpenPalette: () => void;
}) {
  const theme = useApp((s) => s.settings.theme);
  const accent = useApp((s) => s.settings.accent);
  const setSettings = useApp((s) => s.setSettings);
  const query = useApp((s) => s.filters.query);
  const setFilters = useApp((s) => s.setFilters);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const router = useRouter();
  const pathname = usePathname();

  const cycleTheme = () => {
    const order: ThemeMode[] = ['system', 'light', 'dark'];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setSettings({ theme: next });
  };

  const cycleAccent = () => {
    const order: AccentColor[] = ['indigo', 'violet', 'pink', 'rose', 'amber', 'emerald', 'cyan', 'sky'];
    const next = order[(order.indexOf(accent) + 1) % order.length];
    setSettings({ accent: next });
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-[var(--border)] bg-[var(--bg)]/80 px-3 backdrop-blur-md sm:gap-3 sm:px-5">
      <div className="flex items-center gap-2 lg:hidden">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--accent)] text-[var(--accent-fg)]">
          ✦
        </span>
        <span className="text-sm font-semibold">FlowDo</span>
      </div>

      <div className="flex flex-1 items-center gap-2">
        <div className="relative max-w-xl flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-subtle)]" />
          <Input
            value={query}
            onChange={(e) => setFilters({ query: e.target.value })}
            onFocus={onOpenPalette}
            placeholder="Search tasks, lists, tags…"
            className="pl-9 pr-16"
          />
          <div className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 sm:flex">
            <kbd className="rounded border border-[var(--border)] bg-[var(--bg-elev-2)] px-1.5 text-[10px] font-medium text-[var(--fg-muted)]">⌘K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Tooltip label={`Accent: ${ACCENT_LABELS[accent]}`}>
          <button
            onClick={cycleAccent}
            className="h-9 w-9 rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] transition hover:bg-[var(--bg-elev-2)]"
            aria-label="Change accent"
          >
            <span
              className="mx-auto block h-4 w-4 rounded-full"
              style={{ background: 'var(--accent)' }}
            />
          </button>
        </Tooltip>
        <Tooltip label={`Theme: ${theme}`}>
          <button
            onClick={cycleTheme}
            className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] transition hover:bg-[var(--bg-elev-2)]"
            aria-label="Change theme"
          >
            {mounted && theme === 'light' && <Sun className="h-4 w-4" />}
            {mounted && theme === 'dark' && <Moon className="h-4 w-4" />}
            {mounted && theme === 'system' && <Laptop2 className="h-4 w-4" />}
            {!mounted && <Sun className="h-4 w-4" />}
          </button>
        </Tooltip>
        <Button onClick={onCreate} className="hidden sm:inline-flex">
          <Plus className="h-4 w-4" /> New
        </Button>
      </div>
    </header>
  );
}
