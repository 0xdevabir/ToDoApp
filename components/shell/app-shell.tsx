'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { TaskModalProvider } from './task-modal';
import { ShortcutsAndPalette } from './shortcuts';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { useHydrated } from '@/lib/useHydrated';
import { useApp } from '@/lib/store';
import { useDensity } from '@/lib/hooks';

export function AppShell({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  useDensity();

  return (
    <ThemeProvider>
      <TaskModalProvider>
        <ShortcutsAndPalette>
          {({ openPalette, openCreate }) => (
            <div className="flex h-dvh w-full overflow-hidden">
              <Sidebar onCreate={openCreate} />
              <div className="flex min-w-0 flex-1 flex-col">
                <Topbar onCreate={openCreate} onOpenPalette={openPalette} />
                <main className="flex-1 overflow-y-auto">
                  <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
                    {hydrated ? children : <BootSkeleton />}
                  </div>
                </main>
              </div>
            </div>
          )}
        </ShortcutsAndPalette>
      </TaskModalProvider>
    </ThemeProvider>
  );
}

function BootSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-8 w-48 rounded-md bg-[var(--bg-elev-2)]" />
      <div className="h-4 w-72 rounded-md bg-[var(--bg-elev-2)]" />
      <div className="h-24 w-full rounded-2xl bg-[var(--bg-elev-2)]" />
      <div className="h-12 w-full rounded-2xl bg-[var(--bg-elev-2)]" />
    </div>
  );
}
