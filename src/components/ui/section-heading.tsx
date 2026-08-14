'use client';

import { useRef } from 'react';

import { gsap, useGSAP } from '@/components/motion/gsap';
import { usePrefersReducedMotion } from '@/hooks/use-media-query';

import styles from './section-heading.module.css';

type SectionHeadingProps = {
  index: string;
  title: string;
  meta?: string;
  /** Tightens the gap below, for sections whose first element is a control bar. */
  tight?: boolean;
};

/**
 * Numbered section header. Owns its own entrance  the parts stagger in and the
 * title wipes open  because the animation is part of what this component is,
 * not something callers should have to remember to wire up.
 */
export function SectionHeading({ index, title, meta, tight = false }: SectionHeadingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (prefersReducedMotion || !containerRef.current) return;

      const parts = gsap.utils.toArray<HTMLElement>(containerRef.current.children);
      const timeline = gsap.timeline({
        scrollTrigger: { trigger: containerRef.current, start: 'top 88%', once: true },
      });

      timeline
        .fromTo(
          parts,
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.85, stagger: 0.09, ease: 'power3.out' },
        )
        .fromTo(
          titleRef.current,
          { clipPath: 'inset(0 100% 0 0)' },
          { clipPath: 'inset(0 0% 0 0)', duration: 1, ease: 'expo.out' },
          0,
        );
    },
    { scope: containerRef, dependencies: [prefersReducedMotion] },
  );

  return (
    <div
      ref={containerRef}
      className={`${styles.heading} ${tight ? styles.tight : ''}`.trim()}
    >
      <span className={styles.index}>{index}</span>
      <h2 ref={titleRef} className={styles.title}>
        {title}
      </h2>
      {meta ? <span className={styles.meta}>{meta}</span> : null}
    </div>
  );
}
