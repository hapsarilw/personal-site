import Link from 'next/link';
import type { ReactNode } from 'react';

import { Tag } from '@/components/ui/tag';
import { formatDate } from '@/lib/format';
import type { PostMeta } from '@/lib/types';

import styles from './post-list.module.css';

type PostListProps = {
  posts: PostMeta[];
  /** Shown in place of the rows when `posts` is empty. */
  emptyState?: ReactNode;
};

export function PostList({ posts, emptyState }: PostListProps) {
  return (
    <div className={styles.list}>
      {posts.map((post) => (
        <Link key={post.slug} href={`/writing/${post.slug}`} className={styles.row}>
          <div className={styles.main}>
            <div className={styles.meta}>
              <span>{formatDate(post.publishedAt)}</span>
              <span className={styles.dot} aria-hidden="true" />
              <span>{post.readingMinutes} MIN READ</span>
            </div>

            <h3 className={styles.title}>{post.title}</h3>

            <div className={styles.tags}>
              {post.tags.map((tag) => (
                <Tag key={tag} size="sm">
                  {tag}
                </Tag>
              ))}
            </div>
          </div>

          <div className={styles.aside}>
            <p className={styles.excerpt}>{post.excerpt}</p>
            <span className={styles.arrow} aria-hidden="true">
              →
            </span>
          </div>
        </Link>
      ))}

      {posts.length === 0 && emptyState ? (
        <div className={styles.empty}>{emptyState}</div>
      ) : null}
    </div>
  );
}
