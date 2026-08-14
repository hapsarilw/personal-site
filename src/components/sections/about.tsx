import { Section } from '@/components/layout/section';
import { Reveal } from '@/components/motion/reveal';
import { SectionHeading } from '@/components/ui/section-heading';
import { about } from '@/content/site';

import styles from './about.module.css';

export function About() {
  const [lead, ...rest] = about.paragraphs;

  return (
    <Section id="about">
      <SectionHeading index="05" title="About" />

      <div className={styles.layout}>
        <Reveal>
          <div className={styles.portrait}>
            <span className={styles.portraitLabel}>PORTRAIT PLACEHOLDER</span>
            <span className={styles.portraitHint}>4 : 5 · drop a photo here</span>
          </div>
        </Reveal>

        <Reveal className={styles.body}>
          <p className={styles.lead}>{lead}</p>
          {rest.map((paragraph) => (
            <p key={paragraph} className={styles.paragraph}>
              {paragraph}
            </p>
          ))}

          <div className={styles.facts}>
            {about.facts.map(({ label, value }) => (
              <div key={label} className={styles.fact}>
                <span className={styles.factLabel}>{label}</span>
                <span className={styles.factValue}>{value}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
