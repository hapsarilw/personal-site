import { Section } from '@/components/layout/section';
import { RevealGroup } from '@/components/motion/reveal-group';
import { Card } from '@/components/ui/card';
import { SectionHeading } from '@/components/ui/section-heading';
import { Tag } from '@/components/ui/tag';
import { projects } from '@/content/projects';

import styles from './selected-work.module.css';

export function SelectedWork() {
  return (
    <Section id="work">
      <SectionHeading index="01" title="Selected work" meta="THREE BUILDS" />

      <RevealGroup className={styles.grid} stagger={0.1} distance={40}>
        {projects.map((project) => (
          <Card key={project.id} as="article" interactive>
            <div className={styles.header}>
              <span className={styles.index}>{project.id}</span>
              <span className={styles.meta}>{project.meta}</span>
            </div>

            <h3 className={styles.title}>{project.title}</h3>
            <p className={styles.description}>{project.description}</p>

            <div className={styles.metrics}>
              {project.metrics.map((metric) => (
                <div key={metric.label} className={styles.metric}>
                  <span className={styles.metricLabel}>{metric.label}</span>
                  <span className={styles.metricValue}>{metric.value}</span>
                </div>
              ))}
            </div>

            <div className={styles.tech}>
              {project.tech.map((item) => (
                <Tag key={item}>{item}</Tag>
              ))}
            </div>
          </Card>
        ))}
      </RevealGroup>
    </Section>
  );
}
