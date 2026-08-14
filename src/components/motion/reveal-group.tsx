'use client';

import { useRef, type ReactNode } from 'react';

import { usePrefersReducedMotion } from '@/hooks/use-media-query';

import { gsap, useGSAP } from './gsap';

type RevealGroupProps = {
  children: ReactNode;
  className?: string;
  stagger?: number;
  distance?: number;
  start?: string;
};

/**
 * Cascades the direct children of a container into view.
 *
 * Used for grids and card rows, where animating the wrapper would move the whole
 * block at once and lose the sense of items arriving.
 */
export function RevealGroup({
  children,
  className,
  stagger = 0.06,
  distance = 30,
  start = 'top 90%',
}: RevealGroupProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (prefersReducedMotion || !containerRef.current) return;

      const items = gsap.utils.toArray<HTMLElement>(containerRef.current.children);
      if (!items.length) return;

      gsap.fromTo(
        items,
        { opacity: 0, y: distance },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger,
          ease: 'power2.out',
          clearProps: 'transform',
          scrollTrigger: { trigger: containerRef.current, start, once: true },
        },
      );
    },
    { scope: containerRef, dependencies: [stagger, distance, start, prefersReducedMotion] },
  );

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
