import Link from 'next/link';

import { site } from '@/content/site';

import styles from './footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span>
          © {new Date().getFullYear()} {site.name}
        </span>
        <span>three.js · GSAP · installable PWA</span>
        <Link href="/#top" className={styles.top}>
          BACK TO TOP ↑
        </Link>
      </div>
    </footer>
  );
}
