'use client';

import { useEffect, useRef } from 'react';

import { useTheme } from '@/components/theme/theme-provider';
import { usePrefersReducedMotion } from '@/hooks/use-media-query';
import { createParticleField, type ParticleFieldHandle } from '@/lib/three/particle-field';
import { createPalette, readAccent } from '@/lib/three/palette';

import styles from './ambient-background.module.css';

const DEFAULT_DENSITY = 2000;

export function ParticleField({ density = DEFAULT_DENSITY }: { density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef<ParticleFieldHandle | null>(null);
  const { theme } = useTheme();
  const reducedMotion = usePrefersReducedMotion();

  // Rebuilt only when the geometry itself must change; theme is applied below.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const field = createParticleField({
      canvas,
      density,
      reducedMotion,
      palette: createPalette(theme, readAccent()),
    });

    fieldRef.current = field;
    return () => {
      field?.dispose();
      fieldRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- theme is applied without a rebuild
  }, [density, reducedMotion]);

  useEffect(() => {
    fieldRef.current?.setPalette(createPalette(theme, readAccent()));
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`${styles.canvas} ${styles.field}`}
    />
  );
}
