import type { ReactNode } from 'react';

import styles from './section.module.css';

type SectionProps = {
  id: string;
  children: ReactNode;
  /** Adds the bottom padding that the final section on a page needs. */
  last?: boolean;
};

export function Section({ id, children, last = false }: SectionProps) {
  return (
    <section id={id} className={`${styles.section} ${last ? styles.last : ''}`.trim()}>
      {children}
    </section>
  );
}
