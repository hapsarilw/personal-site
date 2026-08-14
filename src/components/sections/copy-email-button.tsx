'use client';

import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';

import styles from './copy-email-button.module.css';

export function CopyEmailButton({ email }: { email: string }) {
  const { hasCopied, copy } = useCopyToClipboard();

  return (
    <button
      type="button"
      className={`${styles.button} ${hasCopied ? styles.copied : ''}`.trim()}
      onClick={() => void copy(email)}
    >
      {hasCopied ? 'COPIED' : 'COPY ADDRESS'}
      <span className="visually-hidden" aria-live="polite">
        {hasCopied ? `${email} copied to clipboard` : ''}
      </span>
    </button>
  );
}
