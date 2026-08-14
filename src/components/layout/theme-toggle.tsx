'use client';

import { useTheme } from '@/components/theme/theme-provider';
import { Button } from '@/components/ui/button';

import styles from './theme-toggle.module.css';

export function ThemeToggle({ withLabel = false }: { withLabel?: boolean }) {
  const { theme, toggleTheme } = useTheme();
  const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <Button
      variant="subtle"
      size={withLabel ? 'md' : 'icon'}
      onClick={toggleTheme}
      title={label}
      aria-label={label}
    >
      <span aria-hidden="true">
        <span className={styles.forDark}>☽</span>
        <span className={styles.forLight}>☀</span>
      </span>
      {withLabel ? (
        <span>
          <span className={styles.forDark}>Light mode</span>
          <span className={styles.forLight}>Dark mode</span>
        </span>
      ) : null}
    </Button>
  );
}
