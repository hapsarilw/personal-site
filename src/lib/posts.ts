import 'server-only';

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

import { readingMinutes } from '@/lib/format';
import type { Post, PostMeta, PostStatus } from '@/lib/types';

const POSTS_DIR = join(process.cwd(), 'src', 'content', 'posts');

/**
 * Posts are read from disk once per build. `cache` is unnecessary here  module
 * scope already memoises it for the lifetime of the process, and in production
 * every page that uses it is statically generated.
 */
const allPosts: Post[] = loadPosts();

function loadPosts(): Post[] {
  return readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith('.md'))
    .map(parsePostFile)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

function parsePostFile(filename: string): Post {
  const slug = filename.replace(/\.md$/, '');
  const source = readFileSync(join(POSTS_DIR, filename), 'utf8');
  const { data, content } = matter(source);

  return {
    slug,
    title: requireString(data.title, filename, 'title'),
    excerpt: requireString(data.excerpt, filename, 'excerpt'),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    status: parseStatus(data.status, filename),
    publishedAt: requireDate(data.publishedAt, filename, 'publishedAt'),
    updatedAt: requireDate(data.updatedAt ?? data.publishedAt, filename, 'updatedAt'),
    cover: typeof data.cover === 'string' && data.cover ? data.cover : undefined,
    readingMinutes: readingMinutes(content),
    body: content,
  };
}

function requireString(value: unknown, file: string, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`[posts] ${file}: frontmatter field "${field}" is required.`);
  }
  return value;
}

function parseStatus(value: unknown, file: string): PostStatus {
  if (value === 'published' || value === 'draft') return value;
  throw new Error(`[posts] ${file}: "status" must be "published" or "draft".`);
}

/** gray-matter turns unquoted YAML dates into `Date`, quoted ones stay strings. */
function requireDate(value: unknown, file: string, field: string): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }
  throw new Error(`[posts] ${file}: "${field}" must be an ISO date.`);
}

function toMeta({ body, ...meta }: Post): PostMeta {
  return meta;
}

/** Published posts only  drafts stay in the repo but never reach the site. */
export function getPublishedPosts(): PostMeta[] {
  return allPosts.filter((post) => post.status === 'published').map(toMeta);
}

export function getRecentPosts(limit: number): PostMeta[] {
  return getPublishedPosts().slice(0, limit);
}

export function getPostBySlug(slug: string): Post | undefined {
  return allPosts.find((post) => post.slug === slug && post.status === 'published');
}

/** Slugs for `generateStaticParams`, so every post is prerendered at build time. */
export function getPublishedSlugs(): string[] {
  return getPublishedPosts().map((post) => post.slug);
}

export function getAllTags(): string[] {
  const tags = new Set<string>();
  for (const post of getPublishedPosts()) {
    for (const tag of post.tags) tags.add(tag);
  }
  return [...tags].sort();
}
