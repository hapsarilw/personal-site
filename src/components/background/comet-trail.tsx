'use client';

import { useEffect, useRef } from 'react';

import { usePrefersReducedMotion } from '@/hooks/use-media-query';
import { createCometTrail } from '@/lib/canvas/comet-trail';

import styles from './ambient-background.module.css';

const FALLBACK_CHANNELS = '198, 242, 78';

export function CometTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reducedMotion) return;

    const trail = createCometTrail({
      canvas,
      getColorChannels: () =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--accent-comet')
          .trim() || FALLBACK_CHANNELS,
    });

    return () => trail?.dispose();
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`${styles.canvas} ${styles.comet}`}
    />
  );
}
