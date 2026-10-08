export type ProjectMetric = {
  label: string;
  value: string;
};

/**
 * Extra material for a project. A video or PDF opens in a modal on the card;
 * any other href (a post, a page) is an ordinary link.
 */
export type ProjectLink = {
  label: string;
  href: string;
  /** Still shown before a video plays. */
  poster?: string;
};

export type Project = {
  id: string;
  meta: string;
  title: string;
  description: string;
  metrics: ProjectMetric[];
  tech: string[];
  previewUrl?: string;
  links?: ProjectLink[];
};

export const projects: Project[] = [
  {
    id: '01',
    meta: 'LEAD FRONTEND · 2022–NOW',
    title: 'Crew communication portal',
    description:
      'Lead frontend developer on a vessel crew portal at OneByOne Logistical. Real-time group chat on SignalR with optimistic rendering, live typing, edit, unread-count sync  sub-second, no polling. Spanning 350+ modules across 15 feature areas.',
    metrics: [
      { label: 'commits authored', value: '391 of 576' },
      { label: 'UI system', value: '48 components' },
    ],
    tech: ['React 19', 'TypeScript', 'SignalR', 'Redux Toolkit', 'Storybook'],
  },
  {
    id: '02',
    meta: 'SOLO BUILD · SPEC TO DEPLOY',
    title: 'Stowline 3D stowage planner',
    description:
      'A desktop planner for placing containers on an 8,500 TEU ship, in a 3D view and a 2D bay grid kept in sync. Six stowage rules run on every move, so a bad drop is refused with the reason before it lands. Stability previews while you drag, and plans move from Draft to In review to Approved.',
    metrics: [
      { label: '3D view, 10k containers', value: '10 draw calls' },
      { label: 'rule check per move', value: '1.6ms at 10k' },
      { label: 'tests', value: '569 unit · 127 e2e' },
    ],
    tech: [
      'React 19',
      'TypeScript',
      'React Three Fiber',
      'Zustand',
      'Web Worker',
      'MSW + IndexedDB',
      'Playwright',
    ],
    previewUrl: 'https://stowline.vercel.app/plans',
    links: [
      {
        label: 'Walkthrough',
        href: '/assets/stowline/walkthrough.mp4',
        poster: '/assets/stowline/walkthrough-poster.jpg',
      },
      { label: 'Pitch deck', href: '/assets/stowline/stowline-pitch.pdf' },
      { label: 'Logic & ERD', href: '/assets/stowline/stowline-system-logic.pdf' },
      { label: 'Build notes', href: '/writing/building-stowline' },
    ],
  },
  {
    id: '03',
    meta: 'SOLO BUILD',
    title: 'OptiRoute dispatcher dashboard',
    description:
      'A logistics platform I built end to end, modelling a four-stage pipeline: ingestion, AI route optimisation, fleet dispatch, live telemetry. Nearest-driver assignment by Haversine distance, off-route alerts on Mapbox GL, role-based access.',
    metrics: [
      { label: 'manifest grid', value: '10k rows, ~25 in DOM' },
      { label: 'filter + sort latency', value: 'under 200ms' },
    ],
    tech: ['Next.js 16', 'TypeScript', 'Mapbox GL', 'TanStack Virtual', 'Vitest'],
    previewUrl: 'https://opti-route-mauve.vercel.app/',
  },
  {
    id: '04',
    meta: 'FULL-STACK · IN PROGRESS',
    title: 'Ecommerce store  NestJS + Next.js',
    description:
      'A scalable backend API and storefront built the way production systems are: modular NestJS services, Prisma over PostgreSQL, JWT auth with role guards, containerised and shipped through CI/CD to AWS.',
    metrics: [
      { label: 'API surface', value: 'modular NestJS' },
      { label: 'deploy', value: 'Docker → CI/CD → AWS' },
    ],
    tech: ['NestJS', 'Prisma', 'PostgreSQL', 'JWT', 'Docker', 'AWS', 'Sass'],
  },
];
