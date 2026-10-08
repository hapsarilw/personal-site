export type StackGroup = {
  title: string;
  items: string[];
};

/**
 * Kept to five groups so the grid fills a single row on desktop. Only what
 * current frontend and full-stack roles ask for; the long tail lives in the
 * project write-ups.
 */
export const stackGroups: StackGroup[] = [
  {
    title: 'FRONTEND',
    items: ['TypeScript', 'React 19', 'Next.js 16', 'Tailwind CSS', 'Three.js & R3F', 'SignalR'],
  },
  {
    title: 'STATE & FORMS',
    items: ['TanStack Query', 'Redux Toolkit', 'Zustand', 'React Hook Form', 'Zod'],
  },
  {
    title: 'BACKEND & AI',
    items: ['Node.js', 'NestJS', 'PostgreSQL', 'Prisma', 'REST & JWT auth', 'LLM integration'],
  },
  {
    title: 'TESTING & QUALITY',
    items: ['Vitest & RTL', 'Playwright', 'Storybook', 'WCAG 2.2 accessibility'],
  },
  {
    title: 'CLOUD & DELIVERY',
    items: ['Docker', 'AWS', 'GitHub Actions', 'CI/CD pipelines', 'Vercel'],
  },
];
