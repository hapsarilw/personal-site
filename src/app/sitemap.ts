import type { MetadataRoute } from 'next';

import { site } from '@/content/site';
import { getPublishedPosts } from '@/lib/posts';

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPublishedPosts();

  return [
    { url: site.url, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    {
      url: `${site.url}/writing`,
      lastModified: posts[0] ? new Date(posts[0].updatedAt) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...posts.map((post) => ({
      url: `${site.url}/writing/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    })),
  ];
}
