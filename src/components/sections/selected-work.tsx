import { Section } from '@/components/layout/section';
import { RevealGroup } from '@/components/motion/reveal-group';
import { ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SectionHeading } from '@/components/ui/section-heading';
import { Tag } from '@/components/ui/tag';
import { projects } from '@/content/projects';

import { ProjectMediaLink } from './project-media-link';
import styles from './selected-work.module.css';

/** Project files that open in a modal rather than a new tab. */
const MEDIA_FILE = /\.(mp4|webm|pdf)$/i;

export function SelectedWork() {
  return (
    <Section id="work">
      <SectionHeading index="01" title="Selected work" meta="FOUR BUILDS" />

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

            {project.previewUrl || project.links ? (
              <div className={styles.actions}>
                {project.previewUrl ? (
                  <ButtonLink
                    href={project.previewUrl}
                    variant="subtle"
                    size="sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Live preview <span aria-hidden="true">↗</span>
                  </ButtonLink>
                ) : null}

                {project.links?.map((link) =>
                  MEDIA_FILE.test(link.href) ? (
                    <ProjectMediaLink
                      key={link.href}
                      href={link.href}
                      label={link.label}
                      title={`${project.title} · ${link.label}`}
                      poster={link.poster}
                    />
                  ) : (
                    <ButtonLink key={link.href} href={link.href} variant="subtle" size="sm">
                      {link.label} <span aria-hidden="true">→</span>
                    </ButtonLink>
                  ),
                )}
              </div>
            ) : null}
          </Card>
        ))}
      </RevealGroup>
    </Section>
  );
}
