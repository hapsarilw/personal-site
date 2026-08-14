import { Section } from '@/components/layout/section';
import { Reveal } from '@/components/motion/reveal';
import { CopyEmailButton } from '@/components/sections/copy-email-button';
import { ButtonLink } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { contact, site, socialLinks } from '@/content/site';

import styles from './contact.module.css';

export function Contact() {
  const [localPart, domain] = site.email.split('@');

  return (
    <Section id="contact" last>
      <SectionHeading index="07" title="Contact" />

      <Reveal className={styles.body}>
        <div className={styles.block}>
          <div className={styles.label}>
            <span>{contact.heading}</span>
            <span className={styles.rule} aria-hidden="true" />
            <CopyEmailButton email={site.email} />
          </div>

          <a href={`mailto:${site.email}`} className={styles.email}>
            {localPart}
            <span className={styles.emailDomain}>@{domain}</span>
          </a>

          <p className={styles.blurb}>{contact.blurb}</p>
        </div>

        <div className={styles.links}>
          {socialLinks.map(({ label, href }) => (
            <ButtonLink
              key={href}
              href={href}
              variant="subtle"
              size="md"
              target="_blank"
              rel="noopener noreferrer"
            >
              {label} <span className={styles.linkArrow}>↗</span>
            </ButtonLink>
          ))}
          <ButtonLink
            href={site.resumeFile}
            variant="primary"
            size="md"
            download={site.resumeDownloadName}
          >
            RESUME.PDF ↓
          </ButtonLink>
        </div>
      </Reveal>
    </Section>
  );
}
