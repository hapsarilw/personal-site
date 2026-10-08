'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';

import { ButtonLink } from '@/components/ui/button';

import styles from './project-media-link.module.css';

type ProjectMediaLinkProps = {
  href: string;
  label: string;
  /** Dialog heading and accessible name, e.g. "Stowline · Pitch deck". */
  title: string;
  poster?: string;
};

const VIDEO_FILE = /\.(mp4|webm)$/i;

/**
 * A project file (video or PDF) that opens in a modal instead of a new tab.
 *
 * It stays a real link: modifier or middle clicks still open the file in a new
 * tab, and without JavaScript it is an ordinary link. The media is only mounted
 * while the dialog is open, so a 5 MB video is never fetched with the page and
 * playback stops on close.
 */
export function ProjectMediaLink({ href, label, title, poster }: ProjectMediaLinkProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const isVideo = VIDEO_FILE.test(href);

  // `showModal` gives focus trapping, Esc to close, an inert page behind and
  // focus returned to this button on close  no hand-rolled focus management.
  useEffect(() => {
    if (open) dialogRef.current?.showModal();
  }, [open]);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    setOpen(true);
  };

  const close = () => dialogRef.current?.close();

  // The panel fills the dialog, so a click that lands on the dialog itself is
  // a click on the backdrop.
  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) close();
  };

  return (
    <>
      <ButtonLink
        href={href}
        variant="subtle"
        size="sm"
        target="_blank"
        rel="noopener noreferrer"
        aria-haspopup="dialog"
        onClick={handleClick}
      >
        {label} <span className={styles.hint}>{isVideo ? 'VIDEO' : 'PDF'}</span>
      </ButtonLink>

      {open ? (
        <dialog
          ref={dialogRef}
          className={styles.dialog}
          aria-label={title}
          onClose={() => setOpen(false)}
          onClick={handleBackdropClick}
        >
          <div className={styles.panel}>
            <header className={styles.header}>
              <h2 className={styles.title}>{title}</h2>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.external}
              >
                Open in new tab <span aria-hidden="true">↗</span>
              </a>
              <button type="button" className={styles.close} onClick={close} aria-label="Close">
                ×
              </button>
            </header>

            {isVideo ? (
              <video
                className={styles.video}
                src={href}
                poster={poster}
                controls
                autoPlay
                playsInline
              />
            ) : (
              <iframe className={styles.document} src={`${href}#view=FitH&navpanes=0`} title={title} />
            )}
          </div>
        </dialog>
      ) : null}
    </>
  );
}
