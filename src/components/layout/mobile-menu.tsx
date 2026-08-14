'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import { ThemeToggle } from '@/components/layout/theme-toggle';
import { navLinks } from '@/content/site';

import styles from './mobile-menu.module.css';

type MobileMenuProps = {
  onClose: () => void;
};

export function MobileMenu({ onClose }: MobileMenuProps) {
  // Lock the page behind the overlay and restore scrolling on unmount.
  //
  // `overflow: hidden` alone doesn't stop scroll on iOS Safari — a real touch
  // still rubber-bands the page underneath, which swallows the tap before it
  // reaches a link. Pinning the body with `position: fixed` at the negative
  // scroll offset removes it from the scroll flow entirely, then the offset
  // is used to restore the exact scroll position on close.
  useEffect(() => {
    const scrollY = window.scrollY;
    const { body } = document;
    const previousStyle = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      body.style.position = previousStyle.position;
      body.style.top = previousStyle.top;
      body.style.left = previousStyle.left;
      body.style.right = previousStyle.right;
      body.style.width = previousStyle.width;
      body.style.overflow = previousStyle.overflow;
      window.scrollTo(0, scrollY);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Menu">
      <button type="button" className={styles.close} onClick={onClose} aria-label="Close menu">
        ×
      </button>

      <nav className={styles.links}>
        {navLinks.map(({ label, href }) => (
          <Link key={href} href={href} className={styles.link} onClick={onClose}>
            {label}
          </Link>
        ))}
      </nav>

      <div className={styles.footer}>
        <ThemeToggle withLabel />
        <Link href="/#contact" className={styles.cta} onClick={onClose}>
          Get in touch
        </Link>
      </div>
    </div>
  );
}
