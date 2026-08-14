import { About } from '@/components/sections/about';
import { Contact } from '@/components/sections/contact';
import { Experience } from '@/components/sections/experience';
import { Hero } from '@/components/sections/hero';
import { LookingFor } from '@/components/sections/looking-for';
import { SelectedWork } from '@/components/sections/selected-work';
import { Stack } from '@/components/sections/stack';
import { WritingPreview } from '@/components/sections/writing-preview';
import { getPublishedPosts } from '@/lib/posts';

import styles from './page.module.css';

const PREVIEW_COUNT = 3;

export default function HomePage() {
  const posts = getPublishedPosts();

  return (
    <main className={styles.main}>
      <Hero />
      <SelectedWork />
      <Experience />
      <Stack />
      <WritingPreview posts={posts.slice(0, PREVIEW_COUNT)} totalCount={posts.length} />
      <About />
      <LookingFor />
      <Contact />
    </main>
  );
}
