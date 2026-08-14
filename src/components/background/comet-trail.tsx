'use client';

import { useEffect, useRef } from 'react';

import { useMediaQuery, usePrefersReducedMotion } from '@/hooks/use-media-query';
import { createCometTrail } from '@/lib/canvas/comet-trail';

import styles from './ambient-background.module.css';

const FALLBACK_CHANNELS = '198, 242, 78';

export function CometTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  // `pointermove` also fires for touch drags, so without this check the
  // trail would "follow the cursor" on phones and tablets, which have no
  // actual cursor to follow.
  const isCoarsePointer = useMediaQuery('(pointer: coarse)');
  const disabled = reducedMotion || isCoarsePointer;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || disabled) return;

    const trail = createCometTrail({
      canvas,
      getColorChannels: () =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--accent-comet')
          .trim() || FALLBACK_CHANNELS,
    });

    return () => trail?.dispose();
  }, [disabled]);

  if (disabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`${styles.canvas} ${styles.comet}`}
    />
  );
}
