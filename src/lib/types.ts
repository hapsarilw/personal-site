export type PostStatus = 'published' | 'draft';

/** Everything needed to render a post in a list — no body, so it stays cheap to pass to the client. */
export type PostMeta = {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  status: PostStatus;
  publishedAt: string;
  updatedAt: string;
  cover?: string;
  readingMinutes: number;
};

export type Post = PostMeta & {
  /** Raw markdown source. Rendered to HTML on the server only. */
  body: string;
};
