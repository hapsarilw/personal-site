import type { ReactNode } from 'react';

import styles from './tag.module.css';

type TagProps = {
  children: ReactNode;
  accent?: boolean;
  size?: 'sm' | 'md';
};

export function Tag({ children, accent = false, size = 'md' }: TagProps) {
  const classes = [styles.tag, size === 'sm' && styles.sm, accent && styles.accent]
    .filter(Boolean)
    .join(' ');

  return <span className={classes}>{children}</span>;
}
