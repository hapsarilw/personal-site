import { Section } from '@/components/layout/section';
import { RevealGroup } from '@/components/motion/reveal-group';
import { Card } from '@/components/ui/card';
import { SectionHeading } from '@/components/ui/section-heading';
import { lookingForCards } from '@/content/looking-for';

import styles from './looking-for.module.css';

export function LookingFor() {
  return (
    <Section id="services">
      <SectionHeading index="06" title="What I am looking for" />

      <RevealGroup className={styles.grid} stagger={0.08} distance={40}>
        {lookingForCards.map((card) => (
          <Card key={card.eyebrow} interactive>
            <p className={styles.eyebrow}>{card.eyebrow}</p>
            <h3 className={styles.title}>{card.title}</h3>
            <p className={styles.description}>{card.description}</p>
            <div className={styles.points}>
              {card.points.map((point) => (
                <span key={point} className={styles.point}>
                  · {point}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </RevealGroup>
    </Section>
  );
}
