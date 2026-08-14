import { Section } from '@/components/layout/section';
import { Reveal } from '@/components/motion/reveal';
import { SectionHeading } from '@/components/ui/section-heading';
import { experience, totalYearsLabel } from '@/content/experience';

import styles from './experience.module.css';

export function Experience() {
  return (
    <Section id="experience">
      <SectionHeading index="02" title="Experience" meta={totalYearsLabel} />

      <div className={styles.list}>
        {experience.map((entry) => (
          <Reveal key={`${entry.company}-${entry.period}`}>
            <div className={styles.entry}>
              <div>
                <p className={styles.period}>{entry.period}</p>
                <p className={styles.industry}>{entry.industry}</p>
              </div>
              <div>
                <h3 className={styles.role}>
                  {entry.role}  <span className={styles.company}>{entry.company}</span>
                </h3>
                <p className={styles.summary}>{entry.summary}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
