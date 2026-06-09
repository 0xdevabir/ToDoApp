'use client';

import { useEffect } from 'react';
import { useApp } from './store';

export function useDensity() {
  const density = useApp((s) => s.settings.density);
  useEffect(() => {
    document.documentElement.dataset.density = density;
  }, [density]);
}
