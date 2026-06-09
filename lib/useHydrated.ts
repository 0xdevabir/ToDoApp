'use client';

import { useEffect, useState } from 'react';
import { useApp } from './store';

export function useHydrated() {
  const hydrated = useApp((s) => s.hydrated);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return hydrated && mounted;
}
