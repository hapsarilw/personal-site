import { ButtonLink } from '@/components/ui/button';

import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <main className={styles.main}>
      <p className={styles.code}>ERROR 404</p>
      <h1 className={styles.title}>That page does not exist.</h1>
      <p className={styles.body}>
        The link may be out of date, or the post may still be a draft. Everything published
        lives in the writing index.
      </p>
      <div className={styles.actions}>
        <ButtonLink href="/" variant="primary" size="lg">
          Back home
        </ButtonLink>
        <ButtonLink href="/writing" variant="outline" size="lg">
          All posts
        </ButtonLink>
      </div>
    </main>
  );
}
