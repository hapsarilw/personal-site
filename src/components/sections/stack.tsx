import { Section } from '@/components/layout/section';
import { RevealGroup } from '@/components/motion/reveal-group';
import { SectionHeading } from '@/components/ui/section-heading';
import { stackGroups } from '@/content/stack';

import styles from './stack.module.css';

export function Stack() {
  return (
    <Section id="stack">
      <SectionHeading index="03" title="Stack" meta="SHIPPED WITH, NOT SKIMMED" />

      <RevealGroup className={styles.grid} stagger={0.055}>
        {stackGroups.map((group) => (
          <div key={group.title} className={styles.group}>
            <p className={styles.groupTitle}>{group.title}</p>
            <div className={styles.items}>
              {group.items.map((item) => (
                <span key={item} className={styles.item}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </RevealGroup>
    </Section>
  );
}
