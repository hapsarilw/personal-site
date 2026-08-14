'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';

import { gsap, ScrollTrigger, useGSAP } from '@/components/motion/gsap';
import { InstallButton } from '@/components/layout/install-button';
import { MobileMenu } from '@/components/layout/mobile-menu';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { navLinks, site } from '@/content/site';
import { usePrefersReducedMotion } from '@/hooks/use-media-query';

import styles from './header.module.css';

/** Scroll distance below which the header always stays visible. */
const RETRACT_THRESHOLD = 220;

export function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      const setProgress = gsap.quickTo(progressRef.current, 'scaleX', {
        duration: 0.25,
        ease: 'power2.out',
      });

      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => setProgress(self.progress),
      });

      if (prefersReducedMotion) return;

      // Retract on the way down, return on the way up.
      let lastScroll = 0;
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          const current = self.scroll();
          const shouldHide = current > lastScroll + 2 && current > RETRACT_THRESHOLD;
          const shouldShow = current < lastScroll - 2 || current <= RETRACT_THRESHOLD;
          lastScroll = current;

          if (!shouldHide && !shouldShow) return;
          gsap.to(headerRef.current, {
            yPercent: shouldHide ? -110 : 0,
            duration: 0.45,
            ease: 'power3.out',
            overwrite: true,
          });
        },
      });
    },
    { dependencies: [prefersReducedMotion] },
  );

  return (
    <>
      <header ref={headerRef} className={styles.header}>
        <nav className={styles.nav}>
          <Link href="/#top" className={styles.brand}>
            <span className={styles.brandMark} aria-hidden="true">
              &lt;/&gt;
            </span>
            H.LAKSMI
          </Link>

          <div className={styles.links}>
            {navLinks.map(({ label, href }) => (
              <Link key={href} href={href} className={styles.link}>
                {label}
              </Link>
            ))}
          </div>

          <div className={styles.actions}>
            <ThemeToggle />
            <InstallButton />
            <Link href="/#contact" className={styles.cta}>
              Get in touch
            </Link>
            <button
              type="button"
              className={styles.menuButton}
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={isMenuOpen}
            >
              <span className={styles.menuBar} />
              <span className={styles.menuBar} />
            </button>
          </div>
        </nav>

        <div
          ref={progressRef}
          className={styles.progress}
          role="progressbar"
          aria-label={`Reading progress on ${site.shortName}'s site`}
        />
      </header>

      {isMenuOpen ? <MobileMenu onClose={() => setIsMenuOpen(false)} /> : null}
    </>
  );
}
