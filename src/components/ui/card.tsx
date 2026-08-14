import type { ReactNode } from 'react';

import styles from './card.module.css';

type CardProps = {
  children: ReactNode;
  as?: 'div' | 'article';
  /** Adds the lift-and-glow hover treatment. */
  interactive?: boolean;
  className?: string;
};

export function Card({
  children,
  as: Element = 'div',
  interactive = false,
  className,
}: CardProps) {
  const classes = [styles.card, interactive && styles.interactive, className]
    .filter(Boolean)
    .join(' ');

  return <Element className={classes}>{children}</Element>;
}
