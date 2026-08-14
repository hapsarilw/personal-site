import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ButtonLink } from '@/components/ui/button';
import { Tag } from '@/components/ui/tag';
import { contact, site } from '@/content/site';
import { formatDate } from '@/lib/format';
import { renderMarkdown } from '@/lib/markdown';
import { getPostBySlug, getPublishedSlugs } from '@/lib/posts';

import styles from './page.module.css';
import '@/app/prose.css';

type PostPageProps = {
  params: Promise<{ slug: string }>;
};

/** Prerenders every published post at build time. */
export function generateStaticParams() {
  return getPublishedSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) return { title: 'Post not found' };

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/writing/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      tags: [...post.tags],
      url: `${site.url}/writing/${post.slug}`,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  // Rendered on the server, so the markdown parser never reaches the browser.
  const html = renderMarkdown(post.body);

  return (
    <main className={styles.page}>
      <div className={styles.bar}>
        <div className={styles.barInner}>
          <Link href="/writing" className={styles.back}>
            <span aria-hidden="true">←</span> ALL POSTS
          </Link>
          <span className={styles.meta}>
            {formatDate(post.publishedAt)} · {post.readingMinutes} MIN
          </span>
        </div>
      </div>

      <article className={styles.article}>
        <div className={styles.tags}>
          {post.tags.map((tag) => (
            <Tag key={tag} accent>
              {tag}
            </Tag>
          ))}
        </div>

        <h1 className={styles.title}>{post.title}</h1>
        <p className={styles.excerpt}>{post.excerpt}</p>

        {post.cover ? (
          <div
            role="img"
            aria-label={`Cover image for ${post.title}`}
            className={styles.cover}
            style={{ backgroundImage: `url("${post.cover}")` }}
          />
        ) : null}

        <div className={styles.divider} />

        {/* Trusted input: the HTML is produced by our own renderer from repo content. */}
        <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />

        <footer className={styles.footer}>
          <span className={styles.footerText}>{contact.readerCta}</span>
          <ButtonLink href={`mailto:${site.email}`} variant="primary" size="md">
            Get in touch
          </ButtonLink>
        </footer>
      </article>
    </main>
  );
}
