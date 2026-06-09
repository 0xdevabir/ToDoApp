'use client';

import { useEffect } from 'react';
import { useApp } from '@/lib/store';
import { ACCENT_HEX } from '@/lib/constants';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useApp((s) => s.settings.theme);
  const accent = useApp((s) => s.settings.accent);

  useEffect(() => {
    const root = document.documentElement;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const isDark = theme === 'dark' || (theme === 'system' && mql.matches);
      root.classList.toggle('dark', isDark);
      root.style.colorScheme = isDark ? 'dark' : 'light';
    };
    apply();
    if (theme === 'system') {
      mql.addEventListener('change', apply);
      return () => mql.removeEventListener('change', apply);
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', ACCENT_HEX[accent]);
  }, [accent]);

  return <>{children}</>;
}
