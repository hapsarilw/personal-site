'use client';

import { useRef, type ReactNode } from 'react';

import { usePrefersReducedMotion } from '@/hooks/use-media-query';

import { gsap, useGSAP } from './gsap';

export type RevealVariant = 'rise' | 'card';

type VariantSpec = {
  from: gsap.TweenVars;
  to: gsap.TweenVars;
};

const VARIANTS: Record<RevealVariant, VariantSpec> = {
  rise: {
    from: { opacity: 0, y: 26 },
    to: { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
  },
  card: {
    from: {
      opacity: 0,
      y: 52,
      scale: 0.965,
      rotateX: 8,
      transformPerspective: 900,
      transformOrigin: '50% 0%',
    },
    to: { opacity: 1, y: 0, scale: 1, rotateX: 0, duration: 1, ease: 'power3.out' },
  },
};

type RevealProps = {
  children: ReactNode;
  variant?: RevealVariant;
  className?: string;
  delay?: number;
  start?: string;
};

/**
 * Scroll-triggered entrance for a single element.
 *
 * The initial hidden state is set by GSAP after mount rather than in CSS, so
 * content stays visible if JavaScript never runs. Reduced-motion visitors skip
 * the animation entirely and see the element in its final state.
 */
export function Reveal({
  children,
  variant = 'rise',
  className,
  delay = 0,
  start = 'top 90%',
}: RevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (prefersReducedMotion) return;

      const spec = VARIANTS[variant];
      gsap.fromTo(containerRef.current, spec.from, {
        ...spec.to,
        delay,
        clearProps: 'transform,transformPerspective,transformOrigin',
        scrollTrigger: { trigger: containerRef.current, start, once: true },
      });
    },
    { scope: containerRef, dependencies: [variant, delay, start, prefersReducedMotion] },
  );

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
