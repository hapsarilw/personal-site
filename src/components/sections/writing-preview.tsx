import Link from 'next/link';

import { Section } from '@/components/layout/section';
import { Reveal } from '@/components/motion/reveal';
import { SectionHeading } from '@/components/ui/section-heading';
import { PostList } from '@/components/writing/post-list';
import { pluralise } from '@/lib/format';
import type { PostMeta } from '@/lib/types';

import styles from './writing-preview.module.css';

type WritingPreviewProps = {
  posts: PostMeta[];
  totalCount: number;
};

export function WritingPreview({ posts, totalCount }: WritingPreviewProps) {
  return (
    <Section id="writing">
      <SectionHeading index="04" title="Writing" meta={pluralise(totalCount, 'POST')} tight />

      <Reveal>
        <PostList posts={posts} />
        <Link href="/writing" className={styles.action}>
          READ ALL POSTS <span aria-hidden="true">→</span>
        </Link>
      </Reveal>
    </Section>
  );
}
