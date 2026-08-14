'use client';

import { useRef } from 'react';

import { gsap, useGSAP } from '@/components/motion/gsap';
import { ButtonLink } from '@/components/ui/button';
import { hero, site } from '@/content/site';
import { usePrefersReducedMotion } from '@/hooks/use-media-query';

import styles from './hero.module.css';

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (prefersReducedMotion || !sectionRef.current) return;

      const blocks = gsap.utils.toArray<HTMLElement>(sectionRef.current.children);

      gsap
        .timeline({ delay: 0.15 })
        .fromTo(
          blocks,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.95, stagger: 0.09, ease: 'power3.out' },
        )
        .fromTo(
          headlineRef.current,
          { clipPath: 'inset(0 100% 0 0)' },
          { clipPath: 'inset(0 0% 0 0)', duration: 1.2, ease: 'expo.out' },
          0.25,
        );

      // The hero drifts and fades as you scroll past it.
      gsap.to(sectionRef.current, {
        y: -80,
        opacity: 0.12,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6,
          // Once faded, the hero must not intercept clicks meant for the page.
          onUpdate: (self) => {
            const element = sectionRef.current;
            if (element) element.style.pointerEvents = self.progress > 0.3 ? 'none' : '';
          },
        },
      });
    },
    { scope: sectionRef, dependencies: [prefersReducedMotion] },
  );

  return (
    <section id="top" ref={sectionRef} className={styles.hero}>
      <div className={styles.availability}>
        <span className={styles.pulse} aria-hidden="true" />
        {hero.availability}
      </div>

      <p className={styles.eyebrow}>{hero.eyebrow}</p>

      <h1 ref={headlineRef} className={styles.headline}>
        {hero.headline}
        <span className={styles.caret} aria-hidden="true">
          _
        </span>
      </h1>

      <p className={styles.summary}>{hero.summary}</p>

      <div className={styles.badges}>
        {hero.badges.map(({ label, accent }) => (
          <span
            key={label}
            className={`${styles.badge} ${accent ? styles.badgeAccent : ''}`.trim()}
          >
            {label}
          </span>
        ))}
      </div>

      <div className={styles.actions}>
        <ButtonLink href="/#work" variant="primary" size="lg">
          Selected work <span aria-hidden="true">→</span>
        </ButtonLink>
        <ButtonLink href={site.resumeFile} variant="outline" size="lg" download>
          Download résumé <span className={styles.resumeHint}>PDF</span>
        </ButtonLink>
      </div>

      <div className={styles.facts}>
        {hero.facts.map(({ label, value }) => (
          <div key={label} className={styles.fact}>
            <p className={styles.factLabel}>{label}</p>
            <p className={styles.factValue}>{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
