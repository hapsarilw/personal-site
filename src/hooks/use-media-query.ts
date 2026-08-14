'use client';

import { useSyncExternalStore } from 'react';

/**
 * Reads a media query without the mount-flash of a `useState` + `useEffect`
 * pair. `useSyncExternalStore` gives React the server snapshot explicitly, so
 * hydration is never mismatched.
 */
export function useMediaQuery(query: string, serverFallback = false): boolean {
  const subscribe = (onChange: () => void) => {
    const media = window.matchMedia(query);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  };

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverFallback,
  );
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
