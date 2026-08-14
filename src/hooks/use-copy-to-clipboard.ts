'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const RESET_DELAY_MS = 1900;

export function useCopyToClipboard() {
  const [hasCopied, setHasCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const copy = useCallback(async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Insecure context or denied permission — the address is still selectable.
      return;
    }

    setHasCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setHasCopied(false), RESET_DELAY_MS);
  }, []);

  return { hasCopied, copy };
}
