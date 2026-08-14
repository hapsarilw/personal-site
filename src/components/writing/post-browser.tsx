'use client';

import { useId, useMemo, useState } from 'react';

import { PostList } from '@/components/writing/post-list';
import type { PostMeta } from '@/lib/types';

import styles from './post-browser.module.css';

const ALL_TAGS = 'All';

type PostBrowserProps = {
  posts: PostMeta[];
  tags: string[];
  pageSize?: number;
};

function matchesQuery(post: PostMeta, query: string): boolean {
  if (!query) return true;
  const haystack = `${post.title} ${post.excerpt} ${post.tags.join(' ')}`.toLowerCase();
  return haystack.includes(query);
}

/**
 * Search, tag filter and pagination over a statically supplied post list.
 *
 * State is local rather than in the URL: the corpus is small, every post has its
 * own shareable route, and keeping it local avoids a Suspense boundary around
 * `useSearchParams` for a control that nobody deep-links to.
 */
export function PostBrowser({ posts, tags, pageSize = 3 }: PostBrowserProps) {
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string>(ALL_TAGS);
  const [page, setPage] = useState(1);
  const searchId = useId();

  const filtered = useMemo(() => {
    const normalisedQuery = query.trim().toLowerCase();
    return posts.filter(
      (post) =>
        (activeTag === ALL_TAGS || post.tags.includes(activeTag)) &&
        matchesQuery(post, normalisedQuery),
    );
  }, [posts, query, activeTag]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const firstIndex = (currentPage - 1) * pageSize;
  const visible = filtered.slice(firstIndex, firstIndex + pageSize);

  const resetFilters = () => {
    setQuery('');
    setActiveTag(ALL_TAGS);
    setPage(1);
  };

  const selectTag = (tag: string) => {
    setActiveTag(tag);
    setPage(1);
  };

  return (
    <>
      <div className={styles.controls}>
        <div className={styles.search}>
          <span className={styles.searchMark} aria-hidden="true">
            /
          </span>
          <label className="visually-hidden" htmlFor={searchId}>
            Search posts and tags
          </label>
          <input
            id={searchId}
            type="search"
            className={styles.searchInput}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search posts and tags"
          />
        </div>

        <div className={styles.chips}>
          {[ALL_TAGS, ...tags].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => selectTag(tag)}
              aria-pressed={activeTag === tag}
              className={`${styles.chip} ${activeTag === tag ? styles.chipActive : ''}`.trim()}
            >
              {tag === ALL_TAGS ? 'ALL' : tag.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <PostList
        posts={visible}
        emptyState={
          <>
            No posts match that.{' '}
            <button type="button" className={styles.clear} onClick={resetFilters}>
              Clear filters
            </button>
          </>
        }
      />

      {pageCount > 1 ? (
        <nav className={styles.pager} aria-label="Post pagination">
          <span className={styles.range}>
            SHOWING {firstIndex + 1}–{Math.min(filtered.length, firstIndex + pageSize)} OF{' '}
            {filtered.length}
          </span>

          <div className={styles.pages}>
            <button
              type="button"
              className={styles.page}
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← PREV
            </button>

            {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
              <button
                key={number}
                type="button"
                aria-current={number === currentPage ? 'page' : undefined}
                className={`${styles.page} ${number === currentPage ? styles.pageActive : ''}`.trim()}
                onClick={() => setPage(number)}
              >
                {number}
              </button>
            ))}

            <button
              type="button"
              className={styles.page}
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === pageCount}
            >
              NEXT →
            </button>
          </div>
        </nav>
      ) : null}
    </>
  );
}
