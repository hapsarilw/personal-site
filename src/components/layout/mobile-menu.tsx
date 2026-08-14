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
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
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
