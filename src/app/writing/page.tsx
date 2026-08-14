import type { Metadata } from 'next';
import Link from 'next/link';

import { PostBrowser } from '@/components/writing/post-browser';
import { getAllTags, getPublishedPosts } from '@/lib/posts';

import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Writing',
  description:
    'Engineering notes on system design, real-time frontend, and the trade-offs behind them.',
};

export default function WritingIndexPage() {
  const posts = getPublishedPosts();
  const tags = getAllTags();

  return (
    <main className={styles.main}>
      <Link href="/#writing" className={styles.back}>
        <span aria-hidden="true">←</span> BACK TO SITE
      </Link>

      <h1 className={styles.title}>Writing</h1>
      <p className={styles.intro}>
        Notes on system design, real-time frontend, and the trade-offs I had to argue for out
        loud. Mostly drawn from shipping software where being wrong has a physical cost.
      </p>

      <PostBrowser posts={posts} tags={tags} pageSize={5} />
    </main>
  );
}
